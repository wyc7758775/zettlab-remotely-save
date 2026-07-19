import { Notice, Plugin } from "obsidian";
import type { InternalDBs } from "./localdb";
import type { RemotelySavePluginSettings, SyncTriggerSourceType } from "./baseTypes";
import { messyConfigToNormal, normalConfigToMessy } from "./configPersist";
import { getClient } from "./fsGetter";
import { FakeFsLocal } from "./fsLocal";
import { PlainRemoteFs } from "./fsPlain";
import { t } from "./i18n";
import {
  getLastFailedSyncTimeByVault,
  getLastSuccessSyncTimeByVault,
  prepareDBs,
  upsertLastFailedSyncTimeByVault,
  upsertLastSuccessSyncTimeByVault,
} from "./localdb";
import { ZettlabSyncSettingTab } from "./settings";
import { DEFAULT_SETTINGS, normalizeSettings } from "./settingsModel";
import { syncer } from "./sync";
import { getSyncOverview, type SyncOverview } from "./syncOverview";

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export default class ZettlabSyncPlugin extends Plugin {
  settings: RemotelySavePluginSettings = DEFAULT_SETTINGS;
  db!: InternalDBs;
  vaultRandomID = "";
  private isSyncing = false;
  private autoSyncTimer?: number;
  private saveSyncTimer?: number;
  private statusBar?: HTMLElement;
  private lastSuccessfulSyncAt?: number;
  private lastFailedSyncAt?: number;

  async onload(): Promise<void> {
    await this.loadSettings();
    const prepared = await prepareDBs(
      this.app.vault.getName(),
      this.settings.vaultRandomID ?? "",
      "default"
    );
    this.db = prepared.db;
    this.vaultRandomID = prepared.vaultRandomID;
    this.settings.vaultRandomID = prepared.vaultRandomID;
    const [lastSuccessfulSyncAt, lastFailedSyncAt] = await Promise.all([
      getLastSuccessSyncTimeByVault(this.db, this.vaultRandomID),
      getLastFailedSyncTimeByVault(this.db, this.vaultRandomID),
    ]);
    this.lastSuccessfulSyncAt =
      typeof lastSuccessfulSyncAt === "number" ? lastSuccessfulSyncAt : undefined;
    this.lastFailedSyncAt =
      typeof lastFailedSyncAt === "number" ? lastFailedSyncAt : undefined;

    this.statusBar = this.addStatusBarItem();
    this.setStatus(t("statusReady"));
    this.addSettingTab(new ZettlabSyncSettingTab(this));
    this.addCommand({
      id: "sync-now",
      name: t("commandSyncNow"),
      callback: () => void this.syncRun("manual"),
    });
    this.addCommand({
      id: "test-webdav-connection",
      name: t("commandTestConnection"),
      callback: () => void this.testConnection(),
    });
    this.addRibbonIcon("refresh-cw", t("ribbonSync"), () => {
      void this.syncRun("manual");
    });
    this.registerEvent(
      this.app.vault.on("modify", () => {
        this.scheduleSyncAfterSave();
      })
    );
    this.configureAutoSync();
  }

  onunload(): void {
    if (this.autoSyncTimer !== undefined) window.clearInterval(this.autoSyncTimer);
    if (this.saveSyncTimer !== undefined) window.clearTimeout(this.saveSyncTimer);
  }

  async loadSettings(): Promise<void> {
    const persisted = messyConfigToNormal(await this.loadData());
    this.settings = normalizeSettings(persisted);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(normalConfigToMessy(this.settings));
    this.configureAutoSync();
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      new Notice(t("connectFirst"));
      return false;
    }
    const remote = getClient(this.settings, this.app.vault.getName(), async () => {
      await this.saveSettings();
    });
    let failure = "";
    const connected = await remote.checkConnect((error: unknown) => {
      failure = errorMessage(error);
    });
    new Notice(
      connected
        ? t("connectionSuccess")
        : t("connectionFailed", { reason: failure || t("unknownError") })
    );
    return connected;
  }

  async syncRun(source: SyncTriggerSourceType): Promise<void> {
    if (this.isSyncing) {
      if (source === "manual") new Notice(t("syncInProgress"));
      return;
    }
    if (!this.isConfigured()) {
      if (source === "manual") {
        new Notice(t("connectFirst"));
      }
      return;
    }

    const local = new FakeFsLocal(
      this.app.vault,
      this.settings.syncConfigDir,
      false,
      this.app.vault.configDir,
      this.manifest.id,
      undefined,
      this.settings.deleteToWhere
    );
    const remote = getClient(this.settings, this.app.vault.getName(), async () => {
      await this.saveSettings();
    });
    const plainRemote = new PlainRemoteFs(remote);
    let failed = "";
    try {
      await syncer(
        local,
        remote,
        plainRemote,
        undefined,
        this.db,
        source,
        "default",
        this.vaultRandomID,
        this.app.vault.configDir,
        this.settings,
        (threshold: number, changed: number, total: number) =>
          `Stopped: ${changed}/${total} files would change, above the ${threshold}% safety limit.`,
        (isSyncing) => {
          this.isSyncing = isSyncing;
          this.setStatus(isSyncing ? t("statusSyncing") : t("statusReady"));
        },
        undefined,
        async (_trigger, error) => {
          failed = errorMessage(error);
          console.error("Zettlab Sync failed", error);
        }
      );
    } catch (error) {
      failed = errorMessage(error);
      console.error("Zettlab Sync failed", error);
    } finally {
      this.isSyncing = false;
      await plainRemote.closeResources();
    }
    if (failed !== "") {
      this.lastFailedSyncAt = Date.now();
      await upsertLastFailedSyncTimeByVault(
        this.db,
        this.vaultRandomID,
        this.lastFailedSyncAt
      );
      this.setStatus(t("statusSyncFailed"));
      new Notice(t("syncFailed", { reason: failed }));
    } else {
      this.lastSuccessfulSyncAt = Date.now();
      await upsertLastSuccessSyncTimeByVault(
        this.db,
        this.vaultRandomID,
        this.lastSuccessfulSyncAt
      );
      if (source === "manual") new Notice(t("syncCompleted"));
    }
  }

  isConfigured(): boolean {
    return /^https?:\/\/.+/.test(this.settings.webdav.address);
  }

  getSyncOverview(): SyncOverview {
    return getSyncOverview({
      configured: this.isConfigured(),
      lastSuccessfulSyncAt: this.lastSuccessfulSyncAt,
      lastFailedSyncAt: this.lastFailedSyncAt,
    });
  }

  private configureAutoSync(): void {
    if (this.autoSyncTimer !== undefined) {
      window.clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = undefined;
    }
    if (this.settings.autoRunEveryMilliseconds > 0) {
      this.autoSyncTimer = window.setInterval(() => {
        void this.syncRun("auto");
      }, this.settings.autoRunEveryMilliseconds);
    }
  }

  private scheduleSyncAfterSave(): void {
    if (this.settings.syncOnSaveAfterMilliseconds <= 0 || this.isSyncing) return;
    if (this.saveSyncTimer !== undefined) window.clearTimeout(this.saveSyncTimer);
    this.saveSyncTimer = window.setTimeout(() => {
      this.saveSyncTimer = undefined;
      void this.syncRun("auto_sync_on_save");
    }, this.settings.syncOnSaveAfterMilliseconds);
  }

  private setStatus(text: string): void {
    if (this.settings.enableStatusBarInfo && this.statusBar !== undefined) {
      this.statusBar.textContent = `Zettlab Memo: ${text}`;
    }
  }
}
