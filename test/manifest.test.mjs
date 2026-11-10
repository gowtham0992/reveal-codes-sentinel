import { test } from "node:test";
import assert from "node:assert/strict";
import { accessSync, constants, existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

test("app.json parses to an object", () => {
  assert.equal(typeof manifest, "object");
  assert.notEqual(manifest, null);
});

test("required fields are non-empty strings and name is kebab-case", () => {
  for (const field of ["name", "version", "displayName", "description"]) {
    assert.equal(typeof manifest[field], "string", field);
    assert.ok(manifest[field].trim().length > 0, field);
  }
  assert.match(manifest.name, KEBAB);
});

test("every agent and skill path exists", () => {
  for (const path of manifest.agents ?? []) {
    assert.ok(existsSync(join(root, path)), path);
  }
  for (const path of manifest.skills ?? []) {
    assert.ok(statSync(join(root, path)).isDirectory(), path);
    assert.ok(existsSync(join(root, path, "SKILL.md")), `${path}/SKILL.md`);
  }
});

test("every cron is well formed and names a known agent", () => {
  const agentNames = (manifest.agents ?? []).map(
    (path) => JSON.parse(readFileSync(join(root, path), "utf8")).name,
  );
  for (const cron of manifest.crons ?? []) {
    assert.ok(typeof cron.name === "string" && cron.name.length > 0, "cron name");
    assert.equal(
      Number("cron_expr" in cron) + Number("every" in cron),
      1,
      `${cron.name}: exactly one of cron_expr or every`,
    );
    assert.ok(typeof cron.message === "string" && cron.message.length > 0, `${cron.name}: message`);
    assert.equal(typeof cron.enabled, "boolean", `${cron.name}: enabled`);
    assert.ok(agentNames.includes(cron.agent), `${cron.name}: agent ${cron.agent}`);
  }
});

test("scripts/install.sh is executable with the expected header", () => {
  const path = join(root, "scripts", "install.sh");
  accessSync(path, constants.X_OK);
  const lines = readFileSync(path, "utf8").split("\n");
  assert.equal(lines[0], "#!/usr/bin/env bash");
  assert.ok(lines.includes("set -euo pipefail"));
});
