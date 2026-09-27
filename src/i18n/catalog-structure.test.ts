import { describe, expect, it } from "vitest";
import { inspectTranslationCatalog } from "./core.js";

describe("static catalog structural decision table", () => {
  it("uses source messages instead of stable ids and preserves named fragment inputs", () => {
    // R1 same keys in one fragment each + translated/reordered parameters ->
    // accept; key id is not English copy. R2 no mutation -> original catalogs
    // stay exact; inspecting does not invoke runtime fallback or merge state.
    const source = { greeting: "Hello {name}", transport: "Use `http(s)`.", count: "{value} and {value}" };
    const parts = { shell: { greeting: "こんにちは {name}" }, feature: { transport: "`http(s)` を使用します。", count: "{value} ثم {value}" } };
    const before = structuredClone({ source, parts });
    expect(inspectTranslationCatalog(source, parts)).toEqual([]);
    expect({ source, parts }).toEqual(before);
  });

  it("reports coverage and every duplicate owner before a merge can hide them", () => {
    // C1 absent source key -> missing; C2 extra target key -> unexpected;
    // C3 empty message -> reject; C4 two fragment owners -> duplicate, even
    // when both copies are equal. Independent defects are all retained.
    const result = inspectTranslationCatalog({ a: "A", b: "B", c: "C" }, {
      first: { a: "A", c: " ", extra: "Extra" }, second: { a: "A" },
    });
    expect(result).toEqual([
      { code: "empty_message", key: "c", part: "first" },
      { code: "unexpected_key", key: "extra", part: "first" },
      { code: "duplicate_key", key: "a", part: "second" },
      { code: "missing_key", key: "b" },
    ]);
  });

  it("rejects lost or renamed parameters and overlapping or broken code delimiters", () => {
    // R3 repeated parameter lost/name changed -> mismatch; R4 code word only
    // occurs inside another code token or broken quote -> reject; R5 exact
    // code terms remain and sentence order changes -> accept.
    for (const text of ["{name}", "{name} {other}"]) expect(inspectTranslationCatalog(
      { id: "{name} and {name}" }, { target: { id: text } },
    )).toContainEqual({ code: "placeholder_mismatch", key: "id", part: "target" });
    for (const text of ["`github_repository`", "`github' and `github_repository`"]) expect(inspectTranslationCatalog(
      { id: "Use `github`, not `github_repository`." }, { target: { id: text } },
    )).toContainEqual({ code: "code_token_missing", key: "id", part: "target" });
    expect(inspectTranslationCatalog({ id: "Use `github`, not `github_repository`." }, {
      target: { id: "لا تستخدم `github_repository`؛ استخدم `github`." },
    })).toEqual([]);
  });

  it("rejects unexplained short sentinel remnants while retaining declared numeric examples", () => {
    // R6 absent from source + generator remnant -> reject each discovered
    // truncated/suffixed form; R7 ordinary number or an exact source-declared
    // technical number -> accept, not a global numeric ban.
    for (const text of ["000 98765", "000 987", "9876501", "98766502", "9765000", "▁token", "&quot;"]) expect(inspectTranslationCatalog(
      { id: "Create" }, { target: { id: text } },
    )).toContainEqual({ code: "translation_artifact", key: "id", part: "target" });
    expect(inspectTranslationCatalog({ id: "Limit 16777216 bytes" }, { target: { id: "الحد 16777216 بايت" } })).toEqual([]);
    expect(inspectTranslationCatalog({ id: "Example 9876501" }, { target: { id: "مثال 9876501" } })).toEqual([]);
  });
});
