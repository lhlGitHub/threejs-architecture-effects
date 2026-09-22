---
name: threejs-architecture-effects
description: Build or refine real Three.js architectural construction animations, especially Chinese pavilions, pagodas and clock towers with brick-by-brick growth, timber framing, layered eaves, procedural PBR materials and interactive detail cameras. Use for 3D建筑生长、古建搭建特效、楼台逐层建造、建筑动态组装 or similar architectural miniatures; not for flat image reveals or generic website styling.
license: MIT
metadata:
  author: Hailey
  version: "1.0.0"
  requires: "Node.js 22.13+, npm, WebGL2 browser. No API keys."
---

# Three.js Architecture Effects

Create an actual, orbitable 3D building assembled from solid components. The included clock-tower miniature is a working reference, not a mandatory design or a historical reconstruction.

Resolve `<this-skill-dir>` from the loaded `SKILL.md`. Do not mix files from a different install of this skill.

## References

| File | Read it when |
| --- | --- |
| [references/template-guide.md](references/template-guide.md) | scaffolding a new project or mapping starter files |
| [references/construction-principles.md](references/construction-principles.md) | geometry, assembly timing, materials, or lighting |
| [references/verification.md](references/verification.md) | stutter, quality checks, metrics, or handoff |

## Choose the starting point

- **Existing project:** inspect its scene owner, geometry factories, timing, materials, controls, and renderer diagnostics before editing. Preserve its recognizable design, cameras, and interactions unless the user asks to change them. Do not scaffold over it.
- **New project:** read the template guide, then run `node <this-skill-dir>/scripts/scaffold.mjs <new-project-directory>`. The script refuses an existing destination. It copies a self-contained Vite/React/Three.js starter; it does not install packages or start services.
- **Reference video or images:** inspect the supplied media as reference only. Identify structural stages and proportions. Do not return the reference video as your work, paste screenshots onto planes, or promise an unsupported similarity percentage.

## Method

1. Translate the reference into an assembly plan: foundations → load-bearing frame → masonry courses → floor/deck → upper frame/walls → brackets/eaves/tiles → ornament. Distinguish a structural floor from a late-installed decorative roof so higher levels never float.
2. Build the stable final silhouette first. Derive adjoining parts from common dimensions and height functions. Check front, three-quarter, and underside views before refining surface detail.
3. Give each solid component a start, duration, and travel distance. Drive the whole scene from one normalized progress value shared by color and depth shaders. Seeking backward, pausing, and replaying must remain deterministic.
4. Prioritize roof thickness, rafters/purlins, bracket supports, and meaningful joints before increasing ornament count. Then separate brick, plaster, wood, ceramic, stone, and metal through independently authored color, roughness, and micro-height.
5. Use restrained deterministic variation. Preserve repeating architectural rhythm while varying UV sampling, tile tint, and small dimensions; do not randomize joints out of alignment.
6. Light as a clean architectural miniature: controlled key/fill/rim, grounded contact, legible eave undersides. Do not hide crude geometry with fog, bloom, or excessive brightness.
7. Measure the actual scene while assembling, dragging, and viewing close-ups. Preserve or improve the starter's shadow caching and demand rendering. Inspect after any shader or geometry change; a passing build is not a visual test.

## Scope

No external model service, image generation, subscription, proprietary asset, or other skill is required. Procedural geometry is the default; use external assets only when requested or agreed, with their origin and license recorded. The template is silent intentionally; add music only from an authorized source.

Keep this skill as instructions plus a portable starter. Do not copy the creator's private sessions, local paths, environment files, or acquisition packages into generated output.

## What goes wrong

A screenshot mapped onto a plane · scaling a whole storey instead of laying courses · alpha-fading walls into existence · color and shadow shaders that disagree · upper floors with no supporting deck · fog or bloom used to hide crude joints · claiming museum quality, historical accuracy, a market price, or universal 60 FPS from one screenshot.

## Report

Deliver runnable source, startup and build commands, a short account of changed surfaces, observed test results, and remaining limitations.
