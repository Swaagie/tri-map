import { DOMParser } from 'xmldom';
import tj from 'togeojson';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { argv } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = argv[2];
let sources = await fs.readdir(source);

await Promise.all(
  sources
    .filter((file) => path.extname(file) === '.gpx')
    .map(async function convert(file) {
      const data = await fs.readFile(path.join(source, file), 'utf-8');
      const gpx = new DOMParser().parseFromString(data);

      await fs.writeFile(
        path.join(source, path.basename(file, '.gpx') + '.json'),
        JSON.stringify(tj.gpx(gpx), null, 2)
      );
    })
);
