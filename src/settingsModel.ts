import type { RemotelySavePluginSettings } from "./baseTypes";

export const DEFAULT_SETTINGS: RemotelySavePluginSettings = {
  webdav: {
    address: "",
    username: "sync",
    password: "",
    authType: "basic",
    manualRecursive: true,
    depth: "manual_1",
    remoteBaseDir: "",
    customHeaders: "",
  },
  password: "",
  serviceType: "webdav",
  autoRunEveryMilliseconds: 5 * 60 * 1000,
  syncOnSaveAfterMilliseconds: -1,
  concurrency: 3,
  syncConfigDir: false,
  syncUnderscoreItems: false,
  lang: "auto",
  skipSizeLargerThan: -1,
  ignorePaths: [],
  enableStatusBarInfo: true,
  deleteToWhere: "system",
  conflictAction: "keep_newer",
  protectModifyPercentage: 50,
  syncDirection: "bidirectional",
  obfuscateSettingFile: true,
  howToCleanEmptyFolder: "clean_both",
};

type PersistedSettings = Partial<RemotelySavePluginSettings> & {
  webdav?: Partial<RemotelySavePluginSettings["webdav"]>;
};

/** Drops old provider and encryption fields instead of silently reusing them. */
export const normalizeSettings = (
  input: PersistedSettings | null | undefined
): RemotelySavePluginSettings => {
  const source = input ?? {};
  const settings: RemotelySavePluginSettings = {
    webdav: {
      ...DEFAULT_SETTINGS.webdav,
      ...source.webdav,
      // Zettlab's WebDAV service accepts a fixed username and HTTP Basic only.
      // Do not carry legacy provider credentials or auth modes into this plugin.
      username: "sync",
      authType: "basic",
    },
    password: "",
    serviceType: "webdav",
    autoRunEveryMilliseconds:
      source.autoRunEveryMilliseconds ?? DEFAULT_SETTINGS.autoRunEveryMilliseconds,
    syncOnSaveAfterMilliseconds:
      source.syncOnSaveAfterMilliseconds ?? DEFAULT_SETTINGS.syncOnSaveAfterMilliseconds,
    concurrency: source.concurrency ?? DEFAULT_SETTINGS.concurrency,
    syncConfigDir: source.syncConfigDir ?? DEFAULT_SETTINGS.syncConfigDir,
    syncUnderscoreItems:
      source.syncUnderscoreItems ?? DEFAULT_SETTINGS.syncUnderscoreItems,
    lang: "auto",
    skipSizeLargerThan:
      source.skipSizeLargerThan ?? DEFAULT_SETTINGS.skipSizeLargerThan,
    ignorePaths: source.ignorePaths ?? DEFAULT_SETTINGS.ignorePaths,
    enableStatusBarInfo:
      source.enableStatusBarInfo ?? DEFAULT_SETTINGS.enableStatusBarInfo,
    deleteToWhere: source.deleteToWhere ?? DEFAULT_SETTINGS.deleteToWhere,
    conflictAction: source.conflictAction ?? DEFAULT_SETTINGS.conflictAction,
    protectModifyPercentage:
      source.protectModifyPercentage ?? DEFAULT_SETTINGS.protectModifyPercentage,
    syncDirection: source.syncDirection ?? DEFAULT_SETTINGS.syncDirection,
    obfuscateSettingFile:
      source.obfuscateSettingFile ?? DEFAULT_SETTINGS.obfuscateSettingFile,
    howToCleanEmptyFolder:
      source.howToCleanEmptyFolder ?? DEFAULT_SETTINGS.howToCleanEmptyFolder,
  };
  if (source.vaultRandomID !== undefined) settings.vaultRandomID = source.vaultRandomID;
  return settings;
};
