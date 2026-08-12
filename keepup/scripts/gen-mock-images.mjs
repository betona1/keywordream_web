// 목업 인증샷 생성 — 앱이 찍어주는 인증샷(사진 + 날짜·시각 워터마크) 형식을 그래픽으로 재현한다.
// 실행: node scripts/gen-mock-images.mjs  →  scripts/.mock-images/<postIdx>-<shotIdx>.webp
import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { POSTS, shotsOf } from "./mock-data.mjs";

const OUT = new URL("./.mock-images/", import.meta.url);
const W = 1200;
const H = 900;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 배경 그라디언트 + 광원 + 격자 — 사진 대신 쓸 '바탕' */
function backdrop(from, to, seed) {
  // 광원 위치를 게시물마다 조금씩 흔들어 12장이 전부 같은 그림으로 보이지 않게 한다
  const cx = 26 + ((seed * 17) % 48);
  const cy = 18 + ((seed * 29) % 44);
  return `
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/>
      </linearGradient>
      <radialGradient id='lume' cx='${cx}%' cy='${cy}%' r='58%'>
        <stop offset='0%' stop-color='#ffffff' stop-opacity='.38'/>
        <stop offset='100%' stop-color='#ffffff' stop-opacity='0'/>
      </radialGradient>
      <linearGradient id='shade' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='55%' stop-color='#000000' stop-opacity='0'/>
        <stop offset='100%' stop-color='#000000' stop-opacity='.55'/>
      </linearGradient>
    </defs>
    <rect width='${W}' height='${H}' fill='url(#g)'/>
    <rect width='${W}' height='${H}' fill='url(#lume)'/>
    <g stroke='#ffffff' stroke-opacity='.07'>
      ${Array.from({ length: 15 }, (_, i) => `<line x1='${i * 84}' y1='0' x2='${i * 84}' y2='${H}'/>`).join("")}
      ${Array.from({ length: 11 }, (_, i) => `<line x1='0' y1='${i * 84}' x2='${W}' y2='${i * 84}'/>`).join("")}
    </g>
    <rect width='${W}' height='${H}' fill='url(#shade)'/>`;
}

function card(shot, seed) {
  const [date, time] = shot.at.split(" ");
  return Buffer.from(`<svg width='${W}' height='${H}' xmlns='http://www.w3.org/2000/svg'>
  ${backdrop(shot.from, shot.to, seed)}

  <!-- 픽토그램 (Segoe UI Emoji는 단색 실루엣으로 렌더된다) -->
  <text x='${W / 2}' y='${H / 2 - 40}' font-size='300' text-anchor='middle'
        font-family='Segoe UI Emoji' fill='#ffffff' fill-opacity='.9'>${shot.icon}</text>

  <!-- D+N 뱃지 -->
  <rect x='${W - 214}' y='54' width='160' height='62' rx='31' fill='#000000' fill-opacity='.34'
        stroke='#ffffff' stroke-opacity='.45'/>
  <text x='${W - 134}' y='95' font-size='30' text-anchor='middle' font-family='Malgun Gothic'
        font-weight='bold' fill='#ffffff'>D+${shot.d}</text>

  <!-- 루틴명 + 캡션 -->
  <text x='64' y='${H - 168}' font-size='34' font-family='Malgun Gothic' font-weight='bold'
        fill='#ffffff' fill-opacity='.82'>${esc(shot.routineName)}</text>
  <text x='64' y='${H - 112}' font-size='52' font-family='Malgun Gothic' font-weight='bold'
        fill='#ffffff'>${esc(shot.cap)}</text>

  <!-- 앱이 찍는 날짜·시각 워터마크 -->
  <text x='64' y='${H - 48}' font-size='30' font-family='Consolas, monospace'
        fill='#ffffff' fill-opacity='.78'>${date} ${time}</text>
  <text x='${W - 64}' y='${H - 48}' font-size='24' text-anchor='end' font-family='Malgun Gothic'
        font-weight='bold' fill='#ffffff' fill-opacity='.6'>LOG CHALLENGE</text>
</svg>`);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let n = 0;
for (let p = 0; p < POSTS.length; p++) {
  const shots = shotsOf(POSTS[p]);
  for (const shot of shots) {
    const file = new URL(`${p}-${shot.index}.webp`, OUT);
    await sharp(card(shot, p + shot.index)).webp({ quality: 82 }).toFile(file.pathname.slice(1));
    n++;
  }
}
console.log(`생성 완료: ${n}장 → scripts/.mock-images/`);
