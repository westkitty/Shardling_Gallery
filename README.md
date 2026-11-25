# Shardling Gallery

A Starsilk character lab for a reusable Shardling body. The target is **Three.js r187**. The lower body is an interpretation of the reference, not additional canon.

## Use

Open `Shardling_Gallery.html` (or the built `dist/index.html`) in a current WebGL 2 browser. It runs directly from a local file and needs no login, CDN or server. If Android's Download preview shows raw HTML or a blank screen, choose **Open with → Chrome** rather than opening the file in an attachment preview.

- **Gallery:** ten rendered pose thumbnails load live combinations on A or B. Freeze, scrub, loop, replay, orbit, or switch to one actor.
- **Layers:** 12 discrete display emotions, six individually drawn frames each, plus a true blank. Beat durations, phase and direction are per actor. The color/glyph and pose can be changed independently. Twelve skeletal clips, three swappable growth morphologies, and occasional drifting body-only ink wisps.
- **Lighting:** five looks and editable key, rim, background, intensity, fill and key angle.
- **Export:** JSON saves the active camera, both actors, growth, motion, faces, playback preferences and lighting. Use Import setup to reopen it. GLB export gives the selected growth, skinned rig, transparent/blank mask overlay and all twelve skeletal animation clips. It deliberately has no baked mask glyph, ink wisps or lighting. Export the transparent LED atlas for a non-JS runtime: 12 rows, 6 frames, 256 px tiles, left-to-right; setup JSON provides row IDs and native frame dwell times. The standalone mask module can instead draw your textures directly.
- The shipped source GLB is a multi-variant assembly. Independent apps should use the gallery's clean **Download rig GLB** for one visible growth, or call the runtime below before displaying the assembly.

## Integrate

```js
import { loadShardling, createShardling } from './src/shardling.mjs';

const asset = await loadShardling('/assets/Shardling-Body.glb');
const a = createShardling(asset, { seed: 1 });
const b = createShardling(asset, { seed: 8 });
a.apply({ growth: 'Fault', emotion: 'giddy', motion: 'point-and-laugh' });
b.apply({ growth: 'Comet', emotion: 'bashful', motion: 'bashful-fold' });
scene.add(a.object, b.object);
// In the host's renderer loop: a.update(dtSeconds); b.update(dtSeconds);
// Change LED independently: a.apply({ emotion: 'tearful' });
// Dispose each actor when retired: a.dispose(); b.dispose();
```

The body material/geometry are shared, but the LED material, texture, animation mixer and wisp meshes belong to each actor. Bone names are preserved by the source exporter; browser clips bind to each actor's own skeleton. `three` and its add-ons should come from a single installed version. `assets/Shardling-Body.blend` is editable Blender source. From the project root, regenerate with `blender -b -P tools/build_model.py`. The underlying body rig is intentionally browser-oriented (procedural angular geometry and segment-weighted form), not a production sculpt or facial mesh.

## Build, test and optional GitHub Pages

```sh
npm ci
npm test
npm run build
```

The static output is entirely in `dist/`. A separate offline browser integration check is in `tests/browser.cjs` (Playwright and Chromium required; set `BROWSER_BIN` and optionally `EXPORT_GLTF=1`). The Pages workflow automatically **builds and checks** on intended source pushes/PRs but never publishes on push. For a future publish, configure **Settings → Pages → Source → GitHub Actions** after confirming the plan supports the intended repository visibility. Then run **Build Shardling Gallery** manually on `main` with **publish** checked. Do not change visibility merely to run the workflow. The site itself may be public even if the source repository is private. No custom domain, third-party API keys or secret configuration is needed.

The Three.js dependency is MIT-licensed. The generated HTML includes its license. No third-party model packs, remote textures, music or telemetry.
