# From image collage to a real 3D build

## Structure

- Lay brick courses bottom to top. Keep hairline joints and a backing wall. Openings are real voids with wedge voussoirs, not dark decals on a solid wall.
- Column bases sit on foundations or decks. Beams meet capitals. Purlins, rafters, and dougong (斗拱) carry the roof. Do not hover a complete timber cage above finished masonry.
- Separate load-bearing structure from late ornament. Flying eaves (飞檐) may install later; upper walls still need a solid deck. Do not ignore the back and soffit just to match one camera.
- When a pagoda shaft is segmented, every segment shares one taper function and continuous UVs. Relaying texture per segment creates horizontal bands and loading-bar seams.
- Adjacent roof slopes share a boundary and height function. Tiles follow that surface. A roof needs top, soffit, fascia thickness, and ridge covers. Watch winding so undersides do not vanish.
- Do not scale an entire storey in place of masonry. That also scales mortar, openings, and wood grain.

## Reversible assembly timeline

Template `aBuild` stores start, duration, and travel per vertex. `uBuildProgress` is the one shared clock. Every vertex of a piece uses the same time so the piece lands as a rigid body and does not warp. Unstarted pieces `discard`. Pieces under construction stay opaque — do not fade walls in with alpha.

Color and shadow-depth materials use the same displacement. Otherwise unfinished parts cast shadows early. Any shader edit must update `customProgramCacheKey`. At completion, displacement is exactly zero. The last ornament's start + duration must not exceed 1.

Large members settle first; small pieces follow. Easing and a small landing bounce should feel like weight, not a spring toy. Ornament must not land before the deck that supports it. Variation uses a fixed seed so replay, scrubbing, and reload do not reshuffle.

## Materials

- **Tiles:** small range of grey-green / dark jade / aged bronze. Keep mortar, overlap, and eave-end discs. Avoid high-contrast noise or huge per-tile hue jumps.
- **Wood:** grain along the member, warm/dark brown shifts, slight worn edges. Sampling must not be identical on every stick, and must not break a continuous wall with random UVs.
- **Brick:** real joints and small chamfers. Calm colour. Do not wrap one brick photo around a smooth box.
- **Plaster:** fine grain, weak rain streaks, a little exposed brick. Exposure edges should not be regular sawteeth or a repeating per-course stamp. Ageing is not a ruin.
- **Stone:** micro-height and roughness for grain; modelling for carving. Noise-stacked spheres can still read as toys — report that gap honestly.
- **Bronze / clocks:** a little metal, thick frames, inset dials, solid hands and ticks. Glass is a cheap transparent reflection, not per-face transmission with extra scene renders.

Color maps use sRGB. Roughness and micro-height maps do not. Paint stains are not bump pits. The template's downward vertex darkening is a stand-in, not physical AO, and does not replace contact shadows.

## Working with an existing design

Prefer refining the original factories. Do not replace composition, silhouette, and interaction just because the user said “premium”. Verify art as silhouette → functional detail → material → light, not as a triangle-count race. New buildings may reuse the method without copying this clock tower's ornaments.
