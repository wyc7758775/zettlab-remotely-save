type Locale = "en" | "zh_CN" | "zh_TW";

export type MessageKey =
  | "connectionSuccess"
  | "connectionFailed"
  | "unknownError"
  | "connectFirst"
  | "syncInProgress"
  | "syncCompleted"
  | "syncFailed"
  | "statusReady"
  | "statusSyncing"
  | "statusSyncFailed"
  | "commandSyncNow"
  | "commandTestConnection"
  | "ribbonSync";

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en: {
    connectionSuccess: "Zettlab Memo service connected.",
    connectionFailed: "Zettlab Memo service connection failed: {{reason}}",
    unknownError: "Unknown error",
    connectFirst:
      "Connect Zettlab Memo first, or enter the address and app password in Manual connection.",
    syncInProgress: "Zettlab Memo is already syncing. Please wait.",
    syncCompleted: "Zettlab Memo sync completed.",
    syncFailed: "Zettlab Memo sync failed: {{reason}}",
    statusReady: "Ready",
    statusSyncing: "Syncing…",
    statusSyncFailed: "Sync failed",
    commandSyncNow: "Sync Zettlab Memo now",
    commandTestConnection: "Test Zettlab Memo service",
    ribbonSync: "Sync Zettlab Memo",
  },
  zh_CN: {
    connectionSuccess: "Zettlab Memo 服务关联成功",
    connectionFailed: "Zettlab Memo 服务关联失败：{{reason}}",
    unknownError: "未知错误",
    connectFirst: "请先完成 Zettlab Memo 服务关联，或在手动接入中填写地址和 App 密码。",
    syncInProgress: "Zettlab Memo 正在同步，请稍候。",
    syncCompleted: "Zettlab Memo 同步完成。",
    syncFailed: "Zettlab Memo 同步失败：{{reason}}",
    statusReady: "已就绪",
    statusSyncing: "正在同步…",
    statusSyncFailed: "同步失败",
    commandSyncNow: "立即同步 Zettlab Memo",
    commandTestConnection: "检测 Zettlab Memo 服务",
    ribbonSync: "同步 Zettlab Memo",
  },
  zh_TW: {
    connectionSuccess: "Zettlab Memo 服務關聯成功",
    connectionFailed: "Zettlab Memo 服務關聯失敗：{{reason}}",
    unknownError: "未知錯誤",
    connectFirst: "請先完成 Zettlab Memo 服務關聯，或在手動接入中填寫位址和 App 密碼。",
    syncInProgress: "Zettlab Memo 正在同步，請稍候。",
    syncCompleted: "Zettlab Memo 同步完成。",
    syncFailed: "Zettlab Memo 同步失敗：{{reason}}",
    statusReady: "已就緒",
    statusSyncing: "正在同步…",
    statusSyncFailed: "同步失敗",
    commandSyncNow: "立即同步 Zettlab Memo",
    commandTestConnection: "檢測 Zettlab Memo 服務",
    ribbonSync: "同步 Zettlab Memo",
  },
};

export const getLocale = (language?: string): Locale => {
  const normalized = (language ?? globalThis.navigator?.language ?? "en")
    .toLowerCase()
    .replace("-", "_");
  if (normalized.startsWith("zh_tw") || normalized.startsWith("zh_hk")) {
    return "zh_TW";
  }
  if (normalized.startsWith("zh")) return "zh_CN";
  return "en";
};

export const t = (
  key: MessageKey,
  values: Record<string, string> = {},
  language?: string
): string =>
  MESSAGES[getLocale(language)][key].replace(
    /{{(\w+)}}/g,
    (_placeholder, name: string) => values[name] ?? ""
  );
