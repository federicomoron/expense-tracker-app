const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the component name from the command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error('❌ Please provide a component name. Example: yarn genc MyComponent');
  process.exit(1);
}

// Define project root (src/app) and current working directory
const projectRoot = path.resolve(__dirname, '../src/app');
const cwd = process.cwd();

// Determine if the provided path is absolute from src/app or relative to cwd
let componentPath;
if (componentName.startsWith('src/app/')) {
  componentPath = path.relative(projectRoot, path.resolve(componentName));
} else {
  componentPath = componentName;
}

// Angular CLI command flags for generating a component
const defaultFlags = ['--skip-tests', '--inline-style=false', '--inline-template=false'].join(' ');

console.log(`🛠 Generating component '${componentName}' in ${cwd}...`);

// Execute Angular CLI to generate the component
execSync(`ng g c ${componentPath} ${defaultFlags}`, { stdio: 'inherit' });

// Absolute path to the generated TypeScript file
const tsFilePath = path.join(
  projectRoot,
  componentPath,
  `${path.basename(componentPath)}.component.ts`,
);

// If the generated TypeScript file exists, modify it
if (fs.existsSync(tsFilePath)) {
  let tsContent = fs.readFileSync(tsFilePath, 'utf8');

  // Add 'standalone: true' to the @Component decorator if not present
  if (!/standalone\s*:\s*true/.test(tsContent)) {
    tsContent = tsContent.replace(/imports\s*:\s*\[/, 'standalone: true,\n  imports: [');
    // Force LF line endings
    tsContent = tsContent.replace(/\r\n/g, '\n');
    fs.writeFileSync(tsFilePath, tsContent, 'utf8');
  }

  // Format .ts and .html files in the component folder using Prettier
  const prettierCmd = `prettier --write "${path.join(projectRoot, componentPath, '*.ts')}" "${path.join(projectRoot, componentPath, '*.html')}"`;
  execSync(prettierCmd, { stdio: 'inherit' });

  console.log(
    `✅ Component '${componentName}' successfully generated at '${path.join(projectRoot, componentPath)}'`,
  );
  console.log('Standalone: true added, all files formatted with LF and Prettier.');
} else {
  console.error(`❌ Generated TS file not found: ${tsFilePath}`);
  process.exit(1);
}
