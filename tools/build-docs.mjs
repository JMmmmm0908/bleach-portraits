// Regenerates roster.json, manifest.json, CHARACTERS.md and GALLERY.md from the Bleach world's roster.
// Run after adding or replacing portraits:  node tools/build-docs.mjs [path/to/roster-records.json]
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OWNER = "JMmmmm0908";
const REPO = "bleach-portraits";
const BASE_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/`;
const TITLE = "Bleach: The Living Soul";
const defaultSource = resolve(root, "../.worktrees/bleach-soul-reaper/src/data/roster-records.json");
const source = resolve(process.argv[2] ?? defaultSource);

const records = JSON.parse(readFileSync(source, "utf8"));
const file = key => `${key}-favor.webp`;

function image(key) {
  const path = join(root, file(key));
  if (!existsSync(path)) return { status: "missing" };
  const bytes = readFileSync(path);
  return { status: "available", bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}

const base = records.map(r => ({ key: r.key, name: r.name, group: r.group, filename: file(r.key), ...image(r.key) }));
const forms = records.flatMap(r => (r.forms ?? []).map(f => ({
  key: f.portrait ?? `${r.key}-${f.id}`, character: r.key, name: r.name, form: f.id, tag: f.tag,
  when: f.when, filename: file(f.portrait ?? `${r.key}-${f.id}`), ...image(f.portrait ?? `${r.key}-${f.id}`),
})));
const have = list => list.filter(p => p.status === "available").length;
const summary = `**${base.length} characters registered · ${have(base)} of ${base.length} base portraits and ${have(forms)} of ${forms.length} character-form portraits available · ${base.length + forms.length - have(base) - have(forms)} images missing.**`;

writeFileSync(join(root, "roster.json"), JSON.stringify(records, null, 2) + "\n");
writeFileSync(join(root, "manifest.json"), JSON.stringify({
  schemaVersion: 1,
  title: `${TITLE} — Portraits`,
  repository: `https://github.com/${OWNER}/${REPO}`,
  baseUrl: BASE_URL,
  filenameTemplate: "{key}-favor.webp",
  keyPattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  imageContract: { format: "webp", recommendedWidth: 512, recommendedHeight: 640, focalPoint: [0.5, 0.3], objectFit: "cover" },
  portraits: base.map(p => ({ ...p, url: BASE_URL + p.filename })),
  forms: forms.map(p => ({ ...p, url: BASE_URL + p.filename })),
}, null, 2) + "\n");

const groups = [...new Set(records.map(r => r.group))];
const when = w => w?.front ? `once the \`${w.front}\` front settles` : w?.reveal ? `after the \`${w.reveal}\` reveal` : "always";
const tick = p => (p.status === "available" ? "✅" : "⬜");

writeFileSync(join(root, "CHARACTERS.md"), [
  `# ${TITLE} — character roster`, "",
  "Each character needs one base portrait named `<key>-favor.webp`. A character form (Bankai, a reveal, a later look) uses its own portrait key; a missing form image falls back to the base face, and a missing base image falls back to the initials tile.", "",
  summary, "",
  "## Base portraits", "",
  "| | Character | Group | Filename |", "|---|---|---|---|",
  ...base.map(p => `| ${tick(p)} | ${p.name} | ${p.group} | \`${p.filename}\` |`), "",
  "## Character forms", "",
  "| | Character | Form | Shown | Filename |", "|---|---|---|---|---|",
  ...forms.map(p => `| ${tick(p)} | ${p.name} | ${p.tag} | ${when(p.when)} | \`${p.filename}\` |`), "",
].join("\n"));

const cell = p => p.status === "available"
  ? `[<img src="${p.filename}" alt="${p.name} portrait" width="220">](${p.filename})`
  : `*missing* \`${p.filename}\``;
const rows = list => {
  const out = [];
  for (let i = 0; i < list.length; i += 3) {
    const chunk = list.slice(i, i + 3);
    out.push(`| ${chunk.map(p => p.name).join(" | ")} |`, `|${chunk.map(() => "---").join("|")}|`, `| ${chunk.map(cell).join(" | ")} |`, "");
  }
  return out;
};
writeFileSync(join(root, "GALLERY.md"), [
  `# ${TITLE} — portrait gallery`, "", summary, "", "[Character roster](CHARACTERS.md)", "",
  ...groups.flatMap(g => [`## ${g}`, "", ...rows(base.filter(p => p.group === g))]),
  "## Character forms", "", ...rows(forms.map(p => ({ ...p, name: `${p.name} · ${p.form}` }))),
].join("\n"));

console.log(`${base.length} characters, ${forms.length} forms; ${have(base)} base and ${have(forms)} form portraits present.`);
