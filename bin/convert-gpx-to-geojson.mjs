import { DOMParser } from 'xmldom';
import tj from 'togeojson';
import fs from 'fs/promises';
import path from 'path';
import { argv } from 'process';

const source = argv[2];
let sources = await fs.readdir(source);

await Promise.all(
  sources
    .filter((file) => path.extname(file) === '.gpx')
    .map(async function convert(file) {
      const data = await fs.readFile(path.join(source, file), 'utf-8');
      const xml = new DOMParser().parseFromString(data);

      await fs.writeFile(
        path.join(source, path.basename(file, '.gpx') + '.json'),
        JSON.stringify(tj.gpx(xml), null, 2)
      );
    })
);
