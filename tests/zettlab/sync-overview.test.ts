import assert from "node:assert/strict";
import { describe, it } from "mocha";
import { getSyncOverview, getSyncScheduleSummary } from "../../src/syncOverview";

describe("sync overview", () => {
  it("keeps an unconfigured vault focused on the Zettlab connection path", () => {
    const overview = getSyncOverview({ configured: false });

    assert.equal(overview.state, "not-configured");
    assert.equal(overview.lastSyncAt, undefined);
  });

  it("shows attention when a failure is newer than the last success", () => {
    const overview = getSyncOverview({
      configured: true,
      lastSuccessfulSyncAt: 100,
      lastFailedSyncAt: 200,
    });

    assert.equal(overview.state, "needs-attention");
    assert.equal(overview.lastSyncAt, 200);
  });

  it("shows the successful state and a readable sync policy", () => {
    const overview = getSyncOverview({
      configured: true,
      lastSuccessfulSyncAt: 200,
      lastFailedSyncAt: 100,
    });

    assert.equal(overview.state, "synced");
    assert.equal(overview.lastSyncAt, 200);
    assert.equal(getSyncScheduleSummary(5 * 60_000), "每 5 分钟自动同步");
    assert.equal(getSyncScheduleSummary(0), "仅手动同步");
  });
});
