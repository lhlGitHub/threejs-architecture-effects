# Verification and performance

## Required checks

Run a production build and inspect it in a real browser. A passing compile is not a visual pass.

- Overview, eave close-up, lion close-up; orbit the back and soffit.
- Play 0 → 1. Pause on brick, timber, shaft, and clock stages. Scrub forward and backward.
- Confirm no floating beams, top-first masonry, walls through frame, missing roof backs, pixel cracks, or missing ornaments at completion.
- Check narrow and desktop canvas size, button overlap, camera switches, and window resize.
- Check browser errors, shader compile errors, and failed network requests.
- After React unmount / HMR, dispose geometries, materials, textures, PMREM, shadow maps, controls, ResizeObserver, and rAF.

## Starter metrics

The scene host `.three-scene` exposes `data-render-stats` as live JSON. Fields: `calls`, `triangles`, `geometries`, `textures`, `pieces`, `fps`, `renderFps`, `shadowUpdatesPerSecond`, `idle`, `dpr`.

`fps` is rAF callback rate, not GPU-finished frames. `renderFps` is submitted redraws. At rest, `renderFps=0` and `idle=true` is expected power saving, not a freeze. `calls` / `triangles` are from the last actual draw, including that draw's shadow pass; they are not an idle per-second cost.

Compare before/after at the same window size, DPR, camera, and construction stage. Prefer sustained samples and frame-time spikes. Do not treat a single peak FPS as a performance guarantee.

## Locked-in optimizations

- Repeated small parts share materials and are batched by material. Construction displacement runs on the GPU; the CPU does not update tens of thousands of meshes per frame.
- `shadowMap.autoUpdate = false`. Orbiting a fixed light does not rebuild shadows.
- During construction, shadows update at most ~30 Hz. The 0 and 1 endpoints flush immediately. A paused in-between pose also flushes once.
- No redraw while progress is unchanged, camera damping has settled, and there is no resize. Interaction and progress changes wake immediately.
- Do not hide stutter by dropping animation frames. Shadow update rate may drop; the main timeline stays continuous.

## Tradeoffs

The current template has about 13,000 logical pieces. A desktop overview color pass is about 680k triangles; with a shadow refresh about 1.31M; about 12 batched geometries and 37 textures. Numbers move with version, camera, and culling. They are not a budget promise.

This is not a low-end phone model. Measure first, then choose: lower DPR / shadow resolution, cull pieces that have not started, instance truly identical geometry, or add distant LOD. Do not make every tile its own Mesh. If you instance, keep per-instance timing/tint, correct transforms, and the same shadowed construction motion.

Investigate shader compile, texture upload, and init spikes before deleting detail. Demand rendering does not remove first-build cost. Do not claim that caching alone makes every device smooth.

## Handoff

Report the run URL, preserved design, real changes, measured stats, tests that passed, and devices not checked. Do not auto-publish, buy assets, or export private chats. An MP4 needs a separate deterministic frame capture and its own review; the template is an interactive site, not a video exporter.
