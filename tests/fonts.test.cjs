const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const fonts = require('../src/fonts.cjs');

test('bundled font names, faces, and redistribution licenses are valid', () => {
  const manifest = fonts.readManifest();
  assert.ok(manifest.families.length >= 20);
  for (const expected of ['Noto Sans', 'Gloria Hallelujah', 'Black Han Sans', 'Fredoka One', 'Dancing Script', 'BBH Bartle', 'Roboto', 'Mona Sans', 'Press Start 2P']) {
    assert.ok(manifest.families.some(f => f.family === expected), `${expected} must be bundled, not a system fallback`);
  }
  for (const family of manifest.families) {
    assert.ok(fs.readFileSync(path.join(fonts.assetsDirectory, family.license), 'utf8').length > 1000);
    for (const face of family.faces) {
      const parsed = fonts.inspectFont(path.join(fonts.assetsDirectory, face.file));
      assert.equal(parsed.family, family.family);
      assert.equal(parsed.italic, face.italic);
      assert.ok(parsed.weight >= 100 && parsed.weight <= 1000);
    }
    for (const face of family.exportFaces || []) {
      const parsed = fonts.inspectFont(path.join(fonts.assetsDirectory, face.file));
      assert.equal(parsed.family, face.family);
      assert.equal(parsed.weight, face.weight);
      assert.equal(parsed.italic, face.italic);
      assert.equal(fonts.exportFamily(family.family, face.weight, face.italic), face.family);
    }
  }
  assert.ok(fonts.fontFaceCss(manifest).includes('font-family:"Instrument Serif"'));
});
test('custom fonts import by hash, retain metadata, and prepare for offline export', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'clipora-font-test-'));
  try {
    const family = fonts.readManifest().families.find(f => f.id === 'anton');
    const record = fonts.importFont(path.join(fonts.assetsDirectory, family.faces[0].file), path.join(temp, 'custom'));
    assert.equal(record.family, 'Anton');
    assert.equal(fonts.listImportedFonts(path.join(temp, 'custom')).length, 1);
    const target = fonts.prepareFontsDirectory(path.join(temp, 'export'), path.join(temp, 'custom'));
    assert.ok(fs.existsSync(path.join(target, record.file)));
    assert.ok(fs.readdirSync(target).length > 20);
    fonts.prepareFontsDirectory(path.join(temp, 'export2'), [record]);
    assert.ok(fs.existsSync(path.join(temp, 'export2', record.file)));
    assert.throws(() => fonts.inspectFont(Buffer.from('Not a font')), /valid TTF/);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
