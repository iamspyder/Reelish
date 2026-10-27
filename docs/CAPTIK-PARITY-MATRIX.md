# Captik functionality parity evidence — 28 October 2026

This matrix describes the current development tree, including changes not yet released. It is not a percentage score or a claim of complete equivalence. **Tested** means a Reelish behavior has a passing check; it does not mean Captik produces identical output. **Implemented** means available but the relevant new end-to-end check is pending. **Partial** means some behavior exists with concrete remaining gaps. **Blocked** records a chosen policy or unavailable dependency. **Unknown** means the evidence cannot establish equivalence.

## Original evidence and its limits

The signed-in editor observation is recorded in [CAPTIK-EDITOR-FINDINGS.md](CAPTIK-EDITOR-FINDINGS.md). The approved CC0 interview was uploaded and English transcription completed. Captik's original video preview remained black while timeline thumbnails appeared. No original paid export, full graphics inventory, voice recording, every animation or generative workflow was exercised. Visible controls establish their presence, not their correctness or precise rendering.

REA's portable record `ev_e06c254504a7f6911cc32f88d735650d5713b85e4001d4a04a26c1d03a6522a5`, retained in ignored `evidence/authenticated-editor-rea.json`, identifies artifact SHA-256 `b6a70bec5d9d040506859a443dd81c06abfecdba3196d479be02977257d06558`: 20 parsed public JavaScript files, 1,355,250 bytes, zero parse failures. Its graph is explicitly partial. Dynamic/obfuscated paths and server implementation remain unavailable; static strings/imports do not establish runtime execution. This agent's independent REA session had no prior retained records, so it used the existing portable bundle rather than rerunning target analysis. No authenticated endpoints, account credentials or session tokens were copied into Reelish.

REA CLI `inspect-evidence-bundle` confirmed 13 retained records and one exact matching complete record. A focused `trace-application-feature` for string `future` returned no matching graph entity and explicitly retained partial source coverage; this does **not** show that the observed future-word controls are absent. Their presence is supported by the signed-in UI observation, while their internal implementation remains unknown.

## Function-by-function status

| Captik function observed | Reelish status | Evidence, limitation or remaining work |
|---|---|---|
| Upload, new project, recent local projects | Partial | Import/new/save/open/autosave/recovery implemented. Exact original dashboard/help/recent-project presentation is not matched. |
| Language detection/selection | Partial | Auto + 28 language choices exist. Equivalent detection accuracy and service behavior not established. |
| Native/Romanized/English subtitle preparation | Partial | Native captions/import plus Hinglish and translation of existing captions. Original Sarvam recognition pipeline is not reproduced. |
| Automatic online speech and regenerate | Blocked | Paid speech is explicitly disabled by the user. OpenRouter free text is not word-timed speech recognition; no unlimited free online provider has been verified. |
| Personal AI connection | Tested | OpenRouter key stored encrypted locally, free-only text routing. Hosted service remains private by user choice. |
| Word text/timing edits | Tested | Measured timing retained when available; estimated timing for imported plain text is not presented as measured recognition. |
| Merge up/down | Tested | Exact existing words/times/emphasis preserved; undo verified; overlapping cues rejected until retimed. `caption-parity-desktop.cjs`. |
| One/two caption lines, grouping/word count | Implemented | Existing line count, words-per-line and regrouping controls retained; exact original grouping algorithm unknown. |
| Selected-caption behind-speaker switch | Tested | Behind/front/inherit override plus global depth enable. Desktop control/undo/state verified. |
| Person masking and tracking | Partial | Bundled local mask/tracking shared by preview/export. Confidence/softness/feather edge controls implemented and UI-tested; exact quality and manual frame-by-frame correction are not matched. |
| Independent entrance/exit/word motion | Tested | None/fade/rise/slide/pop independently compose; duration editable. Actual export document and preview produce matching shared DOM paint. Exact original curves/catalog unknown. |
| Active word color/box/grow/glow/underline | Tested | Existing active box/scale plus independent underline/grow/glow and color overrides; shared paint verified. Original effect shapes and combinations unverified. |
| Future-word show/dim/hide | Tested | Explicit modes plus future/past opacity and color. Hide preserves text layout. Exact original layout behavior unknown. |
| Caption opacity, tilt, grouping, position | Tested / Partial | New opacity/tilt shared renderer tested; grouping/position existing. Full original per-control limits and interactions unknown. |
| Dynamic/behind/songs/property/spatial/static template catalog | Partial | 136 looks and 37 font families; catalog labels do not establish matching motion/layout. Scribble/Archives and every original color variant not individually verified. |
| Custom fonts/presets/favorites | Implemented | Existing bundled/custom font import and saved styles/favorites. Every original font weight and glyph coverage not compared. |
| Word/line timeline and shift timing | Tested | Word dragging/resizing, line drag retimes word metadata, shift-all checks pass. |
| Timeline snapping and zoom/fit | Tested / Unknown | Reelish zoom/fit/snapping checked in the editor; exact original interaction remains unverified. |
| Split, cut before/after, duplicate | Tested | Clip-tool desktop checks include actual edits and preserved dependent timing. Exact original ripple-selection behavior unknown. |
| Speed, reverse, freeze frame | Tested | Speed 0.25–4 with pitch-preserving audio, reverse limited to 60 seconds, freeze 0.1–30 seconds. Time-dependent project events retimed. These limits/semantics are Reelish's, not inferred Captik limits. |
| Mirror, rotate, motion keyframes | Tested | Existing motion renderer plus mirror/rotation and keyframes. Exact original easing catalog unknown. |
| Preview zoom/grid/safe areas/fullscreen | Tested | Grid/magnification stay preview-only; existing safe areas/fullscreen retained. Original platform safe-zone geometry not pixel-matched. |
| Direct manipulation | Partial | Graphic/overlay position and resize tools exist; all original objects/handles and snapping not exhaustively matched. |
| Main-track media insertion | Tested | Main clip import/trim/split/export exists. |
| Video/image picture in picture | Tested / Partial | New independent timed media layers have actual MP4 pixel proof; audio source trim/start/volume/mute verified. Corner resize, keyframe editing and managed H264/AAC normalization tested. Not a complete arbitrary track editor. |
| Audio extraction | Tested | Actual clip-tool WAV extraction check. |
| Voiceover | Tested / Partial | MediaRecorder UI and generated synthetic audio normalization verified. User microphone was not recorded; acoustic/device coverage unknown. |
| Search/category sound library | Tested / Partial | 112 sounds including 100 CC0 Kenney effects; search, filters, decoding and export tested. Captik's exact named catalog/music licenses/assets are not duplicated. |
| Automatic sound placement/intensity | Tested | Reviewed placement/intensity, trim/fades, preview, apply/undo and real exported audio verified. |
| Music picker/level | Partial | Local audio import/volume/loop/mix exists; original hosted catalog and browsing are not matched. |
| Text graphics Everything/Titles/category filters | Partial | 44 independently authored designs vs Captik's observed UI count of 976 Everything / 478 Titles. The observed counters are not proof that every original asset works. |
| Graphics autofill/color matching | Tested | Caption autofill and color/font matching tested; original behavior and full template data remain unverified. |
| Adjustment layer/preset grades | Tested | Timed cross-clip adjustments; existing presets tested. Exact original color transforms unknown. |
| Crop/RGB curves/vignette | Tested | Shared preview/export surface; actual source crop, RGB inversion and decoded MP4 pixels verified. |
| AI opening hooks | Partial | Reviewed opening line/screen words/shot ideas available. Test fixture coverage and free Hinglish live proof do not validate every live model task. |
| AI edit styles/generative B-roll/Recreate/plugins | Partial / Unknown | Reviewed edit plans apply existing graphics, punch-ins and sounds. No proven equivalents for every original generative/media/plugin workflow. |
| Export quality/aspect/SRT | Tested / Partial | Local MP4, aspect ratios and subtitle output exist. Actual Reelish pixel/audio tests pass for individual features. Original paid exported output was not available for comparison. |
| Account minute meters/watermark removal | Unknown / Different product behavior | Original account/billing controls observed; Reelish has no equivalent account/minute billing system. No paid watermark removal was exercised. |
| Every function combined in one project | Unknown | Per-feature tests do not prove all combinations, long projects, codecs or all operating systems. |

## Open-source components investigated

These are candidate building blocks, not proof of matching Captik and not newly installed dependencies. Check their full pinned license/notice files before redistribution. Library code licenses do not grant rights to unrelated animation, sound or stock-video assets.

| Official repository | License verified at source | Useful remaining scope and limits |
|---|---|---|
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | MIT | Deterministic frame-seeking SVG/canvas animation renderer for authored graphic packs. Could grow the design catalog; it supplies a renderer, not Captik's 976 designs. Each imported animation needs its own rights and export fidelity checks. |
| [katspaugh/wavesurfer.js](https://github.com/katspaugh/wavesurfer.js) | BSD-3-Clause | Interactive waveform/regions for precise audio editing. Suitable audio UX component; it is not a multitrack video compositor or audio-render/export engine. |
| [byomakase/omakase-player](https://github.com/byomakase/omakase-player) | Apache-2.0 | Frame-accurate playback/timeline framework worth evaluating for complex tracks. Replacing current Electron media playback would require explicit codec and export consistency work. |
| [AcademySoftwareFoundation/OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO), [license](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/main/LICENSE.txt) | Apache-2.0 | Timeline interchange/model for later professional-editor integration. It describes editorial decisions; it does not render frames, implement Captik effects or provide online AI. |
| [bbc/peaks.js](https://github.com/bbc/peaks.js) | LGPL-3.0 | Zoomable waveform/segment interaction alternative; upstream README says ongoing development moved to Codeberg. More redistribution obligations than the BSD alternative; not selected for immediate integration. |

No available repository establishes a ready-made exact Captik replacement. Remaining parity requires evidence-backed behavior comparison, original licensed content or independently authored equivalents, and end-to-end validation.
