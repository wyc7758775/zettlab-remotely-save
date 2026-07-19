import { Notice, PluginSettingTab, Setting } from "obsidian";
import type {
  ConflictActionType,
  WebdavAuthType,
  WebdavDepthType,
} from "./baseTypes";
import type ZettlabSyncPlugin from "./main";
import { getSyncScheduleSummary } from "./syncOverview";
export { DEFAULT_SETTINGS, normalizeSettings } from "./settingsModel";

const saveText = async (
  plugin: ZettlabSyncPlugin,
  update: () => void
): Promise<void> => {
  update();
  await plugin.saveSettings();
};

const formatTime = (millis: number | undefined): string => {
  if (millis === undefined) return "尚未同步";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(millis));
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
      text: "同步状态会显示在这里。WebDAV 凭证和同步细节默认收起，仅在自动接入不可用或排障时修改。",
    });

    const overview = this.plugin.getSyncOverview();
    new Setting(containerEl)
      .setName("Zettlab 接入状态")
      .setDesc(`${overview.title}：${overview.description}`);
    new Setting(containerEl)
      .setName("最近同步")
      .setDesc(
        overview.state === "needs-attention"
          ? `最近失败：${formatTime(overview.lastSyncAt)}`
          : `上次完成：${formatTime(overview.lastSyncAt)}`
      );
    new Setting(containerEl)
      .setName("同步策略")
      .setDesc(getSyncScheduleSummary(this.plugin.settings.autoRunEveryMilliseconds));

    let manualSettings!: HTMLDetailsElement;
    new Setting(containerEl)
      .setName("同步操作")
      .setDesc("无需修改配置即可手动同步或检测当前连接。")
      .addButton((button) =>
        button.setButtonText("立即同步").setCta().onClick(async () => {
          await this.plugin.syncRun("manual");
          this.display();
        })
      )
      .addButton((button) =>
        button.setButtonText("检测连接").onClick(async () => {
          await this.plugin.testConnection();
          this.display();
        })
      )
      .addButton((button) =>
        button.setButtonText("手动设置").onClick(() => {
          manualSettings.open = true;
          manualSettings.scrollIntoView({ block: "start" });
        })
      );

    manualSettings = containerEl.createEl("details", {
      cls: "zettlab-sync-manual-settings",
    });
    manualSettings.createEl("summary", { text: "手动设置与故障排查" });
    manualSettings.createEl("p", {
      text: "自动接入完成前、迁移旧配置或排障时，才需要填写下面内容。",
    });

    new Setting(manualSettings)
      .setName("WebDAV 地址")
      .setDesc("例如：https://nas.example.com/dav")
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
    new Setting(manualSettings).setName("用户名").addText((text) =>
      text.setValue(this.plugin.settings.webdav.username).onChange(async (value) =>
        saveText(this.plugin, () => {
          this.plugin.settings.webdav.username = value;
        })
      )
    );
    new Setting(manualSettings).setName("密码").addText((text) => {
      text.inputEl.type = "password";
      return text.setValue(this.plugin.settings.webdav.password).onChange(async (value) =>
        saveText(this.plugin, () => {
          this.plugin.settings.webdav.password = value;
        })
      );
    });
    new Setting(manualSettings)
      .setName("鉴权类型")
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
    new Setting(manualSettings)
      .setName("远程文件夹")
      .setDesc("留空时使用当前仓库名称。")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.webdav.remoteBaseDir ?? "")
          .onChange(async (value) =>
            saveText(this.plugin, () => {
              this.plugin.settings.webdav.remoteBaseDir = value.trim();
            })
          )
      );
    new Setting(manualSettings)
      .setName("WebDAV 列表深度")
      .addDropdown((dropdown) =>
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
    new Setting(manualSettings)
      .setName("自定义请求头")
      .setDesc("每行一个，格式为 Header: Value。")
      .addTextArea((text) =>
        text
          .setValue(this.plugin.settings.webdav.customHeaders ?? "")
          .onChange(async (value) =>
            saveText(this.plugin, () => {
              this.plugin.settings.webdav.customHeaders = value;
            })
          )
      );

    new Setting(manualSettings)
      .setName("自动同步间隔")
      .setDesc("分钟；填 0 关闭定时同步。")
      .addText((text) =>
        text
          .setValue(String(this.plugin.settings.autoRunEveryMilliseconds / 60_000))
          .onChange(async (value) => {
            const minutes = Number(value);
            if (!Number.isFinite(minutes) || minutes < 0) {
              new Notice("请输入不小于 0 的分钟数。");
              return;
            }
            await saveText(this.plugin, () => {
              this.plugin.settings.autoRunEveryMilliseconds = minutes * 60_000;
            });
          })
      );
    new Setting(manualSettings)
      .setName("保存后同步")
      .setDesc("秒；填 0 关闭。")
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
              new Notice("请输入不小于 0 的秒数。");
              return;
            }
            await saveText(this.plugin, () => {
              this.plugin.settings.syncOnSaveAfterMilliseconds =
                seconds > 0 ? seconds * 1000 : -1;
            });
          })
      );
    new Setting(manualSettings)
      .setName("冲突处理")
      .setDesc("两端同时修改同一文件时的处理方式。")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("keep_newer", "保留较新版本")
          .addOption("keep_larger", "保留较大版本")
          .setValue(this.plugin.settings.conflictAction)
          .onChange(async (value) =>
            saveText(this.plugin, () => {
              this.plugin.settings.conflictAction = value as ConflictActionType;
            })
          )
      );
    new Setting(manualSettings)
      .setName("跳过大文件")
      .setDesc("MB；填 0 不跳过任何文件。")
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
              new Notice("请输入不小于 0 的文件大小。");
              return;
            }
            await saveText(this.plugin, () => {
              this.plugin.settings.skipSizeLargerThan =
                megabytes > 0 ? megabytes * 1024 * 1024 : -1;
            });
          })
      );
    new Setting(manualSettings)
      .setName("忽略路径规则")
      .setDesc("每行一个正则表达式。")
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
  }
}
