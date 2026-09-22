# Template map

## Environment

Need Node.js 22.13+, npm, and a WebGL2 browser. Template dependency versions are pinned. The first install needs network. No API key, Cloudflare, or original author project is required.

```sh
node <this-skill-dir>/scripts/scaffold.mjs /path/to/my-building
cd /path/to/my-building
npm ci
npm run dev
```

The dev server listens on `127.0.0.1:5173` by default. Production check: `npm run build`, then `npm run preview`. If the port is taken, read the actual URL from the terminal. The starter ships `package-lock.json`; prefer `npm ci` so versions stay pinned.

## File roles

| File | Change it when |
| --- | --- |
| `src/App.tsx` | playback, pause, timeline, stage names, detail-camera buttons |
| `src/PagodaThreeScene.tsx` | lights, camera presets, OrbitControls, shadow cache, demand rendering, disposal |
| `src/heritage/architecture.ts` | `roof` curved roofs; `bracketBand` dougong; `guardian` stone lions; `shaft` white pagoda; `buildArchitecture` main mass; `courtyard` terrace and pines |
| `src/heritage/materials.ts` | shared palette and procedural color / micro-height / roughness textures |
| `src/heritage/builder.ts` | geometry cache, material batching, per-piece timing, color/depth vertex animation |
| `src/style.css` | exhibit layout and narrow screens, not the building's appearance |

Component props: `progress` (0–1), `view` (`overview` / `roof` / `guardian`), `onReady`. The template building is about 32 scene units tall. The clocks are architectural ornaments, not a live system clock. Do not relabel scene units as metres.

## Adaptation order

1. Keep the full template running. Capture overview, eave, and lion close-ups as the baseline.
2. Change palette, title, and duration. Keep the timeline normalized to 0–1.
3. When changing eave projection, storey count, or tower taper, update that level's wall radius, column grid, dougong, floors, roof inner opening, and elevations together. Current geometry uses explicit design constants; it is not an automatic N-storey system.
4. For a style change, replace part factories one at a time — keep course-by-course masonry, swap clock frames, finials, or railings. If lions are removed, also remove their close-up button and camera target.
5. Stage labels are display-only. Real timing lives in `architecture.ts` start/duration arguments. Update both.

## Example requests

- “Use this skill to make a similar three-storey Chinese clock tower, red walls, dark-green tiles, white background, built storey by storey, orbitable.”
- “Keep the current tower shape and cameras. Only refine eave thickness, timber, and the clock faces. Do not replace the model.”
- “Turn the template into a two-storey lakeside pavilion. Keep timber and tile assembly. No clocks, lions, or background music.”

The template already includes source. Do not copy server dependencies, export dumps, or private config from an author's machine.
