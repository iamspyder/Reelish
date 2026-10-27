# Captik graphics catalog evidence — 27 October 2026

The retained public editor artifact **does contain catalog metadata**, but the captured files do not establish a complete set of rendering recipes. This distinction prevents claiming parity by adding hundreds of names or palette combinations.

## What is present

`evidence/captik-editor-bundles/16bd_s7-4.g4t.js` contains an inert `JSON.parse` string at UTF-16 offsets **424–266787**. Parsed as data without running its bundle bootstrap, it has **978 object entries**. Two entries are general `text_layer` and `image_layer` primitives. The remaining **976** corroborate the signed-in UI's Everything count. The subtraction is a static inference; its exact runtime filtering was not replayed. The observed Titles count of 478 cannot be derived by simply counting the manifest's `text` category (140 entries), so that filter's meaning remains unknown.

Each entry has a display name, category, tags, description, `screen`, `imageParams`, and subcategory. These fields describe intended appearance/input needs; they are not timing curves, component source, parameter defaults, fonts, or exact draw instructions. Example independently implementable ideas include vertical bars that rise sequentially, counters, price cards, notification toasts, chat messages, calendars, reviews and device/browser frames. Such ideas can guide new Reelish primitives, but do not establish exact copied appearance.

| Metadata category | Entry count, including the two general primitives |
|---|---:|
| text | 140 |
| brand | 27 |
| money | 87 |
| time | 47 |
| devices | 78 |
| numbers | 45 |
| charts | 101 |
| compare | 63 |
| decor | 67 |
| quotes | 50 |
| lists | 81 |
| cta | 53 |
| notify | 37 |
| social | 44 |
| places | 25 |
| transitions | 33 |

The same chunk exports category/subcategory/topic taxonomies and a weighted search function over names, tags, descriptions and category labels. Search results favor name prefixes/exact phrases and preserve original order for ties. This supports implementing meaningful categorization/search, not copying template implementations wholesale.

## What is unresolved

`179v-j3m5ybbx.js`, around offsets **30200–31400**, calls `loadedGraphic(g.tpl)`, `loadGraphic(g.tpl)` and `resolveParams(template, g.params)` from imported module **128280**. Rendering receives the template's component plus graphic-clock duration, beat timing, optional camera motion and resolved parameters. This is evidence of a separate loader/renderer layer. The module's exporting definition was not found in the captured 20-file set. Therefore the original per-template implementation, lazy chunk mapping, parameter defaults and whether some templates require further network-loaded assets remain **unknown**. Missing source is not proof that all recipes are server-side.

`0t~y4.yocac.9.js`, around offset **91141**, contains a POST to `/api/graphics/design` with words/moments/language/shape and optional talk/taste inputs. It processes returned design/plan choices and caches them locally. This establishes a candidate design-selection endpoint in shipped code; it does not establish that the endpoint supplies actual renderer source or that the request was successfully executed during the observation. Reelish must not reuse Captik's authenticated endpoint.

REA's source graph is partial, under record `ev_e06c254504a7f6911cc32f88d735650d5713b85e4001d4a04a26c1d03a6522a5` and root SHA-256 `b6a70bec5d9d040506859a443dd81c06abfecdba3196d479be02977257d06558`. The existing portable bundle was inspected; the target was not reanalyzed. Original preview/export quality remains unverified because its browser preview was black. See [the parity matrix](CAPTIK-PARITY-MATRIX.md).

## Practical consequence

Reelish currently has 12 independently authored composition families with three palettes each, displayed as 36 designs. That is **12 structural families**, not 36 unrelated renderers. New development should separately report structural families, authored recipes and palette variants. Reaching a matching display count alone cannot prove matching functionality.
