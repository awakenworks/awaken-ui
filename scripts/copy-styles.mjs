import { cp, mkdir } from "node:fs/promises";

const source = new URL("../src/styles", import.meta.url);
const destination = new URL("../dist/styles", import.meta.url);

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await cp(new URL("../src/styles.css", import.meta.url), new URL("../dist/styles.css", import.meta.url));

