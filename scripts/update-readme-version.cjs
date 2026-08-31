/**
 * Script: prepack
 * Sincroniza a versão do package.json no README.md automaticamente.
 *
 * Roda antes de `npm pack` e `npm publish` (hook "prepack").
 * Garante que o README publicado no npm sempre reflita a versão atual.
 *
 * Substitui:
 *   **v1.0.0**            → **v1.0.1**   (menção de versão em destaque)
 *   "versão 1.0.0"        → "versão 1.0.1" (mencional no texto)
 *
 * Links CDN usam @latest → permanecem dinâmicos (não são alterados).
 */
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const readmePath = path.join(__dirname, '..', 'README.md');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

let readme = fs.readFileSync(readmePath, 'utf8');
const original = readme;

// Substitui menção de versão em negrito: **vX.Y.Z**
readme = readme.replace(/\*\*v\d+\.\d+\.\d+\*\*/g, `**v${version}**`);

// Substitui menção de versão no texto: "versão X.Y.Z"
readme = readme.replace(/versão\s+\d+\.\d+\.\d+/gi, `versão ${version}`);

if (readme !== original) {
  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log(`✅ README.md sincronizado para v${version}`);
} else {
  console.log('✅ README.md já está sincronizado com a versão atual');
}