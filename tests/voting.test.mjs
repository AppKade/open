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

test("voting submits only after a click, scopes requests, and reports counts for ranking", async () => {
  const requests = [],
    resets = [],
    renders = [],
    events = [];
  const makeVote = (id) => {
    const handlers = {},
      attributes = {};
    const button = {
      disabled: true,
      addEventListener: (event, fn) => (handlers[event] = fn),
      setAttribute: (key, value) => (attributes[key] = value),
    };
    const count = { textContent: "–" },
      status = { textContent: "" },
      input = { value: "" };
    const widget = { hidden: true, querySelector: () => input };
    return {
      dataset: { voteProject: id, voteName: `Project ${id}`, turnstileSitekey: "test" },
      dispatchEvent: (event) => events.push({ id, count: event.detail.count }),
      querySelector: (selector) =>
        ({
          button: button,
          ".count": count,
          ".status": status,
          ".turnstile-container": widget,
        })[selector],
      handlers,
      attributes,
      button,
      count,
      status,
      input,
      widget,
    };
  };
  const votes = [makeVote("1"), makeVote("2")];
  const api = {
    render: (widget, options) => {
      renders.push({ widget, options });
      return `widget-${renders.length}`;
    },
    reset: (id) => resets.push(id),
  };
  runInNewContext(script, {
    document: { querySelectorAll: () => votes },
    window: { turnstile: api },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    fetch: async (url, opts) => {
      requests.push({ url, opts });
      return { ok: true, json: async () => (opts.method ? { count: 5, voted: true } : { count: 4, voted: false }) };
    },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(events, [{ id: "1", count: 4 }, { id: "2", count: 4 }], "initial counts feed the ranking");
  assert.equal(votes[0].count.textContent, "4");
  assert.equal(votes[1].button.disabled, false);
  assert.equal(renders.length, 0, "no challenge until someone votes");

  votes[1].handlers.click();
  assert.equal(renders.length, 1);
  assert.equal(renders[0].widget, votes[1].widget);
  assert.equal(votes[1].widget.hidden, false);
  assert.equal(requests.length, 2, "a click without a token must not submit");

  renders[0].options.callback("token");
  await new Promise((resolve) => setImmediate(resolve));
  const mutation = requests.find((r) => r.opts.method);
  assert.equal(mutation.url, "/api/votes/2");
  assert.equal(mutation.opts.method, "POST");
  assert.deepEqual(JSON.parse(mutation.opts.body), { token: "token" });
  assert.deepEqual(resets, ["widget-1"]);
  assert.equal(votes[1].count.textContent, "5");
  assert.equal(votes[1].attributes["aria-pressed"], "true");
  assert.equal(votes[1].widget.hidden, true);
  assert.deepEqual(events.at(-1), { id: "2", count: 5 });

  renders[0].options.callback("fresh-token-after-reset");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(requests.filter((r) => r.opts.method).length, 1, "tokens issued after a reset wait for a click");

  votes[1].input.value = "fresh-token-after-reset";
  votes[1].handlers.click();
  await new Promise((resolve) => setImmediate(resolve));
  const removal = requests.filter((r) => r.opts.method).at(-1);
  assert.equal(removal.opts.method, "DELETE", "a second vote removes the upvote");
  assert.equal(renders.length, 1, "the challenge is rendered once per project");
});
