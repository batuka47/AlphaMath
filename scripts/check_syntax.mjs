import { readdirSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';

const dir = 'D:/Projects/AlphamathV1.9/src/datas/years';
const files = readdirSync(dir).filter(f => f.endsWith('.js'));
const errors = [];

for (const f of files) {
    try {
        const src = readFileSync(`${dir}/${f}`, 'utf8');
        // Use Function constructor to check syntax (handles template literals etc)
        new Function(src.replace(/^export default /m, 'return '));
    } catch(e) {
        errors.push(`${f}: ${e.message.split('\n')[0]}`);
    }
}

if (errors.length === 0) {
    console.log('All files valid!');
} else {
    console.log(`${errors.length} files with errors:`);
    errors.forEach(e => console.log(' ', e));
}
