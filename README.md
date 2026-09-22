# threejs-architecture-effects

Portable [Agent Skill](https://agentskills.io) by **Hailey**. It builds a real, orbitable Three.js building that assembles itself: brick courses, timber frame, dougong, layered eaves, procedural PBR materials, and close-up cameras.

中文：给 Codex / Claude Code / Cursor 用的开源 skill。输出是可运行的三维古建网站，不是贴图揭幕，也不需要 API key。

[![Brick-by-brick construction of a Chinese clock tower](assets/preview.gif)](https://github.com/lhlGitHub/threejs-architecture-effects/blob/main/assets/preview.mp4)

<p align="center"><a href="https://github.com/lhlGitHub/threejs-architecture-effects/blob/main/assets/preview.mp4">Watch the full 20s demo →</a></p>

<img src="assets/preview.png" alt="Completed clock-tower miniature" width="100%">

GitHub README cannot play a repo `.mp4` inline, so the motion preview is a GIF. Click it (or the link) to play the full video.

## What you get

- A **solid 3D miniature**, not a video on a plane
- Construction driven by **one 0–1 timeline**: play, pause, scrub backward, replay
- **Procedural** brick, wood, plaster, tile, stone, bronze — no paid models
- Orbit, zoom, and detail cameras for eaves and stone lions
- A Vite + React + Three.js starter you can run with `npm ci && npm run dev`

The bundled clock tower is a working example, not a historical reconstruction and not the only design this skill can make.

## Install

Copy this folder into the agent skills directory, then start a new session:

| Runner | Path |
| --- | --- |
| Codex | `~/.codex/skills/threejs-architecture-effects` (or `$CODEX_HOME/skills/`) |
| Claude Code | `~/.claude/skills/threejs-architecture-effects` |
| Cursor | `~/.cursor/skills/threejs-architecture-effects` |

```sh
git clone https://github.com/lhlGitHub/threejs-architecture-effects.git
cp -R threejs-architecture-effects ~/.cursor/skills/
```

Then ask:

> Use $threejs-architecture-effects to make a Chinese pavilion like the starter: red walls, dark-green tiles, built storey by storey, orbitable, with eave close-ups.

Other useful prompts:

- Keep the current tower shape and cameras. Only refine eave thickness, timber, and the clock faces.
- Turn the template into a two-storey lakeside pavilion. Keep timber and tile assembly. No clocks or lions.

## Run the starter without an agent

Needs Node.js 22.13+, npm, and a WebGL2 browser.

```sh
git clone https://github.com/lhlGitHub/threejs-architecture-effects.git
node threejs-architecture-effects/scripts/scaffold.mjs ./my-building
cd my-building
npm ci
npm run dev
```

The scaffold copies `assets/starter/` into a new directory and **refuses to overwrite** an existing one. It does not install packages or start a server.

Controls: drag to orbit, scroll to zoom, timeline to scrub, **飞檐细赏** / **石狮近观** for close-ups.

## How construction works

1. Write an assembly plan: foundations → frame → masonry → decks → upper walls → brackets / eaves / tiles → ornament.
2. Model the finished silhouette first so parts share dimensions and nothing floats.
3. Give every solid piece a start, duration, and travel. Color and shadow shaders share one progress value, so seeking is deterministic.
4. Author materials separately (color, roughness, micro-height). Do not hide crude joints with fog or bloom.

Details for agents: [SKILL.md](SKILL.md), [construction principles](references/construction-principles.md), [template map](references/template-guide.md), [verification](references/verification.md).

## Layout

```
threejs-architecture-effects/
├── SKILL.md                 Agent entry
├── LICENSE                  MIT, Copyright (c) 2026 Hailey
├── agents/openai.yaml       Codex UI metadata
├── scripts/scaffold.mjs     Copy the starter into a new project
├── references/              Construction, template map, verification
├── assets/preview.gif       README motion preview
├── assets/preview.png       README still
├── assets/preview.mp4       Full screen recording
└── assets/starter/          Vite + React + Three.js miniature
```

## Limits

- Procedural geometry only. No paid model service, no background music in the starter.
- Video export is not included; the template is an interactive site.
- Desktop-oriented. Do not claim museum quality, historical accuracy, or universal 60 FPS from one machine.
- npm packages keep their own licenses. This skill does not vendor `node_modules`.

## License

MIT. Copyright (c) 2026 Hailey. See [LICENSE](LICENSE).
