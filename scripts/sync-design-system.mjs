// AIP Design System(winterholic-design-system/aip)의 배포 산출물을 public/ 으로 복사한다.
// 사용: node scripts/sync-design-system.mjs [design-system 경로]
// 복사본을 커밋해 빌드가 외부 저장소 없이 재현되게 하고, 출처 commit 을 SOURCE.json 에 남긴다.
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "../winterholic-design-system");
const ds = join(root, "aip");
const DIST = ["tokens.css", "typography.css", "components.css", "prose.css", "aip.js"];
const BRAND = [
  "favicon.svg",
  "favicon-32.png",
  "apple-touch-icon-180.png",
  "logo-mark.svg",
  "logo-mark-mono.svg",
  "intent-runtime-3d.webp",
];

const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
if (git("status", "--porcelain", "--", "aip")) {
  console.error("design system aip/ 에 커밋되지 않은 변경이 있다. 커밋된 상태에서만 동기화한다.");
  process.exit(1);
}

await mkdir("public/vendor/aip", { recursive: true });
await mkdir("public/brand", { recursive: true });
for (const f of DIST) await copyFile(join(ds, "dist", f), join("public/vendor/aip", f));
for (const f of BRAND) await copyFile(join(ds, "assets/brand", f), join("public/brand", f));

const { version } = JSON.parse(await readFile(join(ds, "package.json"), "utf8"));
const source = {
  repository: "https://github.com/winterholic/winterholic-design-system",
  path: "aip",
  version,
  commit: git("log", "-1", "--format=%H", "--", "aip"),
  files: { "public/vendor/aip": DIST, "public/brand": BRAND },
};
await writeFile("public/vendor/aip/SOURCE.json", JSON.stringify(source, null, 2) + "\n");
console.log(`synced aip design system v${version} @ ${source.commit.slice(0, 7)}`);
