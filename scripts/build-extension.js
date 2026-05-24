const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'extension');
const envName = process.argv[2] || process.env.EXTENSION_ENV || 'development';
const envPath = path.join(sourceDir, 'env', `${envName}.json`);
const outputDir = path.join(rootDir, 'output', 'extension', envName);

if (!fs.existsSync(envPath)) {
  throw new Error(`Unknown extension environment "${envName}". Missing ${envPath}`);
}

const fileConfig = JSON.parse(fs.readFileSync(envPath, 'utf8'));
const config = {
  apiBaseUrl: normalizeUrl(process.env.EXTENSION_API_BASE_URL || fileConfig.apiBaseUrl),
  frontendUrl: normalizeUrl(process.env.EXTENSION_FRONTEND_URL || fileConfig.frontendUrl),
};

fs.rmSync(outputDir, { recursive: true, force: true });
copyExtensionSource(sourceDir, outputDir);

const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, 'manifest.json'), 'utf8'));
manifest.host_permissions = [
  `${new URL(config.apiBaseUrl).origin}/*`,
  `${new URL(config.frontendUrl).origin}/*`,
];
manifest.externally_connectable = {
  matches: [`${new URL(config.frontendUrl).origin}/*`],
};

fs.writeFileSync(
  path.join(outputDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

fs.writeFileSync(
  path.join(outputDir, 'config.js'),
  `globalThis.LEARNCLIP_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
);

console.log(`Extension build created: ${path.relative(rootDir, outputDir)}`);
console.log(`API base URL: ${config.apiBaseUrl}`);
console.log(`Frontend URL: ${config.frontendUrl}`);

function normalizeUrl(value) {
  if (!value) throw new Error('Extension URL config cannot be empty');
  return value.replace(/\/+$/, '');
}

function copyExtensionSource(from, to) {
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === 'env') continue;

    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyExtensionSource(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}
