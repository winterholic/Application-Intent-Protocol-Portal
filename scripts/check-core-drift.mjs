// Portal 문서가 AIP Core 문서와 어긋났는지 가볍게 검사한다. Core를 읽기만 하고 수정하지 않는다.
// 사용: node scripts/check-core-drift.mjs --core <Core checkout> [--update-baseline]
//   Core 경로는 AIP_CORE_DIR 환경 변수로도 줄 수 있다. 네트워크를 쓰지 않는다.
// 검사하는 것:
//  1. 기준선: Core 문서 파일의 해시가 src/data/core-baseline.json과 같다(Core 문서가 바뀌면 검토 후 갱신).
//  2. 지원 범위 표: Core SUPPORT.md의 개수와 기능별 판정이 영어 known-limitations 표와 같고, 번역은 그 절로 안내한다.
//  3. 표현력 한계 E1~En 목록이 영어 known-limitations 표와 같다.
//  4. 출시 전 상태: Core에 v* 태그가 없는 동안 Portal이 출시 후보로 표시하고 정식 출시로 쓰지 않는다.
//  5. 패키지 이름·버전·protocol 표지가 Core 설정과 같다.
//  6. 핵심 표식(제한 산술, bundle refs, Decimal sum, extension create 등)이 Core와 Portal 양쪽에 있다.
//  7. source 경로가 Core에 있고, 새 표현력 문법의 코드 블록이 그 source에 그대로 있다(`aip` 블록은 pnpm verify의 AIP_BIN 검사).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const coreArg = argValue("--core") ?? process.env.AIP_CORE_DIR;
const updateBaseline = args.includes("--update-baseline");
if (!coreArg || !existsSync(join(coreArg, "product/SUPPORT.md"))) {
  console.error("Core checkout이 필요하다: node scripts/check-core-drift.mjs --core <경로>  (또는 AIP_CORE_DIR)");
  process.exit(2);
}
const CORE = resolve(coreArg);
const DOCS = "src/content/docs";
const LOCALES = ["en", "ko", "ja", "zh"];
const BASELINE_FILE = "src/data/core-baseline.json";

// Core 쪽에서 해시로 지켜볼 문서. 지원 범위·한계·설치·SDK·호환 설명의 근거다.
const WATCHED = [
  "README.md",
  "COMPATIBILITY.md",
  "CHANGELOG.md",
  "SECURITY.md",
  "product/SUPPORT.md",
  "product/LIMITS.md",
  "product/GETTING-STARTED.md",
  "product/INSTALL.md",
  "product/SDK.md",
  "product/release.config.json",
  "product/RELEASE-NOTES-1.0.0.md",
  "spec/definition-syntax.md",
  "product/tests/fixtures/expr-apps/orders/orders.target.aip",
];

// 기능 표식. portal은 영어 문서 key, tokens는 Core 문서(WATCHED)와 그 Portal 문서에 모두 있어야 하는 문자열이다.
const FEATURE_MARKERS = [
  { feature: "limited arithmetic", page: "definition-syntax", tokens: ["f = f - input.qty", "WIRE.BAD_VALUE", "repeat unchanged"] },
  { feature: "Decimal sum", page: "definition-syntax", tokens: ["sum(f)", "WIRE.OUTPUT_INVALID", "Decimal(p'"] },
  { feature: "bundle result reference", page: "sdk", tokens: ["refs", "target: { created: 0 }", "created(0)", "WIRE.BULK_LIMIT"] },
  { feature: "extension create", page: "workers", tokens: ["ctx.data.create", "create.<Resource>", "ctx.reject", "WIRE.EXTENSION_REJECTED"] },
  { feature: "known limits", page: "known-limitations", tokens: ["DEF.CALLER_FILTER_POLICY_REQUIRED", "DEF.POLICY_FIELD_NOT_USABLE_IN_TRANSITION", "DEF.MULTIPLE_ACTORS", "PostgreSQL 17"] },
  { feature: "compatibility limits", page: "compatibility", tokens: ["WIRE.CONTRACT_MISMATCH", "WIRE.DEPLOYMENT_CHANGED", "WIRE.UNKNOWN_KEY", "AipProtocolWarning"] },
];

const results = [];
const pass = (name, detail = "") => results.push({ ok: true, name, detail });
const fail = (name, detail) => results.push({ ok: false, name, detail });
const check = (name, ok, detail) => (ok ? pass(name) : fail(name, detail));

const readCore = (path) => readFileSync(join(CORE, path), "utf8");
const readPortal = (locale, key) => readFileSync(join(DOCS, locale, `${key}.md`), "utf8");
const git = (...a) => execFileSync("git", ["-C", CORE, ...a], { encoding: "utf8" }).trim();
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith(".md")) yield p;
  }
}
const frontmatterSources = (text) => {
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  const block = fm.match(/^source:\n((?:\s+- .+\n?)+)/m)?.[1] ?? "";
  return [...block.matchAll(/^\s+- (.+)$/gm)].map((m) => m[1].trim());
};
const codeBlocks = (text) => [...text.matchAll(/```(\w*)\n([\s\S]*?)\n```/g)].map((m) => ({ lang: m[1], code: m[2] }));
// 주석과 공백 차이는 무시한다. 번역에서 주석을 옮겨도 코드는 같다.
const normalizeCode = (code) =>
  code
    .split("\n")
    .map((l) => l.replace(/(^|\s)(\/\/|#)\s.*$/, "").replace(/(^|\s)\/\/$/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

// ---- Core 사실 추출 ----
const coreSha = git("rev-parse", "HEAD");
const coreSubject = git("log", "-1", "--format=%s");
const coreDirty = git("status", "--porcelain").length > 0;
const support = readCore("product/SUPPORT.md");
const countMatch = support.match(/지원 (\d+), 조건부 (\d+), 제외 (\d+)/);
const VERDICT = { 지원: "Supported", 조건부: "Conditional", "**제외**": "Excluded" };
const coreFeatures = new Map(
  [...support.matchAll(/^\| (\d+) \| .+? \| (지원|조건부|\*\*제외\*\*) \|/gm)].map((m) => [m[1], VERDICT[m[2]]]),
);
const coreLimits = [...readCore("product/LIMITS.md").matchAll(/^\| (E\d+) \|/gm)].map((m) => m[1]);
const tags = git("tag", "--list", "v*").split("\n").filter(Boolean);
const releaseConfig = JSON.parse(readCore("product/release.config.json"));
const cargoVersion = readCore("Cargo.toml").match(/^version = "([^"]+)"/m)?.[1];
const compat = readCore("COMPATIBILITY.md").match(/^\| (\d+\.\d+\.\d+) \| `([^`]+)` \| `([^`]+)` \|/m);
const corpus = WATCHED.map((p) => readCore(p)).join("\n");

console.log(`Core: ${CORE}`);
console.log(`Core SHA: ${coreSha}${coreDirty ? " (작업 트리에 미커밋 변경이 있음)" : ""}`);
console.log(`Core subject: ${coreSubject}`);

// ---- 1. 기준선 ----
const hashes = Object.fromEntries(WATCHED.map((p) => [p, sha256(readCore(p))]));
if (updateBaseline) {
  const next = { coreSha, checkedAt: new Date().toISOString().slice(0, 10), watched: hashes };
  writeFileSync(BASELINE_FILE, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`baseline updated -> ${BASELINE_FILE} (${coreSha.slice(0, 8)})`);
}
const baseline = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
console.log(`Portal baseline: ${baseline.coreSha} (checked ${baseline.checkedAt})`);
const changed = WATCHED.filter((p) => baseline.watched[p] !== hashes[p]);
check(
  "baseline: Core 문서가 기준선 이후 바뀌지 않았다",
  changed.length === 0,
  `Core 문서가 기준 ${baseline.coreSha.slice(0, 8)} 이후 바뀌었다: ${changed.join(", ")}. 변경을 검토해 Portal을 고친 뒤 --update-baseline으로 기준선을 올린다`,
);
const short = baseline.coreSha.slice(0, 8);
for (const locale of LOCALES) {
  check(`baseline: ${locale}/status가 기준 SHA ${short}를 적는다`, readPortal(locale, "status").includes(`\`${short}\``), `${locale}/status.md에 \`${short}\` 없음`);
}

// ---- 2. 지원 범위 표(영어) ----
const SCOPE_PAGE = "known-limitations";
check("support: Core 개수 판정이 표와 맞다", !!countMatch && coreFeatures.size === 19, "SUPPORT.md에서 개수나 기능 19행을 읽지 못함");
if (countMatch) {
  const [, s, c, x] = countMatch.map(Number);
  const tally = { Supported: 0, Conditional: 0, Excluded: 0 };
  for (const v of coreFeatures.values()) tally[v]++;
  check(
    "support: Core 개수와 표 판정이 서로 맞다",
    tally.Supported === s && tally.Conditional === c && tally.Excluded === x,
    `Core 자체 불일치: 개수 ${s}/${c}/${x}, 표 ${tally.Supported}/${tally.Conditional}/${tally.Excluded}`,
  );
  const phrase = `${s} supported, ${c} conditional, ${x} excluded`;
  check(`support: en/${SCOPE_PAGE}에 "${phrase}"`, readPortal("en", SCOPE_PAGE).includes(phrase), `en/${SCOPE_PAGE}.md에 "${phrase}" 없음`);
  const counts = new RegExp(`\\b${s}\\b[^\\n]*\\b${c}\\b[^\\n]*\\b${x}\\b`);
  for (const locale of LOCALES.slice(1)) {
    check(`support: ${locale}/${SCOPE_PAGE} 도입부에 개수 ${s}/${c}/${x}`, counts.test(readPortal(locale, SCOPE_PAGE)), `${locale}/${SCOPE_PAGE}.md에 개수 ${s}/${c}/${x} 없음`);
  }
}
{
  const rows = new Map(
    [...readPortal("en", SCOPE_PAGE).matchAll(/^\| (\d+) \| .+? \| (Supported|Conditional|Excluded) \|/gm)].map((m) => [m[1], m[2]]),
  );
  const diffs = [];
  for (const [n, verdict] of coreFeatures) if (rows.get(n) !== verdict) diffs.push(`#${n} Core=${verdict} Portal=${rows.get(n) ?? "없음"}`);
  for (const n of rows.keys()) if (!coreFeatures.has(n)) diffs.push(`#${n} Core에 없는 행`);
  check(`support: en/${SCOPE_PAGE} 표의 판정 19행`, diffs.length === 0, diffs.join("; "));
}
// 번역은 표 대신 영어 원문의 절로 안내한다. 안내 링크가 살아 있어야 한다.
for (const locale of LOCALES.slice(1)) {
  const text = readPortal(locale, SCOPE_PAGE);
  for (const id of ["scope", "expressiveness"]) {
    check(`support: ${locale}/${SCOPE_PAGE}가 영어 #${id}로 안내한다`, text.includes(`/docs/${SCOPE_PAGE}/#${id})`), `${locale}/${SCOPE_PAGE}.md에 영어 #${id} 링크 없음`);
  }
}

// ---- 3. 표현력 한계(영어) ----
{
  const ids = [...readPortal("en", SCOPE_PAGE).matchAll(/^\| (E\d+) \|/gm)].map((m) => m[1]);
  check(`limits: en/${SCOPE_PAGE}의 한계 ${coreLimits[0]}~${coreLimits.at(-1)}`, ids.join() === coreLimits.join(), `Core ${coreLimits.join(",")} / Portal ${ids.join(",") || "없음"}`);
}

// ---- 4. 출시 전 상태 ----
const PRE_RELEASE = /pre-release|release candidate|being prepared|not (yet )?(been )?(created|released|published|tagged)|has no tag/i;
if (tags.length === 0) {
  pass("release: Core에 v* 태그가 없다(출시 전)");
  for (const locale of LOCALES) {
    check(`release: ${locale}/status가 v1.0.0 태그 없음을 적는다`, readPortal(locale, "status").includes("`v1.0.0`"), `${locale}/status.md에 \`v1.0.0\` 없음`);
  }
  for (const key of ["index", "status", "getting-started", "release-notes", "known-limitations"]) {
    check(`release: en/${key}가 출시 전임을 적는다`, PRE_RELEASE.test(readPortal("en", key)), `en/${key}.md에 출시 전 표기 없음`);
  }
  const claims = [/\bnow (generally )?available\b/i, /\b1\.0(\.0)? (is )?(released|stable|GA)\b/i, /\bgenerally available\b/i, /\bofficially released\b/i, /\bfirst stable\b/i];
  const hits = [];
  for (const file of walk(join(DOCS, "en"))) {
    const text = readFileSync(file, "utf8");
    for (const re of claims) if (re.test(text)) hits.push(`${relative(DOCS, file)} ${re}`);
  }
  check("release: 영어 문서가 1.0 정식 출시를 주장하지 않는다", hits.length === 0, hits.join("; "));
} else {
  fail("release: Core에 v* 태그가 생겼다", `태그 ${tags.join(", ")}. Portal의 출시 전 표기를 검토해야 한다`);
}

// ---- 5. 이름·버전·protocol ----
const NAME_PAGES = ["installation", "getting-started", "release-notes", "sdk"];
const enNames = NAME_PAGES.map((k) => readPortal("en", k)).join("\n");
for (const [label, token] of [
  ["npm 이름", releaseConfig.npmPackage],
  ["PyPI 이름", releaseConfig.pypiDistribution],
  ["import 이름", releaseConfig.pythonImport],
]) {
  check(`names: en 문서에 ${label} ${token}`, enNames.includes(token), `${NAME_PAGES.join("/")}에 ${token} 없음`);
}
for (const locale of LOCALES) {
  for (const key of NAME_PAGES) {
    const stray = codeBlocks(readPortal(locale, key))
      .filter((b) => b.lang === "sh")
      .flatMap((b) => [...b.code.matchAll(/(?:npm|pip) install (?:--\S+ )*"?([^\s"]+)/g)].map((x) => x[1]))
      .filter((n) => !n.startsWith(".") && !n.startsWith("$") && n !== releaseConfig.npmPackage && n !== releaseConfig.pypiDistribution);
    if (stray.length) fail(`names: ${locale}/${key} 코드 블록의 설치 대상`, `Core 설정에 없는 설치 대상: ${stray.join(", ")}`);
  }
}
pass("names: 모든 언어의 sh 코드 블록 설치 대상이 Core 설정의 이름이다");
if (!releaseConfig.namesApprovedByOwner) {
  check("names: 이름이 잠정임을 en/status가 적는다", /provisional/i.test(readPortal("en", "status")), "Core namesApprovedByOwner=false인데 en/status에 provisional 없음");
}
check("version: en/status가 Core 버전을 적는다", !!cargoVersion && readPortal("en", "status").includes(cargoVersion), `Cargo 버전 ${cargoVersion} 없음`);
if (compat) {
  const text = readPortal("en", "compatibility");
  check(`protocol: en/compatibility의 ${compat[2]}, ${compat[3]}`, text.includes(compat[2]) && text.includes(compat[3]), `${compat[2]} 또는 ${compat[3]} 없음`);
} else fail("protocol: COMPATIBILITY.md에서 버전 행을 읽지 못함", "정규식 불일치");

// ---- 6. 핵심 표식 ----
for (const { feature, page, tokens } of FEATURE_MARKERS) {
  const missingCore = tokens.filter((t) => !corpus.includes(t));
  const missingPortal = tokens.filter((t) => !readPortal("en", page).includes(t));
  check(`marker(Core): ${feature}`, missingCore.length === 0, `Core 문서에서 사라진 표식: ${missingCore.join(", ")} (Portal ${page} 확인 필요)`);
  check(`marker(Portal): ${feature} in en/${page}`, missingPortal.length === 0, `en/${page}.md에 없는 표식: ${missingPortal.join(", ")}`);
}

// ---- 7. source와 코드 블록 ----
// 영어 문서의 source 경로가 Core에 있어야 한다. 새 표현력 문법의 코드 블록(묶음 참조, 확장 create·reject)은
// source 문서에 그대로 있어야 한다(문자열 리터럴 내용과 주석, 공백은 무시). `aip` 블록은 pnpm verify가 AIP_BIN으로 실제 검사한다.
const stripStrings = (code) => code.replace(/"(?:[^"\\]|\\.)*"/g, '""');
const VERBATIM_MARKERS = ["b.create(", "ctx.data.create(", "ctx.reject(", "created(0)"];
const normalizedCorpus = new Map();
const coreText = (path) => {
  if (!normalizedCorpus.has(path)) normalizedCorpus.set(path, stripStrings(normalizeCode(readCore(path))));
  return normalizedCorpus.get(path);
};
for (const file of walk(join(DOCS, "en"))) {
  const rel = relative(join(DOCS, "en"), file);
  const text = readFileSync(file, "utf8");
  const sources = frontmatterSources(text);
  const missing = sources.filter((s) => !existsSync(join(CORE, s)));
  check(`source: en/${rel}의 source가 Core에 있다`, missing.length === 0, `Core에 없는 source: ${missing.join(", ")}`);
  const present = sources.filter((s) => existsSync(join(CORE, s)));
  const marked = codeBlocks(text).filter((b) => ["ts", "js", "python"].includes(b.lang) && VERBATIM_MARKERS.some((m) => b.code.includes(m)));
  if (marked.length) {
    const unmatched = marked
      .filter((b) => !present.some((s) => coreText(s).includes(stripStrings(normalizeCode(b.code)))))
      .map((b) => `${b.lang}: ${b.code.split("\n")[0].slice(0, 50)}`);
    check(`source: en/${rel}의 표현력 코드 블록이 source에 그대로 있다`, unmatched.length === 0, `source에서 찾지 못한 블록: ${unmatched.join(" | ")}`);
  }
}

// ---- 출력 ----
const failures = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"} ${r.name}${r.ok ? "" : `\n     ${r.detail}`}`);
console.log(`\n${results.length - failures.length}/${results.length} passed, Core ${coreSha.slice(0, 8)}, baseline ${short}`);
if (failures.length) {
  console.error(`DRIFT: ${failures.length}건 실패`);
  process.exit(1);
}
console.log("no drift");
