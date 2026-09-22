import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

export const manifestRelativePath = ".well-known/awaken-console-artifact";
export const artifactContractVersion = 2;

function canonicalPath(path) {
  return path.length > 0 && !/[\\\0:]/u.test(path)
    && path.split("/").every((part) => part.length > 0 && part !== "." && part !== "..");
}

/** The frontend artifact format uses UTF-8 byte order, never locale collation. */
export function consoleAssetSha256(entries) {
  const ordered = [...entries];
  if (ordered.length === 0) throw new Error("Console asset set must not be empty");
  const seen = new Set();
  for (const [path] of ordered) {
    if (!canonicalPath(path) || path === manifestRelativePath || seen.has(path)) {
      throw new Error("Console asset path is unsafe or duplicated");
    }
    seen.add(path);
  }
  ordered.sort(([a], [b]) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  const digest = createHash("sha256");
  for (const [path, content] of ordered) {
    const name = Buffer.from(path);
    const bytes = Buffer.from(content);
    for (const value of [name, bytes]) {
      const length = Buffer.alloc(8);
      length.writeBigUInt64BE(BigInt(value.length));
      digest.update(length);
      digest.update(value);
    }
  }
  return digest.digest("hex");
}

function assets(root, prefix = "") {
  if (!lstatSync(root).isDirectory()) throw new Error("Console root must be a real directory");
  return readdirSync(root, { encoding: "utf8" }).flatMap((name) => {
    const path = prefix ? `${prefix}/${name}` : name;
    if (!canonicalPath(path)) throw new Error("Console asset path is unsafe");
    const absolute = join(root, name);
    const info = lstatSync(absolute);
    if (info.isDirectory()) return assets(absolute, path);
    if (!info.isFile()) throw new Error("Console assets must be regular files");
    return path === manifestRelativePath ? [] : [[path, readFileSync(absolute)]];
  });
}

/** Product build owns its labels, supported profiles and generated API input. */
export function writeConsoleArtifact({ dist, product, profiles, apiContract }) {
  if (typeof product !== "string" || product.trim().length === 0
    || !Array.isArray(profiles) || profiles.length === 0
    || profiles.some((p) => typeof p !== "string" || p.trim().length === 0)
    || new Set(profiles).size !== profiles.length) {
    throw new Error("Console product/profiles must be nonempty and unique");
  }
  const manifest = {
    contract_version: artifactContractVersion,
    product,
    profiles: [...profiles].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b))),
    asset_sha256: consoleAssetSha256(assets(dist)),
    api_contract_sha256: createHash("sha256").update(readFileSync(apiContract)).digest("hex"),
  };
  const destination = join(dist, manifestRelativePath);
  mkdirSync(dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
    renameSync(temporary, destination);
  } finally {
    rmSync(temporary, { force: true });
  }
  return manifest;
}
