import assert from "node:assert/strict";
import { describe, it } from "mocha";
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  SYNC_ON_SAVE_DELAY_MILLISECONDS,
} from "../../src/settingsModel";

describe("settings normalization", () => {
  it("keeps only WebDAV-compatible settings when reading legacy data", () => {
    const legacy = {
      serviceType: "s3",
      password: "old-encryption-password",
      s3: { s3BucketName: "should-not-survive" },
      webdav: { address: "https://nas.example.test/dav", username: "wyc" },
      ignorePaths: ["^tmp/"],
    };

    const normalized = normalizeSettings(legacy);

    assert.equal(normalized.serviceType, "webdav");
    assert.equal(normalized.password, "");
    assert.equal(normalized.webdav.address, "https://nas.example.test/dav");
    assert.equal(normalized.webdav.username, "sync");
    assert.equal(normalized.webdav.authType, "basic");
    assert.deepEqual(normalized.ignorePaths, ["^tmp/"]);
    assert.equal("s3" in (normalized as unknown as Record<string, unknown>), false);
  });

  it("uses conservative WebDAV defaults for a new install", () => {
    assert.deepEqual(normalizeSettings(undefined), DEFAULT_SETTINGS);
    assert.equal(SYNC_ON_SAVE_DELAY_MILLISECONDS, 1000);
  });
});
