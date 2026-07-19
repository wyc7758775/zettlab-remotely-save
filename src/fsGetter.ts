import type { RemotelySavePluginSettings } from "./baseTypes";
import { FakeFsWebdav } from "./fsWebdav";

/** The product intentionally exposes a single remote provider: WebDAV. */
export function getClient(
  settings: RemotelySavePluginSettings,
  vaultName: string,
  saveUpdatedConfigFunc: () => Promise<void>
): FakeFsWebdav {
  return new FakeFsWebdav(settings.webdav, vaultName, saveUpdatedConfigFunc);
}
