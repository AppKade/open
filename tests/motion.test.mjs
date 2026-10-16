import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/scripts/motion.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
test('motion respects reduced motion, pause, visibility, and fine pointers', () => {
  const listeners = {}, media = {}, frames = new Map(), properties = {};
  let next = 0, painted = 0, revealed = 0;
  const context = { clearRect(){ painted++; }, setTransform(){}, beginPath(){}, arc(){}, fill(){} };
  const canvas = { getContext: () => context };
  const toggle = { addEventListener: (event, fn) => listeners.click = fn, setAttribute(){} };
  const document = {
    hidden: false, documentElement: { dataset: {} },
    querySelector: selector => selector === '#space' ? canvas : toggle,
    querySelectorAll: () => [], getAnimations: () => [],
    addEventListener: (event, fn) => listeners[event] = fn,
  };
  let reveal;
  runInNewContext(source, { document, innerWidth: 1000, innerHeight: 800, devicePixelRatio: 3,
    matchMedia: query => media[query] = { matches: true, addEventListener: (_, fn) => listeners[query] = fn },
    window: { addEventListener(){} },
    requestAnimationFrame: fn => { frames.set(++next, fn); return next; },
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class { constructor(fn){ reveal = fn; } observe(){} unobserve(){} },
  });
  assert.equal(document.documentElement.dataset.motion, 'off');
  assert.equal(frames.size, 0, 'reduced motion must not start the frame loop');
  assert.equal(canvas.width, 2000, 'pixel density is capped');
  const element = { parentElement: { children: [] }, closest: () => null, animate: () => revealed++ };
  element.parentElement.children.push(element);
  reveal([{ isIntersecting: true, target: element }]);
  assert.equal(revealed, 0);
  listeners.click();
  assert.equal(frames.size, 1);
  reveal([{ isIntersecting: true, target: element }]);
  assert.equal(revealed, 1);
  const event = { pointerType: 'mouse', clientX: 30, clientY: 50, target: { closest: () => ({ getBoundingClientRect: () => ({left: 10, top: 20}), style: { setProperty: (k,v) => properties[k] = v } }) } };
  listeners.pointermove(event);
  assert.equal(properties['--mouse-x'], '20px');
  assert.equal(properties['--mouse-y'], '30px');
  document.hidden = true; listeners.visibilitychange();
  assert.equal(frames.size, 0, 'hidden tabs stop rendering');
  document.hidden = false; listeners.visibilitychange();
  assert.equal(frames.size, 1);
  listeners.click();
  assert.equal(frames.size, 0, 'pause cancels rendering');
  assert.equal(toggle.textContent, 'Play motion');
  assert.ok(painted > 0, 'static stars remain when motion stops');
});
