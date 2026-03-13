const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = [
    { regex: /bg-gold text-black/g, replacement: 'bg-[#E8E6E1] text-[#111110]' },
    { regex: /bg-gold/g, replacement: 'bg-[#E8E6E1]' },
    { regex: /text-gold/g, replacement: 'text-[#E8E6E1]' },
    { regex: /border-gold/g, replacement: 'border-[rgba(232,230,225,0.25)]' },
    { regex: /hover:text-gold/g, replacement: 'hover:text-[#E8E6E1]' },
    { regex: /hover:bg-gold/g, replacement: 'hover:bg-[#FFFFFF]' },
    { regex: /hover:border-gold/g, replacement: 'hover:border-[#E8E6E1]' },
    { regex: /#FFD700/gi, replacement: '#E8E6E1' },
    { regex: /#0a0a0a/gi, replacement: '#111110' },
    { regex: /#111111/gi, replacement: '#1A1A18' },
    // Reemplazos de botones y layouts que usualmente estaban acoplados
    { regex: /bg-black text-white/g, replacement: 'bg-[#111110] text-[#E8E6E1]' },
    { regex: /text-white/g, replacement: 'text-[#E8E6E1]' },
    // Hover estados del viejo dorado a blanco glow
    { regex: /hover:bg-white/g, replacement: 'hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all' }
];

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css'))) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

let modifiedFiles = 0;

walkSync(dir, function (filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedFiles++;
        console.log(`Modified: ${filePath}`);
    }
});

console.log(`Total files modified: ${modifiedFiles}`);
