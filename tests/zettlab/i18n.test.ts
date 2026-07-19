import assert from "node:assert/strict";
import { describe, it } from "mocha";
import { getLocale, t } from "../../src/i18n";

describe("Zettlab Memo notices", () => {
  it("uses the product-branded Chinese connection success copy", () => {
    assert.equal(t("connectionSuccess", {}, "zh-CN"), "Zettlab Memo 服务关联成功");
  });

  it("selects traditional Chinese and interpolates a failure reason", () => {
    assert.equal(getLocale("zh-HK"), "zh_TW");
    assert.equal(
      t("connectionFailed", { reason: "401" }, "zh-TW"),
      "Zettlab Memo 服務關聯失敗：401"
    );
  });

  it("falls back to English for other Obsidian locales", () => {
    assert.equal(t("connectionSuccess", {}, "fr-FR"), "Zettlab Memo service connected.");
  });
});
