// Dünün NBA sonuçlarını ve takımların sezon rekorlarını balldontlie'dan çekip data.json'a yazar.
// Ücretsiz plan dakikada 5 istek verdiği için sayfalar arasında 13 sn beklenir.
// Kullanım: BDL_API_KEY=... node scripts/fetch-data.mjs [YYYY-MM-DD]
import { writeFile } from 'node:fs/promises';

const KEY = process.env.BDL_API_KEY;
if (!KEY) throw new Error('BDL_API_KEY ortam değişkeni gerekli');

const API = 'https://api.balldontlie.io/nba/v1/games';
const DELAY = 13000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// NBA maç tarihleri ABD Doğu saatine göredir; "dün" o saat dilimine göre hesaplanır.
function yesterdayET() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(Date.now() - 86400000));
}

// Sezon Ekim'de başlar ve başladığı yılla anılır (2026-27 → 2026).
function seasonOf(date) {
  const [y, m] = date.split('-').map(Number);
  return m >= 10 ? y : y - 1;
}

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    const r = await fetch(url, { headers: { Authorization: KEY } });
    if (r.ok) return r.json();
    if (r.status === 429 && attempt < 4) { await sleep(60000); continue; }
    throw new Error(`HTTP ${r.status} ${url}`);
  }
}

async function seasonGames(season, endDate) {
  const games = [];
  let cursor;
  do {
    if (games.length) await sleep(DELAY);
    const url = `${API}?seasons[]=${season}&end_date=${endDate}&per_page=100` + (cursor ? `&cursor=${cursor}` : '');
    const page = await get(url);
    games.push(...page.data);
    cursor = page.meta?.next_cursor;
  } while (cursor);
  return games;
}

const date = process.argv[2] || yesterdayET();
const games = await seasonGames(seasonOf(date), date);

// Normal sezon rekoru: playoff maçları ve sayılmayan NBA Cup finali hariç.
const record = {};
for (const g of games) {
  if (g.status_state !== 'final' || g.postseason || g.ist_stage === 'Championship') continue;
  const homeWon = g.home_team_score > g.visitor_team_score;
  for (const [team, won] of [[g.home_team, homeWon], [g.visitor_team, !homeWon]]) {
    const r = (record[team.id] ??= { w: 0, l: 0 });
    won ? r.w++ : r.l++;
  }
}

const slimTeam = t => ({ abbreviation: t.abbreviation, name: t.name, record: record[t.id] ? `${record[t.id].w}-${record[t.id].l}` : '0-0' });
const yesterday = games
  .filter(g => g.date === date)
  .map(g => ({
    datetime: g.datetime,
    status: g.status,
    status_state: g.status_state,
    period: g.period,
    postseason: g.postseason,
    visitor_team: slimTeam(g.visitor_team),
    home_team: slimTeam(g.home_team),
    visitor_team_score: g.visitor_team_score,
    home_team_score: g.home_team_score,
  }));

await writeFile('data.json', JSON.stringify({ date, updated: new Date().toISOString(), games: yesterday }, null, 1) + '\n');
console.log(`${date}: ${yesterday.length} maç, sezonda ${games.length} maç tarandı`);
