# Caption catalog audit — 28 October 2026

The saved Captik caption inventory contains **106 named reference styles: 35 classic styles and 71 `look_*` styles**. Reelish already contains every one of these identifiers, with no duplicate look identifiers. Searching all 24 saved JavaScript sources (four reference-editor files and 20 editor chunks) found no additional literal `look_*` style identifier missing from Reelish. This is a bounded inventory comparison, **not a claim that all original styles render identically** or that a newer online catalog cannot contain additional entries.

The user's report that many styles look the same is consistent with the implementation: source metadata distinguishes layouts, impact layers, fonts, word roles and motion, while the old renderer maps many of them to a small set of generic compositions. Several distinct font families were also substituted. Adding more names would not fix that problem.

## Evidence and repeatable check

Run `node scripts/audit-caption-catalog.cjs` from the project directory. It checks Reelish-owned preset code against saved metadata, scans original source as text only, records SHA-256 digests, and writes `test-output/caption-catalog-audit.json`. Captured original JavaScript is never evaluated. The command fails on missing catalog IDs, missing captured literal look IDs, or duplicate look IDs.

The source catalog is retained in ignored `evidence/templates-v2-findings.json`:

- Catalog REA record: `ev_1a11da53480733a22070152fd5a841af979c2f0803a30034cdec45db6ca2baca`.
- Editor assets REA record: `ev_7b1d3c73a5f2182b08ac288965211c3077dcbd7f8ceab33f856b8c7ec169e204`.
- Editor reference REA record: `ev_443137a6b58a5969e2e2d9a65cb803871bbee4744e863f3e53b8094b474e00c4`.
- Detailed look descriptors: `evidence/reference-editor/request-31.js.txt`, SHA-256 `c910d44ddb06b24fc630a43778d1c48ba1146e92187a38505e5aba521a8f8003`.

Existing REA records were reused; this audit does not claim a fresh authenticated runtime observation. Captik's earlier signed-in preview was black, so original rendered video and exact motion for every style remain unverified. See [editor observations](CAPTIK-EDITOR-FINDINGS.md).

## Observed original categories

| Category | Count |
|---|---:|
| Dynamic | 14 |
| Static | 20 |
| AI | 1 |
| Popular | 2 |
| Behind | 28 |
| Property | 20 |
| Spatial | 21 |
| **Total** | **106** |

The 71 detailed look descriptors divide into 16 karaoke, four flat, six stack, four emphasis, 20 story and 21 spatial styles. Original category labels and implementation family labels describe different groupings; they must not be treated as interchangeable counts. Colour variants, the separate text-graphics catalog, saved custom styles and account-specific/server-generated styles are outside this inventory boundary.

## Font differences found

The detailed metadata references 42 font descriptor strings. At the start of this audit, the following genuine family substitutions could make original styles look less distinct:

| Original descriptor family | Previous Reelish substitution |
|---|---|
| Bagel Fat One | Rubik |
| Rubik Spray Paint | Rubik |
| Pinyon Script | Great Vibes |
| Mynerve | Caveat |
| Special Elite | Space Mono |
| Baloo 2 | Rubik |
| Clash Display | Montserrat |
| Helvetica Bold | Inter |
| Druk Wide | Archivo Black |
| Komika Axis | Luckiest Guy |
| Futura | Montserrat |

Other aliases such as `PoppinsStory` → Poppins and `InterStory` → Inter are internal names for a family, rather than proof of an incorrect family. Weight, italic faces and axes still require verification. The repeatable report records current aliases, so it can reflect subsequent font corrections. Actual third-party fonts require verified redistribution rights; the presence of a font name in Captik metadata does not grant those rights.

## Remaining fidelity limits

The existing extraction records unknown runtime constants as null rather than guessing them. Font selection, layout, grouping, word-role emphasis, front/behind placement, entrance/exit timing, easing, colour variants and preview/export consistency all need separate rendering evidence. Matching all 106 identifiers establishes inventory coverage only. The current renderer work should be judged by visual contact sheets and exported frames, not by catalog counts or preset labels.
