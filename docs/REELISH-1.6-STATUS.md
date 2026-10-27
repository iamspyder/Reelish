# Reelish 1.6 — implementation and limits

This release adds working editor functions identified from Captik observations. It does **not** establish a 100% equivalent Captik replica. See the [feature matrix](CAPTIK-PARITY-MATRIX.md) and [graphics evidence](CAPTIK-GRAPHICS-EVIDENCE.md).

## Implemented

- Independent video/image overlay tracks: managed H264/AAC preparation, trim, audio level/mute, position, corner resize, crop, visibility, ordering, motion keyframes, duplicate/delete. Shared preview and MP4 rendering; overlay audio is mixed into export.
- Clip speed 0.25–4× with pitch-preserving audio, reverse up to 60 seconds, freeze insertion 0.1–30 seconds, duplication, directional cuts, WAV extraction. Edits create managed media so preview and export use the same files. Timed project events follow edits; reverse is not guaranteed to retain meaningful linguistic alignment.
- 112 sounds: 12 synthesized originals and 100 licensed Kenney CC0 assets. Search/categories, source trim, duration, volume, fades, timeline dragging, reviewed automatic placement and undo. Automatic placement uses timing/keyword rules, not AI. See [asset provenance](SOUND-ASSETS.md).
- 44 graphic designs across 20 composition families. Eight additional independently authored data compositions: bars, donut, chat, notification, calendar, browser, review and receipt. Caption autofill and color/font matching. These are not Captik's 976 templates relabelled as equivalent.
- Source crop, RGB/master color curves, warm/cool balance and vignette. Pinned MIT glfx.js code is bundled with its license and source revision; CPU fallback is available. These affect the main video surface, not separate overlay tracks.
- Caption merging with word timing, per-cue depth, independent entrance/exit/word motion, active underline/grow/glow, opacity/tilt, future-word appearance. Preview grid/magnification, timeline zoom/fit/snapping. Cutout confidence/softness/feather refine segmentation; manual per-frame brush correction is not implemented.
- Resolution plus 24/30/60 fps, encoding quality and effort options.

## Verification

76 unit/integration checks passed. Source desktop checks passed for key storage, caption controls/shared export paint, clip tools, overlays, audio tools, crop/color and final controls. Checks decode actual exported MP4 pixels and audio samples, rather than only checking button presence. Synthetic media and synthetic test credentials were used; no microphone recording or paid AI request was made.

The Windows installer was built and installed successfully on 28 October 2026. The installed version reports 1.6.0 and its application archive matches the tested package byte-for-byte. All seven packaged desktop checks passed; an additional regression check covered all 44 graphic renderers, timing, undo, and synthetic voiceover handling. Other operating systems have not been verified for this revision. Passing these checks does not prove every long-project/codec/feature combination.

## Remaining differences

The captured original contains metadata for 976 graphics, but its full renderer registry and exact recipes were not recovered. The original preview was black in the prior browser observation, so exact original animation/rendering comparisons remain unavailable. Catalog metadata and descriptions are not rendering implementations.

Automatic online speech remains disabled under the publisher's free-only decision. The hosted service remains private. Personal OpenRouter keys support free text tools; they do not enable paid speech or generative video. Every original AI edit, B-roll/Recreate/plugin workflow, hosted music library, dashboard/account/billing behavior, and exact font/style variant is not reproduced or verified. No unlimited-free cloud AI claim is made.

## Open-source provenance

Bundled graphics code: [evanw/glfx.js](https://github.com/evanw/glfx.js), MIT, revision `86ae72acfffcd50774507eb7b69887ba2493dc35`, with license and selected source paths in `src/vendor/glfx/`. Bundled sound assets: [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds), CC0, license retained. Other investigated projects in the feature matrix are research candidates, not bundled dependencies.
