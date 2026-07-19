/*
 * Derived from Remotely Save commit 7ca2d192552819777318d9d521dca45450934b4f
 * (Apache-2.0). Modified by Zettlab.
 */
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
