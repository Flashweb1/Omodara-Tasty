const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const partialsDir = path.join(rootDir, 'partials');
const srcDir = path.join(rootDir, 'src');

// Load partials
const partials = {};
fs.readdirSync(partialsDir).forEach(file => {
    if (file.endsWith('.html')) {
        const name = path.basename(file, '.html');
        partials[name] = fs.readFileSync(path.join(partialsDir, file), 'utf8');
    }
});

// Process each source page
fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.html')) {
        let content = fs.readFileSync(path.join(srcDir, file), 'utf8');

        // Replace all partial markers {{> partialName }}
        content = content.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (match, name) => {
            if (partials[name]) {
                return partials[name];
            }
            console.warn(`Warning: Partial "${name}" not found in file ${file}`);
            return match;
        });

        fs.writeFileSync(path.join(rootDir, file), content);
        console.log(`Built: ${file}`);
    }
});

console.log('\nBuild complete!');
