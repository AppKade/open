import {readFileSync, appendFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';

const host = 'open.appkade.lk';
const key = readFileSync(new URL('../public/indexnow-key.txt', import.meta.url), 'utf8').trim();
const keyLocation = `https://${host}/indexnow-key.txt`;
if (!/^[a-f0-9]{32}$/.test(key)) throw new Error('Invalid IndexNow key');

// Verify the new deployment has reached the canonical hostname before submitting.
let verified = false;
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    const response = await fetch(keyLocation, {signal: AbortSignal.timeout(15000), cache: 'no-store'});
    verified = response.ok && (await response.text()).trim() === key;
    if (verified) break;
  } catch (error) {
    console.warn(`Key verification attempt ${attempt + 1}: ${error.message}`);
  }
  if (attempt < 2) await delay(5000);
}
if (!verified) throw new Error('Canonical IndexNow key is not reachable; no URL submitted');
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {'Content-Type': 'application/json; charset=utf-8'},
  body: JSON.stringify({host, key, keyLocation, urlList: [`https://${host}/`]}),
  signal: AbortSignal.timeout(20000),
});
if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
}
const summary = `IndexNow received https://${host}/ (HTTP ${response.status}). This acknowledges submission, not indexing.\n`;
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
