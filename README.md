# threejs-architecture-effects

Portable [Agent Skill](https://agentskills.io) by **Hailey** for real Three.js architectural construction animations: brick-by-brick masonry, timber frames, layered eaves, procedural PBR materials, and orbitable detail cameras.

中文：把一座可旋转的三维古建「逐层建造」做成可运行网站。自带钟楼微缩模板，不是贴图揭幕，也不需要 API key。作者：Hailey。

## Demo

<video src="assets/preview.mp4" controls muted loop playsinline width="100%">
  <a href="assets/preview.mp4">Starter clock-tower construction animation</a>
</video>

![Starter clock-tower construction animation](assets/preview.mp4)

## Install

Copy this folder into the agent runner's skills directory and start a new session:

| Runner | Path |
| --- | --- |
| Codex | `~/.codex/skills/threejs-architecture-effects` (or `$CODEX_HOME/skills/`) |
| Claude Code | `~/.claude/skills/threejs-architecture-effects` |
| Cursor | `~/.cursor/skills/threejs-architecture-effects` |

Then ask:

> Use $threejs-architecture-effects to make a Chinese pavilion like the starter: red walls, dark-green tiles, built storey by storey, orbitable, with eave close-ups.

## Run the starter without an agent

Requires Node.js 22.13+.

```sh
node threejs-architecture-effects/scripts/scaffold.mjs ./my-building
cd my-building
npm ci
npm run dev
```

The scaffold refuses to overwrite an existing directory. It does not install packages or start a server.

## Layout

```
threejs-architecture-effects/
├── SKILL.md                 Agent entry (read this first)
├── LICENSE                  MIT, Copyright (c) 2026 Hailey
├── agents/openai.yaml       Optional Codex UI metadata
├── scripts/scaffold.mjs     Copy assets/starter into a new project
├── references/              Construction, template map, verification
├── assets/preview.mp4       README demo of the starter
└── assets/starter/          Vite + React + Three.js miniature
```

## Limits

- Procedural geometry only. No paid model service, no background music.
- `assets/preview.mp4` is a demo of the starter, not a substitute for the interactive 3D scene.
- Video export is not included.
- The clock-tower design is a working example, not a historical reconstruction and not a performance promise for every device.
- npm packages keep their own licenses. This skill does not vendor `node_modules`.

## License

MIT. Copyright (c) 2026 Hailey. See [LICENSE](LICENSE).
