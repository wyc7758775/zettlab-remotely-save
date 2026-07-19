import { Notice, PluginSettingTab, Setting } from "obsidian";
import type {
  ConflictActionType,
  RemotelySavePluginSettings,
  WebdavAuthType,
  WebdavDepthType,
} from "./baseTypes";
import type ZettlabSyncPlugin from "./main";
export { DEFAULT_SETTINGS, normalizeSettings } from "./settingsModel";

const saveText = async (
  plugin: ZettlabSyncPlugin,
  update: () => void
): Promise<void> => {
  update();
  await plugin.saveSettings();
};

export class ZettlabSyncSettingTab extends PluginSettingTab {
  constructor(private readonly plugin: ZettlabSyncPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Zettlab Sync" });
    containerEl.createEl("p", {
      text: "WebDAV-only sync. Files remain plaintext on your NAS so Zettlab can index your Markdown.",
    });

    new Setting(containerEl)
      .setName("WebDAV address")
      .setDesc("For example: https://nas.example.com/dav")
      .addText((text) =>
        text
          .setPlaceholder("https://…")
          .setValue(this.plugin.settings.webdav.address)
          .onChange(async (value) =>
            saveText(this.plugin, () => {
              this.plugin.settings.webdav.address = value.trim();
            })
          )
      );
    new Setting(containerEl).setName("Username").addText((text) =>
      text
        .setValue(this.plugin.settings.webdav.username)
        .onChange(async (value) =>
          saveText(this.plugin, () => {
            this.plugin.settings.webdav.username = value;
          })
        )
    );
    new Setting(containerEl).setName("Password").addText((text) => {
      text.inputEl.type = "password";
      return text
        .setValue(this.plugin.settings.webdav.password)
        .onChange(async (value) =>
          saveText(this.plugin, () => {
            this.plugin.settings.webdav.password = value;
          })
        );
    });
    new Setting(containerEl)
      .setName("Authentication")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("basic", "Basic")
          .addOption("digest", "Digest")
          .setValue(this.plugin.settings.webdav.authType)
          .onChange(async (value) =>
            saveText(this.plugin, () => {
              this.plugin.settings.webdav.authType = value as WebdavAuthType;
            })
          )
      );
    new Setting(containerEl)
      .setName("Test connection")
      .setDesc("Creates and deletes a small temporary test file.")
      .addButton((button) =>
        button.setButtonText("Test").onClick(async () => {
          await this.plugin.testConnection();
        })
      );

    containerEl.createEl("h3", { text: "Sync" });
    new Setting(containerEl)
      .setName("Automatic sync interval")
      .setDesc("Minutes. Set 0 to disable periodic sync.")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.autoRunEveryMilliseconds / 60000))
          .onChange(async (value) => {
            const minutes = Number(value);
            if (!Number.isFinite(minutes) || minutes < 0) {
              new Notice("Enter a non-negative number of minutes.");
              return;
            }
            await saveText(this.plugin, () => {
              this.plugin.settings.autoRunEveryMilliseconds = minutes * 60000;
            });
          })
      );
    new Setting(containerEl)
      .setName("Sync after save")
      .setDesc("Seconds. Set 0 to disable.")
      .addText((text) =>
        text
          .setValue(
            this.plugin.settings.syncOnSaveAfterMilliseconds > 0
              ? String(this.plugin.settings.syncOnSaveAfterMilliseconds / 1000)
              : "0"
          )
          .onChange(async (value) => {
            const seconds = Number(value);
            if (!Number.isFinite(seconds) || seconds < 0) {
              new Notice("Enter a non-negative number of seconds.");
              return;
            }
            await saveText(this.plugin, () => {
              this.plugin.settings.syncOnSaveAfterMilliseconds =
                seconds > 0 ? seconds * 1000 : -1;
            });
          })
      );
    new Setting(containerEl)
      .setName("Conflict handling")
      .setDesc("Choose how two independently changed versions are resolved.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("keep_newer", "Keep newer")
          .addOption("keep_larger", "Keep larger")
          .setValue(this.plugin.settings.conflictAction)
          .onChange(async (value) =>
            saveText(this.plugin, () => {
              this.plugin.settings.conflictAction = value as ConflictActionType;
            })
          )
      );

    containerEl.createEl("details", undefined, (details) => {
      details.createEl("summary", { text: "Advanced" });
      new Setting(details)
        .setName("Remote folder")
        .setDesc("Empty uses the current vault name.")
        .addText((text) =>
          text
            .setValue(this.plugin.settings.webdav.remoteBaseDir ?? "")
            .onChange(async (value) =>
              saveText(this.plugin, () => {
                this.plugin.settings.webdav.remoteBaseDir = value.trim();
              })
            )
        );
      new Setting(details).setName("WebDAV listing depth").addDropdown((dropdown) =>
        dropdown
          .addOption("manual_1", "Depth 1")
          .addOption("manual_infinity", "Depth infinity")
          .setValue(this.plugin.settings.webdav.depth ?? "manual_1")
          .onChange(async (value) =>
            saveText(this.plugin, () => {
              this.plugin.settings.webdav.depth = value as WebdavDepthType;
            })
          )
      );
      new Setting(details)
        .setName("Skip files larger than")
        .setDesc("Megabytes. Set 0 to sync all file sizes.")
        .addText((text) =>
          text
            .setValue(
              this.plugin.settings.skipSizeLargerThan > 0
                ? String(this.plugin.settings.skipSizeLargerThan / 1024 / 1024)
                : "0"
            )
            .onChange(async (value) => {
              const megabytes = Number(value);
              if (!Number.isFinite(megabytes) || megabytes < 0) {
                new Notice("Enter a non-negative size.");
                return;
              }
              await saveText(this.plugin, () => {
                this.plugin.settings.skipSizeLargerThan =
                  megabytes > 0 ? megabytes * 1024 * 1024 : -1;
              });
            })
        );
      new Setting(details)
        .setName("Ignore path patterns")
        .setDesc("One regular expression per line.")
        .addTextArea((text) =>
          text
            .setValue(this.plugin.settings.ignorePaths.join("\n"))
            .onChange(async (value) =>
              saveText(this.plugin, () => {
                this.plugin.settings.ignorePaths = value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean);
              })
            )
        );
    });
  }
}
