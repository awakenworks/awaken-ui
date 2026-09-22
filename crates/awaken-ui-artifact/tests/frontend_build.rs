use awaken_ui_artifact::{
    CONSOLE_ARTIFACT_MANIFEST_PATH, ConsoleArtifactManifest, read_console_artifact,
};
use std::{fs, process::Command};

#[test]
fn node_build_and_rust_host_agree_on_real_asset_bytes() {
    // R1 frontend build with case/punctuation/Unicode filenames -> Rust accepts;
    // R2 altered bytes -> reject; R3 unknown version/extra field/profile drift ->
    // reject. This crosses real implementations rather than duplicating the hash.
    let root = tempfile::tempdir().unwrap();
    let dist = root.path().join("dist");
    fs::create_dir_all(dist.join("assets")).unwrap();
    fs::write(dist.join("index.html"), "index").unwrap();
    for name in ["A.js", "a.js", "a-1.js", "a_1.js", "z.js", "é.js", "中文.js"] {
        fs::write(dist.join("assets").join(name), name).unwrap();
    }
    let api = root.path().join("api.json");
    fs::write(&api, "{}").unwrap();
    let script = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../build/console-artifact.mjs")
        .canonicalize()
        .unwrap();
    let output = Command::new("node").args(["--input-type=module", "-e",
        "import {pathToFileURL} from 'node:url'; const {writeConsoleArtifact}=await import(pathToFileURL(process.argv[1])); writeConsoleArtifact({dist:process.argv[2],apiContract:process.argv[3],product:'test',profiles:['z','a']});"])
        .arg(script).arg(&dist).arg(api).output().unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let manifest = read_console_artifact(&dist).unwrap();
    assert_eq!(manifest.profiles, ["a", "z"]);
    assert_eq!(manifest.contract_version, 2);
    let manifest_path = dist.join(&CONSOLE_ARTIFACT_MANIFEST_PATH[1..]);
    let bytes = fs::read(&manifest_path).unwrap();
    for (key, value) in [
        ("contract_version", serde_json::json!(1)),
        ("source_revision", serde_json::json!("unverified")),
        ("profiles", serde_json::json!(["a", "a"])),
        ("product", serde_json::json!(" ")),
        ("api_contract_sha256", serde_json::json!("not-a-digest")),
    ] {
        let mut invalid: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
        invalid[key] = value;
        fs::write(&manifest_path, serde_json::to_vec(&invalid).unwrap()).unwrap();
        assert!(read_console_artifact(&dist).is_err(), "{key}");
    }
    fs::write(&manifest_path, bytes).unwrap();
    fs::write(dist.join("assets/A.js"), "changed").unwrap();
    assert!(read_console_artifact(&dist).is_err());
    let round_trip: ConsoleArtifactManifest =
        serde_json::from_value(serde_json::to_value(&manifest).unwrap()).unwrap();
    assert_eq!(round_trip, manifest);
}

#[test]
fn unsafe_paths_are_rejected_by_the_host_digest() {
    // R1 traversal, platform separator, drive/absolute path, NUL, manifest-self
    // or duplicate -> no digest. R2 regular canonical path -> one digest.
    use awaken_ui_artifact::console_asset_sha256 as digest;
    for name in [
        "",
        "/a",
        "a//b",
        "./a",
        "../a",
        "a/../b",
        "a\\b",
        "C:/a",
        "a\0b",
        ".well-known/awaken-console-artifact",
    ] {
        assert!(digest([(name, b"x".as_slice())]).is_err(), "{name:?}");
    }
    assert!(digest([("a", b"x".as_slice()), ("a", b"y".as_slice())]).is_err());
    assert!(digest([]).is_err());
    assert!(digest([("assets/a.js", b"x".as_slice())]).is_ok());
}
