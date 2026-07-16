const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Niveles', 'Nivel_1.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split(/\r?\n/);
const result = [];
let keeping = true;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('<<<<<<<')) {
        // HEAD comes first, we keep it
        keeping = true;
        continue;
    } else if (line.startsWith('=======')) {
        // the other branch comes next, we discard it
        keeping = false;
        continue;
    } else if (line.startsWith('>>>>>>>')) {
        // end of conflict, resume keeping
        keeping = true;
        continue;
    }
    
    if (keeping) {
        result.push(line);
    }
}

fs.writeFileSync(filePath, result.join('\n'));
console.log('Conflicto resuelto en Nivel_1.js guardando HEAD.');
