const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const assetsDirectory = path.join(__dirname, 'assets', 'fonts');
function readManifest() {
  const file = path.join(assetsDirectory, 'manifest.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { version: 1, families: [] };
}

// Read standard OpenType name/OS2/fvar tables without executing any font content.
function inspectFont(input) {
  const b = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
  if (b.length < 12 || b.length > 30 * 1024 * 1024) throw new Error('Font must be a valid TTF or OTF smaller than 30 MB.');
  if (b.readUInt32BE(0) !== 0x00010000 && b.toString('ascii', 0, 4) !== 'OTTO') throw new Error('Only TrueType and OpenType fonts are supported.');
  const tables = {};
  const count = b.readUInt16BE(4);
  if (12 + count * 16 > b.length) throw new Error('Invalid font table directory.');
  for (let i = 0; i < count; i++) {
    const at = 12 + i * 16, offset = b.readUInt32BE(at + 8), length = b.readUInt32BE(at + 12);
    if (offset + length > b.length) throw new Error('Invalid font table bounds.');
    tables[b.toString('ascii', at, at + 4)] = b.subarray(offset, offset + length);
  }
  const names = new Map(), n = tables.name;
  if (!n || n.length < 6) throw new Error('Font has no name table.');
  const strings = n.readUInt16BE(4), records = n.readUInt16BE(2);
  for (let i = 0; i < records; i++) {
    const at = 6 + i * 12;
    if (at + 12 > n.length) throw new Error('Invalid font names.');
    const platform = n.readUInt16BE(at), language = n.readUInt16BE(at + 4), id = n.readUInt16BE(at + 6);
    const length = n.readUInt16BE(at + 8), start = strings + n.readUInt16BE(at + 10);
    if (start + length > n.length) continue;
    let value;
    if (platform === 0 || platform === 3) {
      const bytes = Buffer.from(n.subarray(start, start + length));
      if (bytes.length % 2) continue;
      bytes.swap16(); value = bytes.toString('utf16le');
    } else if (platform === 1) value = n.toString('latin1', start, start + length);
    if (!value) continue;
    const score = platform === 3 && language === 0x409 ? 3 : platform === 0 ? 2 : 1;
    if (!names.has(id) || names.get(id).score < score) names.set(id, { value: value.replace(/\0/g, ''), score });
  }
  const family = (names.get(16) || names.get(1))?.value;
  if (!family) throw new Error('Font has no readable family name.');
  const style = (names.get(17) || names.get(2))?.value || 'Regular';
  let weight = tables['OS/2']?.length >= 6 ? tables['OS/2'].readUInt16BE(4) : 400;
  let weightRange = null;
  const f = tables.fvar;
  if (f?.length >= 16) {
    const offset = f.readUInt16BE(4), axes = f.readUInt16BE(8), size = f.readUInt16BE(10);
    for (let i = 0; i < axes && size >= 20; i++) {
      const at = offset + i * size;
      if (at + 20 > f.length) break;
      if (f.toString('ascii', at, at + 4) === 'wght') weightRange = [f.readInt32BE(at + 4) / 65536, f.readInt32BE(at + 12) / 65536];
    }
  }
  return { family, style, weight, weightRange, italic: /italic|oblique/i.test(style), format: b.toString('ascii', 0, 4) === 'OTTO' ? 'opentype' : 'truetype' };
}

function importFont(source, userDirectory) {
  const bytes = fs.readFileSync(source), metadata = inspectFont(bytes);
  fs.mkdirSync(userDirectory, { recursive: true });
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  const filename = `${hash}.${metadata.format === 'opentype' ? 'otf' : 'ttf'}`;
  const destination = path.join(userDirectory, filename);
  fs.writeFileSync(destination, bytes);
  const record = { ...metadata, file: filename, path: destination, hash };
  fs.writeFileSync(path.join(userDirectory, `${hash}.json`), JSON.stringify(record, null, 2));
  return record;
}
function listImportedFonts(userDirectory) {
  if (!fs.existsSync(userDirectory)) return [];
  return fs.readdirSync(userDirectory).filter(f => /^[a-f0-9]{64}\.json$/.test(f)).flatMap(f => {
    try { const value = JSON.parse(fs.readFileSync(path.join(userDirectory, f), 'utf8')); return fs.existsSync(value.path) ? [value] : []; } catch { return []; }
  });
}
function fontFaceCss(manifest = readManifest(), baseUrl = './assets/fonts/') {
  return manifest.families.flatMap(family => family.faces.map(face => `@font-face{font-family:${JSON.stringify(family.family)};src:url(${JSON.stringify(baseUrl + face.file)}) format('${face.format}');font-style:${face.italic ? 'italic' : 'normal'};font-weight:${face.weightRange ? face.weightRange.join(' ') : face.weight};font-display:swap;}`)).join('\n');
}
function prepareFontsDirectory(destination, importedDirectory) {
  fs.mkdirSync(destination, { recursive: true });
  for (const family of readManifest().families) for (const face of [...family.faces, ...(family.exportFaces || [])]) {
    const source = path.join(assetsDirectory, face.file);
    const target = path.join(destination, `${family.id}-${path.basename(face.file)}`);
    if (!fs.existsSync(target) || fs.statSync(target).size !== fs.statSync(source).size) fs.copyFileSync(source, target);
  }
  const imported = Array.isArray(importedDirectory) ? importedDirectory : importedDirectory ? listImportedFonts(importedDirectory) : [];
  for (const font of imported) {
    const target = path.join(destination, path.basename(font.file || font.path));
    if (!fs.existsSync(target)) fs.copyFileSync(font.path, target);
  }
  return destination;
}
function exportFamily(familyName, weight = 400, italic = false) {
  const family = readManifest().families.find(f => f.family === familyName);
  const faces = (family?.exportFaces || []).filter(f => f.italic === Boolean(italic));
  return faces.sort((a, b) => Math.abs(a.weight - weight) - Math.abs(b.weight - weight))[0]?.family || familyName;
}
module.exports = { manifest: readManifest(), readManifest, assetsDirectory, inspectFont, importFont, listImportedFonts, fontFaceCss, prepareFontsDirectory, exportFamily };
