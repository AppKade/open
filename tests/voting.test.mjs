import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/components/Vote.astro", import.meta.url),
  "utf8",
)
  .split("<script>")[1]
  .split("</script>")[0];
const script = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;

test("project voting stays scoped, waits for a token, and resets the correct challenge", async () => {
  const requests = [],
    resets = [],
    renders = [];
  const makeVote = (id) => {
    const handlers = {},
      details = {
        open: false,
        addEventListener: (event, fn) => (handlers[event] = fn),
      };
    const button = {
      disabled: true,
      addEventListener: (event, fn) => (handlers[event] = fn),
    };
    const count = { textContent: "–" },
      status = { textContent: "" },
      input = { value: "" };
    const widget = { querySelector: () => input };
    return {
      dataset: { voteProject: id, turnstileSitekey: "test" },
      closest: () => details,
      querySelector: (selector) =>
        ({
          button: button,
          ".count": count,
          ".status": status,
          ".turnstile-container": widget,
        })[selector],
      handlers,
      details,
      button,
      count,
      status,
      input,
      widget,
    };
  };
  const votes = [makeVote("1"), makeVote("2")];
  const api = {
    render: (widget) => {
      renders.push(widget);
      return `widget-${renders.length}`;
    },
    reset: (id) => resets.push(id),
  };
  runInNewContext(script, {
    document: { querySelectorAll: () => votes },
    window: { turnstile: api, addEventListener: () => {} },
    fetch: async (url, opts) => {
      requests.push({ url, opts });
      return { ok: true, json: async () => ({ count: 4, voted: false }) };
    },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(renders.length, 0);
  votes[1].details.open = true;
  votes[1].handlers.toggle();
  assert.deepEqual(renders, [votes[1].widget]);
  await votes[1].handlers.click();
  assert.equal(requests.length, 2, "missing token must not submit a vote");
  votes[1].input.value = "token";
  await votes[1].handlers.click();
  const mutation = requests.find((r) => r.opts.method);
  assert.equal(mutation.url, "/api/votes/2");
  assert.equal(mutation.opts.method, "POST");
  assert.deepEqual(JSON.parse(mutation.opts.body), { token: "token" });
  assert.deepEqual(resets, ["widget-1"]);
  assert.equal(votes[0].count.textContent, "4");
});
