//! Rust host adapter for the frontend-owned artifact format.
//!
//! Products own API/profile admission and immutable deployment. This crate
//! reads build evidence; it neither mounts a browser nor authenticates releases.

use serde::{Deserialize, Serialize};
use sha2::{Digest as _, Sha256};
use std::{collections::BTreeMap, path::Path};

pub const CONSOLE_ARTIFACT_MANIFEST_PATH: &str = "/.well-known/awaken-console-artifact";
pub const CONSOLE_ARTIFACT_CONTRACT_VERSION: u16 = 2;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub struct ConsoleArtifactManifest {
    pub contract_version: u16,
    pub product: String,
    pub profiles: Vec<String>,
    pub asset_sha256: String,
    pub api_contract_sha256: String,
}

impl ConsoleArtifactManifest {
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.contract_version != CONSOLE_ARTIFACT_CONTRACT_VERSION {
            return Err("unsupported Console artifact contract version");
        }
        if self.product.trim().is_empty()
            || self.profiles.is_empty()
            || self.profiles.iter().any(|p| p.trim().is_empty())
            || self.profiles.windows(2).any(|p| p[0] >= p[1])
        {
            return Err("Console product/profiles must be nonempty, sorted and unique");
        }
        for digest in [&self.asset_sha256, &self.api_contract_sha256] {
            if digest.len() != 64
                || !digest
                    .bytes()
                    .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
            {
                return Err("Console artifact digests must be lowercase SHA-256");
            }
        }
        Ok(())
    }
}

fn canonical_path(path: &str) -> bool {
    !path.is_empty()
        && !path.contains(['\\', '\0', ':'])
        && path
            .split('/')
            .all(|p| !p.is_empty() && p != "." && p != "..")
}

/// Hash UTF-8 byte-sorted, length-delimited paths and bytes, excluding manifest.
pub fn console_asset_sha256<'a>(
    entries: impl IntoIterator<Item = (&'a str, &'a [u8])>,
) -> Result<String, &'static str> {
    let mut ordered = BTreeMap::new();
    for (path, bytes) in entries {
        if !canonical_path(path) || path == &CONSOLE_ARTIFACT_MANIFEST_PATH[1..] {
            return Err("Console asset path is not canonical");
        }
        if ordered.insert(path, bytes).is_some() {
            return Err("Console asset path is duplicated");
        }
    }
    if ordered.is_empty() {
        return Err("Console asset set must not be empty");
    }
    let mut digest = Sha256::new();
    for (path, bytes) in ordered {
        for value in [path.as_bytes(), bytes] {
            digest.update(
                u64::try_from(value.len())
                    .map_err(|_| "Console asset too large")?
                    .to_be_bytes(),
            );
            digest.update(value);
        }
    }
    Ok(format!("{:x}", digest.finalize()))
}

/// Validate a filesystem artifact at startup. Serving products must retain an
/// immutable deployment directory for the process lifetime.
pub fn read_console_artifact(root: &Path) -> Result<ConsoleArtifactManifest, String> {
    let mut files = BTreeMap::new();
    collect(root, root, &mut files)?;
    let bytes = files
        .remove(&CONSOLE_ARTIFACT_MANIFEST_PATH[1..])
        .ok_or("Console artifact manifest is missing")?;
    let manifest: ConsoleArtifactManifest = serde_json::from_slice(&bytes)
        .map_err(|error| format!("decode Console artifact: {error}"))?;
    manifest.validate().map_err(str::to_owned)?;
    let digest = console_asset_sha256(
        files
            .iter()
            .map(|(path, bytes)| (path.as_str(), bytes.as_slice())),
    )?;
    if digest != manifest.asset_sha256 {
        return Err("Console asset digest does not match its manifest".into());
    }
    Ok(manifest)
}

fn collect(
    root: &Path,
    directory: &Path,
    files: &mut BTreeMap<String, Vec<u8>>,
) -> Result<(), String> {
    let fail = |error| format!("read Console assets: {error}");
    if !std::fs::symlink_metadata(directory).map_err(fail)?.is_dir() {
        return Err("Console root must be a real directory".into());
    }
    for entry in std::fs::read_dir(directory).map_err(fail)? {
        let entry = entry.map_err(fail)?;
        let kind = entry.file_type().map_err(fail)?;
        let path = entry.path();
        if kind.is_dir() {
            collect(root, &path, files)?;
        } else if kind.is_file() {
            let relative = path
                .strip_prefix(root)
                .map_err(|_| "Console asset escaped its root")?;
            let relative = relative.to_str().ok_or("Console asset path is not UTF-8")?;
            // Path separators are platform syntax; a Unix backslash is a real
            // filename byte and must be rejected rather than silently aliased.
            let relative = if cfg!(windows) {
                relative.replace('\\', "/")
            } else {
                relative.to_owned()
            };
            if !canonical_path(&relative) {
                return Err("Console asset path is not canonical".into());
            }
            files.insert(relative, std::fs::read(&path).map_err(fail)?);
        } else {
            return Err("Console assets must be regular files; symlinks are forbidden".into());
        }
    }
    Ok(())
}
