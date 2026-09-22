// @vitest-environment node
import assert from "node:assert/strict";
import { test } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { consoleAssetSha256, manifestRelativePath, writeConsoleArtifact } from "./console-artifact.mjs";

test("digest distinguishes paths and bytes independently of enumeration and locale", () => {
  // R1 same set in different orders -> equal. R2 rename/change content -> unequal.
  // R3 unsafe/self/duplicate/empty paths -> reject. ASCII case, punctuation and
  // non-ASCII entries exercise the old localeCompare-vs-Rust ordering defect.
  const entries = ["A.js", "a.js", "a-1.js", "a_1.js", "z.js", "é.js", "中文.js"]
    .map((path) => [`assets/${path}`, Buffer.from(path)]);
  const digest = consoleAssetSha256(entries);
  assert.equal(consoleAssetSha256([...entries].reverse()), digest);
  assert.notEqual(consoleAssetSha256([...entries.slice(1), ["assets/new.js", entries[0][1]]]), digest);
  assert.notEqual(consoleAssetSha256([...entries.slice(1), [entries[0][0], Buffer.from("changed")]]), digest);
  for (const path of ["", "/abs", "a//b", "./a", "../a", "a/../b", "a\\b", "C:/a", "a\0b", manifestRelativePath]) {
    assert.throws(() => consoleAssetSha256([[path, Buffer.from("x")]]));
  }
  assert.throws(() => consoleAssetSha256([]));
  assert.throws(() => consoleAssetSha256([entries[0], entries[0]]));
});

test("writer publishes only complete evidence and refuses unsafe filesystem entries", () => {
  // R1 valid assets/API/profiles -> v2 manifest, rerun idempotent.
  // R2 missing API or invalid product/profiles -> old manifest remains intact.
  // R3 symlink -> reject, including a symlinked manifest; no bytes outside root read.
  const root = mkdtempSync(join(tmpdir(), "awaken-ui-artifact-"));
  try {
    const dist = join(root, "dist");
    mkdirSync(dist);
    writeFileSync(join(dist, "index.html"), "index");
    const apiContract = join(root, "contract.json");
    writeFileSync(apiContract, "{}");
    const args = { dist, product: "test", profiles: ["z", "a"], apiContract };
    const first = writeConsoleArtifact(args);
    assert.deepEqual(first.profiles, ["a", "z"]);
    assert.equal(first.contract_version, 2);
    assert.deepEqual(Object.keys(first).sort(), ["api_contract_sha256", "asset_sha256", "contract_version", "product", "profiles"]);
    assert.deepEqual(writeConsoleArtifact(args), first);
    const saved = readFileSync(join(dist, manifestRelativePath));
    for (const invalid of [{ product: " " }, { profiles: [] }, { profiles: ["a", "a"] }, { profiles: [" "] }, { apiContract: join(root, "missing") }]) {
      assert.throws(() => writeConsoleArtifact({ ...args, ...invalid }));
      assert.deepEqual(readFileSync(join(dist, manifestRelativePath)), saved);
    }
    if (process.platform !== "win32") {
      const link = join(dist, "link");
      symlinkSync(apiContract, link);
      assert.throws(() => writeConsoleArtifact(args));
      rmSync(link);
      rmSync(join(dist, manifestRelativePath));
      symlinkSync(apiContract, join(dist, manifestRelativePath));
      assert.throws(() => writeConsoleArtifact(args));
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
