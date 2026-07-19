export type SyncOverview = {
  state: "not-configured" | "needs-attention" | "ready" | "synced";
  title: string;
  description: string;
  lastSyncAt?: number;
};

export const getSyncOverview = (input: {
  configured: boolean;
  lastSuccessfulSyncAt?: number;
  lastFailedSyncAt?: number;
}): SyncOverview => {
  if (!input.configured) {
    return {
      state: "not-configured",
      title: "尚未接入 Zettlab",
      description:
        "当前插件尚未收到配置。App 或 Web 完成自动接入后，此处会直接显示同步状态；现在也可以展开下方手动设置。",
    };
  }

  const lastFailureIsNewer =
    input.lastFailedSyncAt !== undefined &&
    (input.lastSuccessfulSyncAt === undefined ||
      input.lastFailedSyncAt > input.lastSuccessfulSyncAt);
  if (lastFailureIsNewer) {
    return {
      state: "needs-attention",
      title: "需要检查连接",
      description: "最近一次同步未完成。请检测连接，或展开手动设置排查。",
      lastSyncAt: input.lastFailedSyncAt,
    };
  }

  if (input.lastSuccessfulSyncAt !== undefined) {
    return {
      state: "synced",
      title: "同步正常",
      description: "Zettlab 正在使用当前 WebDAV 配置同步此仓库。",
      lastSyncAt: input.lastSuccessfulSyncAt,
    };
  }

  return {
    state: "ready",
    title: "已配置，等待首次同步",
    description: "配置已保存。你可以立即同步，或等待自动同步执行。",
  };
};

export const getSyncScheduleSummary = (milliseconds: number): string => {
  if (milliseconds <= 0) return "仅手动同步";
  const minutes = milliseconds / 60_000;
  return Number.isInteger(minutes) ? `每 ${minutes} 分钟自动同步` : "按自定义间隔自动同步";
};
