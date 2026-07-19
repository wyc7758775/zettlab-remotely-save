/*
 * Derived from Remotely Save commit 7ca2d192552819777318d9d521dca45450934b4f
 * (Apache-2.0). Modified by Zettlab.
 */
/** Shared types for the WebDAV-only plugin. */

export const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export type SUPPORTED_SERVICES_TYPE = "webdav";

export type WebdavAuthType = "digest" | "basic";
export type WebdavDepthType =
  | "auto"
  | "auto_unknown"
  | "auto_1"
  | "auto_infinity"
  | "manual_1"
  | "manual_infinity";

export interface WebdavConfig {
  address: string;
  username: string;
  password: string;
  authType: WebdavAuthType;
  depth?: WebdavDepthType;
  remoteBaseDir?: string;
  customHeaders?: string;
  manualRecursive: boolean;
}

export type SyncDirectionType =
  | "bidirectional"
  | "incremental_pull_only"
  | "incremental_push_only";
export type EmptyFolderCleanType = "skip" | "clean_both";
export type ConflictActionType = "keep_newer" | "keep_larger";

export interface ProfilerConfig {
  enable?: boolean;
  enablePrinting?: boolean;
  recordSize?: boolean;
}

export interface RemotelySavePluginSettings {
  webdav: WebdavConfig;
  password: "";
  serviceType: "webdav";
  autoRunEveryMilliseconds: number;
  syncOnSaveAfterMilliseconds: number;
  concurrency: number;
  syncConfigDir: boolean;
  syncUnderscoreItems: boolean;
  lang: "auto";
  skipSizeLargerThan: number;
  ignorePaths: string[];
  enableStatusBarInfo: boolean;
  deleteToWhere: "system" | "obsidian";
  conflictAction: ConflictActionType;
  protectModifyPercentage: number;
  syncDirection: SyncDirectionType;
  obfuscateSettingFile: boolean;
  howToCleanEmptyFolder: EmptyFolderCleanType;
  vaultRandomID?: string;
}

export type DecisionTypeForMixedEntity =
  | "only_history"
  | "equal"
  | "local_is_modified_then_push"
  | "remote_is_modified_then_pull"
  | "local_is_created_then_push"
  | "remote_is_created_then_pull"
  | "local_is_created_too_large_then_do_nothing"
  | "remote_is_created_too_large_then_do_nothing"
  | "local_is_deleted_thus_also_delete_remote"
  | "remote_is_deleted_thus_also_delete_local"
  | "conflict_created_then_keep_local"
  | "conflict_created_then_keep_remote"
  | "conflict_created_then_keep_both"
  | "conflict_created_then_do_nothing"
  | "conflict_modified_then_keep_local"
  | "conflict_modified_then_keep_remote"
  | "conflict_modified_then_keep_both"
  | "folder_existed_both_then_do_nothing"
  | "folder_existed_local_then_also_create_remote"
  | "folder_existed_remote_then_also_create_local"
  | "folder_to_be_created"
  | "folder_to_skip"
  | "folder_to_be_deleted_on_both"
  | "folder_to_be_deleted_on_remote"
  | "folder_to_be_deleted_on_local";

export interface Entity {
  key?: string;
  keyEnc?: string;
  keyRaw: string;
  mtimeCli?: number;
  mtimeCliFmt?: string;
  ctimeCli?: number;
  ctimeCliFmt?: string;
  mtimeSvr?: number;
  mtimeSvrFmt?: string;
  prevSyncTime?: number;
  prevSyncTimeFmt?: string;
  size?: number;
  sizeEnc?: number;
  sizeRaw: number;
  hash?: string;
  etag?: string;
  synthesizedFolder?: boolean;
  synthesizedFile?: boolean;
}

export interface MixedEntity {
  key: string;
  local?: Entity;
  prevSync?: Entity;
  remote?: Entity;
  decisionBranch?: number;
  decision?: DecisionTypeForMixedEntity;
  conflictAction?: ConflictActionType;
  change?: boolean;
  sideNotes?: unknown;
}

export const DEFAULT_DEBUG_FOLDER = "_debug_zettlab_sync/";
export type SyncTriggerSourceType =
  | "manual"
  | "dry"
  | "auto"
  | "auto_once_init"
  | "auto_sync_on_save";
