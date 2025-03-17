// const tj = require('@tmcw/togeojson'); // alternative
import { DOMParser } from 'xmldom';
import tj from '@mapbox/togeojson';
import fs from 'fs/promises';
import path from 'path';
import { argv } from 'process';

const source = argv[2];
let sources = await fs.readdir(source);

await Promise.all(
  sources
    .filter((file) => path.extname(file) === '.kml')
    .map(async function convert(file) {
      const data = await fs.readFile(path.join(source, file), 'utf-8');
      const xml = new DOMParser().parseFromString(data);

      console.log('Converting ' + file + ' to GeoJSON');

      try {
        await fs.writeFile(
          path.join(source, path.basename(file, '.kml') + '.json'),
          JSON.stringify(tj.kml(xml), null, 2)
        );
      } catch (err) {
        console.log(err);
      }
    })
);
