# Reelish 1.6.2 caption styles

The captured Captik catalog contains 106 caption styles. All identifiers were already present, but the previous renderer flattened many layouts into a small set of generic compositions. This release corrects that rendering gap rather than inflating the catalog with renamed duplicates. See [the bounded catalog audit](CAPTION-CATALOG-AUDIT.md).

The 71 detailed looks now retain their complete descriptors: support and hero fonts, independent weights, impact/echo layers, stack row scales, curved emphasis, story layouts, spatial geometry, chips, ink effects and timed motions. These use the same independently written DOM renderer in editor previews and video export. Font and weight customization continue to apply. The browser now exposes filters for behind-person, property, spatial, handwritten and original styles, and searches paired fonts as well as names.

Seven actual open fonts replace shared substitutes: Bagel Fat One, Rubik Spray Paint, Mynerve, Pinyon Script, Special Elite, Baloo 2 and Unna. Each includes its upstream license. There are 44 bundled font families. Restricted font names retain disclosed substitutes in `CliporaPresets.fontFallbacks`; no commercial fonts were taken from Captik.

The visual sweep exposed a real blank-row bug: an unset browser CSS opacity is an empty string, which was treated as zero during fades. The regression test uses browser-style empty properties rather than only plain JavaScript defaults.

## Verification

- `npm test`: caption, font, media and application regression suite.
- `node tests/caption-catalog-desktop.cjs`: all 136 entries (106 reference styles and 30 originals), rendered at three word times. Requires visible pixels and rejects identical complete frame sequences. Produces named desktop contact sheets and a JSON report under `test-output/caption-catalog/`.
- `node tests/caption-layout-export.cjs`: six layout families in a real MP4, decoded and checked for caption pixels.
- `node tests/caption-workflow-desktop.cjs`: first-import, selected/all scope, subtitle import and actual MP4 captions.

These tests establish Reelish rendering and distinguishability on the tested text; they do not establish pixel identity with Captik. Exact original trajectories, semantic hero selection, all color variants, every text length/script and independent foreground/background masking remain unverified. This change does not enable paid or online speech, alter hosted-service privacy, or modify users' caption text.
