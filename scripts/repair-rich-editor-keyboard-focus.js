'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const cssPath = path.join(root, 'css', 'mobile-authoring-focus.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldHeader = `  body.wu-v2-shell[data-wu-core-workspace="basic"]:has(#transliterateTextarea:focus) .wu-site-header,\n  body.wu-v2-shell.rich-editor-page:has(.tox.tox-tinymce.tox-edit-focus) .wu-site-header {\n    display: none !important;\n  }`;
const newHeader = `  body.wu-v2-shell[data-wu-core-workspace="basic"]:has(#transliterateTextarea:focus) .wu-site-header,\n  body.wu-v2-shell.rich-editor-page:has(.tox.tox-tinymce.tox-edit-focus) .wu-site-header,\n  body.wu-v2-shell.rich-editor-page:has(#basic-example_ifr:focus) .wu-site-header {\n    display: none !important;\n  }`;
if (!css.includes(oldHeader) && !css.includes(newHeader)) throw new Error('Rich Editor keyboard header focus block not found.');
css = css.replace(oldHeader, newHeader);

const basicChooser = `  body.wu-v2-shell[data-wu-core-workspace="basic"]:has(#transliterateTextarea:focus) .wu-basic-command-surface {\n    display: none !important;\n  }`;
const richChooser = `\n\n  body.wu-v2-shell.rich-editor-page:has(.tox.tox-tinymce.tox-edit-focus) .input-mode-control-rich,\n  body.wu-v2-shell.rich-editor-page:has(#basic-example_ifr:focus) .input-mode-control-rich {\n    display: none !important;\n  }`;
if (!css.includes(richChooser.trim())) {
  if (!css.includes(basicChooser)) throw new Error('Basic keyboard chooser block not found.');
  css = css.replace(basicChooser, basicChooser + richChooser);
}
fs.writeFileSync(cssPath, css, 'utf8');

const contractPath = path.join(root, 'tests', 'mobile-authoring-focus-contract.test.js');
let contract = fs.readFileSync(contractPath, 'utf8');
const contractAnchor = "assert.match(css, /@media \\(max-width: 767px\\) and \\(max-height: 560px\\)/, 'Keyboard-like small effective viewport needs a bounded fallback');";
const contractAssertion = "\nassert.match(css, /rich-editor-page:has\\(#basic-example_ifr:focus\\) \\.input-mode-control-rich[\\s\\S]*?display:\\s*none !important/, 'Focused Rich Editor must collapse the input chooser when the software keyboard constrains the viewport');";
if (!contract.includes(contractAssertion.trim())) {
  if (!contract.includes(contractAnchor)) throw new Error('Mobile authoring contract anchor not found.');
  contract = contract.replace(contractAnchor, contractAnchor + contractAssertion);
}
fs.writeFileSync(contractPath, contract, 'utf8');

function replaceCacheGeneration(file) {
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes('write-urdu-shell-v45')) return false;
  text = text.replace(/write-urdu-shell-v45/g, 'write-urdu-shell-v46');
  fs.writeFileSync(file, text, 'utf8');
  return true;
}

replaceCacheGeneration(path.join(root, 'sw.js'));
for (const name of fs.readdirSync(path.join(root, 'tests'))) {
  if (!name.endsWith('.test.js')) continue;
  replaceCacheGeneration(path.join(root, 'tests', name));
}

execFileSync(process.execPath, ['scripts/run-contract-tests.js'], { cwd: root, stdio: 'inherit' });
execFileSync('npx', ['playwright', 'test', 'tests/rich-editor-mobile-activation.spec.js'], { cwd: root, stdio: 'inherit' });

console.log('Rich Editor keyboard-sized viewport repair validated.');
