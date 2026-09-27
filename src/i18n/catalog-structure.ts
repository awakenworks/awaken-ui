export type TranslationCatalogIssue = Readonly<{
  key: string;
  part?: string;
  code: "missing_key" | "unexpected_key" | "duplicate_key" | "empty_message"
    | "placeholder_mismatch" | "code_token_missing" | "translation_artifact";
}>;

type StaticCatalog = Readonly<Record<string, string>>;
const tokens = (value: string, pattern: RegExp) => [...value.matchAll(pattern)].map((match) => match[1] ?? match[0]);
const placeholders = (value: string) => tokens(value, /\{[A-Za-z0-9_.-]+\}/g).sort();
const codeTokens = (value: string) => tokens(value, /`([^`]+)`/g);
const artifacts = (value: string) => tokens(value, /▁|9876\d+|97650\d+|000\s+987\d*|&quot;/g);

/** Inspect static product-owned fragments without merging away duplicate
 * ownership or changing any input. Source messages, not stable key ids, own
 * parameter/code constraints. Structural success is not semantic review. */
export function inspectTranslationCatalog(
  source: StaticCatalog,
  parts: Readonly<Record<string, StaticCatalog>>,
): readonly TranslationCatalogIssue[] {
  const issues: TranslationCatalogIssue[] = [];
  const owners = new Set<string>();
  for (const [part, messages] of Object.entries(parts)) {
    for (const [key, value] of Object.entries(messages)) {
      const issue = (code: TranslationCatalogIssue["code"]) => issues.push({ code, key, part });
      if (owners.has(key)) issue("duplicate_key");
      owners.add(key);
      if (!Object.hasOwn(source, key)) { issue("unexpected_key"); continue; }
      const original = source[key]!;
      if (!value.trim()) issue("empty_message");
      if (JSON.stringify(placeholders(original)) !== JSON.stringify(placeholders(value))) issue("placeholder_mismatch");
      const present = new Set(codeTokens(value));
      if (codeTokens(original).some((token) => !present.has(token))) issue("code_token_missing");
      const declared = new Set(artifacts(original));
      if (artifacts(value).some((token) => !declared.has(token))) issue("translation_artifact");
    }
  }
  for (const key of Object.keys(source)) if (!owners.has(key)) issues.push({ code: "missing_key", key });
  return issues;
}
