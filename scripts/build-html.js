/**
 * Automated HTML Compiler for Modular Components
 * PT. Santos Jaya Abadi - Traceability System
 *
 * Compiles public/index.template.html into public/index.html
 * by recursively resolving <!-- include: components/... --> tags.
 */
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const TEMPLATE_FILE = path.join(PUBLIC_DIR, 'index.template.html');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'index.html');

function resolveIncludes(content, baseDir = PUBLIC_DIR, seen = new Set()) {
  const includePattern = /<!--\s*include:\s*([^\s]+)\s*-->/g;

  return content.replace(includePattern, (match, relPath) => {
    const fullPath = path.resolve(baseDir, relPath);

    if (seen.has(fullPath)) {
      console.warn(`[build-html] Circular include detected: ${relPath}`);
      return `<!-- Circular include: ${relPath} -->`;
    }

    if (!fs.existsSync(fullPath)) {
      console.error(`[build-html] Missing component file: ${fullPath}`);
      return `<!-- Missing component: ${relPath} -->`;
    }

    const subSeen = new Set(seen);
    subSeen.add(fullPath);

    const subContent = fs.readFileSync(fullPath, 'utf8');
    return resolveIncludes(subContent, baseDir, subSeen);
  });
}

function buildHtml() {
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`[build-html] Template file not found: ${TEMPLATE_FILE}`);
    return false;
  }

  const templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  const compiledContent = resolveIncludes(templateContent);

  fs.writeFileSync(OUTPUT_FILE, compiledContent, 'utf8');
  const lines = compiledContent.split('\n').length;
  console.log(`[build-html] Compiled ${OUTPUT_FILE} successfully (${lines} lines).`);
  return true;
}

if (require.main === module) {
  buildHtml();
}

module.exports = { buildHtml };

