const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.vue')) results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Gustavo_Dev/Node_Vue/Financas_App/src');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/text-grey-darken-3/g, '');
    content = content.replace(/bg-white/g, 'bg-surface');
    content = content.replace(/bg-grey-lighten-4/g, 'bg-background');
    fs.writeFileSync(f, content, 'utf8');
});
console.log('Fixed Vue files for dark mode.');
