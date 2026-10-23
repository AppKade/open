import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Check the deployed artifact, not just source templates. Run after astro build.
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('dist/index.html');
const site = 'https://open.appkade.lk/';
const registry = JSON.parse(read('data/projects.json'));
const tags = [...html.matchAll(/<meta\s+[^>]*>/g)].map(([tag]) => tag);
const meta = (name, property = false) => {
  const matches = tags.filter(tag => tag.includes(`${property ? 'property' : 'name'}="${name}"`));
  assert.equal(matches.length, 1, `Exactly one ${name} meta tag`);
  return matches[0].match(/content="([^"]*)"/)?.[1];
};
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'One main heading');
assert.match(html, /<link rel="canonical" href="https:\/\/open\.appkade\.lk\/"/);
assert.equal(meta('og:url', true), site);
assert.match(meta('robots'), /max-image-preview:large/);
assert.doesNotMatch(meta('robots'), /noindex|nosnippet/);
assert.ok(meta('description').length > 80, 'Meaningful description');
assert.equal(meta('twitter:card'), 'summary_large_image');
assert.equal(meta('twitter:image'), meta('og:image', true));
assert.match(read('dist/404.html'), /name="robots" content="noindex, follow"/);
assert.doesNotMatch(read('dist/404.html'), /rel="canonical"/);

const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
assert.equal(scripts.length, 1, 'One structured data graph');
const graph = JSON.parse(scripts[0][1])['@graph'];
const list = graph.find(item => item['@type'] === 'ItemList');
assert.equal(list.numberOfItems, registry.length);
assert.equal(list.itemListElement.length, registry.length);
for (const project of registry) {
  const entry = list.itemListElement.find(({item}) => item.codeRepository === `https://github.com/${project.repo}`);
  assert.ok(entry, `Schema includes ${project.slug}`);
  assert.equal(entry.item.description, project.description, 'Schema matches registry');
  assert.ok(html.includes(`id="project-${project.slug}"`), 'Project fragment resolves');
  assert.ok(html.includes(`href="https://github.com/${project.repo}"`), 'Repository has a crawlable link');
}
const faq = graph.find(item => Array.isArray(item['@type']) && item['@type'].includes('FAQPage'));
assert.ok(faq.mainEntity.length >= 4);
for (const question of faq.mainEntity) {
  assert.ok(html.includes(`id="${question['@id'].split('#')[1]}"`));
  assert.ok(html.includes(question.name));
  assert.ok(html.includes(question.acceptedAnswer.text), 'Structured answer must appear in HTML');
}
const locs = [...read('dist/sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(locs, [site], 'Only indexable canonical pages belong in the sitemap');
const robots = read('dist/robots.txt');
assert.match(robots, /Sitemap: https:\/\/open\.appkade\.lk\/sitemap.xml/);
assert.match(robots, /User-agent: OAI-SearchBot/);
assert.match(robots, /User-agent: ChatGPT-User/);
assert.match(robots, /Disallow: \/api\//);
assert.match(read('dist/indexnow-key.txt').trim(), /^[a-f0-9]{32}$/);
assert.equal((html.match(/googletagmanager\.com\/gtag\/js\?id=G-XJY49F2S1C/g) || []).length, 1);
console.log(`SEO artifact checks passed: canonical, previews, ${registry.length} projects, FAQ parity, sitemap, robots and Analytics.`);
