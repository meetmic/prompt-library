/**
 * Validates every prompts/*.md and writes index.json - the one file the
 * MeetMic website (and later the app) fetches. `--check` fails instead of
 * writing when index.json is stale or a prompt is invalid; CI runs that.
 *
 * Validation mirrors the app's `meetmic://prompts/add` decoder so a prompt
 * that passes here always installs: title <= 200 chars, payload <= 16 KB,
 * icon from the app's preset picker, colour from its 11 names.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS = join(ROOT, "prompts");
const OUT = join(ROOT, "index.json");
const check = process.argv.includes("--check");

const TYPES = ["summary", "dictation"];
const ICONS = new Set([
  "doc.text", "doc.text.fill", "list.bullet", "list.number",
  "envelope", "envelope.fill", "bubble.left", "bubble.left.and.bubble.right",
  "person", "person.2", "person.3",
  "star", "star.fill", "heart.fill", "bookmark.fill",
  "flag.fill", "tag.fill", "folder.fill",
  "lightbulb", "lightbulb.fill", "brain", "sparkles",
  "checkmark.circle", "checkmark.circle.fill", "xmark.circle",
  "clock", "clock.fill", "calendar",
  "questionmark.bubble", "exclamationmark.bubble",
  "text.cursor", "pencil", "highlighter",
  "wand.and.stars", "bolt.fill", "flame.fill",
]);
const COLORS = new Set(["blue", "purple", "pink", "red", "orange", "green", "mint", "teal", "cyan", "indigo", "brown"]);
const MAX_TITLE = 200;
const MAX_PAYLOAD_BYTES = 16 * 1024;

const roles = JSON.parse(readFileSync(join(ROOT, "roles.json"), "utf8"));
const roleIds = new Set(roles.map((r) => r.id));

const errors = [];
const prompts = [];

for (const file of readdirSync(PROMPTS).filter((f) => f.endsWith(".md")).sort()) {
  const slug = file.slice(0, -3);
  const fail = (why) => errors.push(`prompts/${file}: ${why}`);
  if (!/^[a-z0-9-]+$/.test(slug)) fail("filename must be a lowercase slug");

  const { data, content } = matter(readFileSync(join(PROMPTS, file), "utf8"));
  const body = content.trim();
  const { title, tagline, type, audience, icon, iconColor, order, source } = data;

  for (const [k, v] of Object.entries({ title, tagline, type, icon, iconColor })) {
    if (typeof v !== "string" || !v.trim()) fail(`"${k}" is missing`);
  }
  if (!TYPES.includes(type)) fail(`type "${type}" must be summary or dictation`);
  if (audience !== undefined && typeof audience !== "string") fail(`"audience" must be a string`);
  if (!Array.isArray(data.roles) || data.roles.length === 0) fail(`"roles" must be a non-empty list`);
  else for (const r of data.roles) if (!roleIds.has(r)) fail(`role "${r}" is not in roles.json`);
  if (!ICONS.has(icon)) fail(`icon "${icon}" is not one of the app's preset icons`);
  if (!COLORS.has(iconColor)) fail(`iconColor "${iconColor}" is not an app colour`);
  if (typeof order !== "number") fail(`"order" must be a number`);
  if (typeof title === "string" && [...title.trim()].length > MAX_TITLE) fail(`title is over ${MAX_TITLE} characters`);
  if (/—/.test(`${title}${tagline}${audience ?? ""}`)) fail("title/tagline/audience must not contain an em dash");
  if (!body) fail("body is empty");
  if (/\{\{\w+\}\}/.test(body)) fail("body has a {{placeholder}}; the app does not substitute them");
  if (/^(transcript|text):\s*$/im.test(body)) fail("body ends with an input block; the app appends the transcript itself");
  if (type === "dictation" && !/never talking to you/i.test(body)) fail("dictation prompts must say the speaker is never talking to the model");
  if (type === "summary" && !/no preamble/i.test(body)) fail("summary prompts must end with the no-preamble rule");

  const payload = JSON.stringify({ title: String(title).trim(), userBody: body, icon, iconColor });
  const bytes = Buffer.byteLength(payload);
  if (bytes > MAX_PAYLOAD_BYTES) fail(`payload is ${bytes} bytes, over the ${MAX_PAYLOAD_BYTES} cap`);

  prompts.push({
    slug,
    type,
    title: String(title).trim(),
    tagline: String(tagline).trim(),
    ...(audience ? { audience: audience.trim() } : {}),
    roles: data.roles,
    icon,
    iconColor,
    order,
    ...(source ? { source: String(source) } : {}),
    body,
  });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

prompts.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
const index = { schema: 1, roles, prompts };
const json = JSON.stringify(index, null, 2) + "\n";

if (check) {
  let current = "";
  try { current = readFileSync(OUT, "utf8"); } catch {}
  if (current !== json) {
    console.error("index.json is out of date - run `npm run build` and commit the result");
    process.exit(1);
  }
  console.log(`index.json is current (${prompts.length} prompts)`);
} else {
  writeFileSync(OUT, json);
  console.log(`wrote index.json (${prompts.length} prompts)`);
}
