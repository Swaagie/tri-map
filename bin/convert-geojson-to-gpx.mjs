import { DOMImplementation } from 'xmldom';
import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
import fs from 'fs/promises';
import path from 'path';
import { argv } from 'process';

const source = argv[2];
let sources = await fs.readdir(source);

await Promise.all(
  sources
    .filter((file) => path.extname(file) === '.json')
    .map(async function convert(file) {
      const data = await fs.readFile(path.join(source, file), 'utf-8');
      const geojson = JSON.parse(data);
      const implementation = new DOMImplementation();
      const gpx = GeoJsonToGpx(
        geojson,
        {
          creator: 'GVAV Speedman',
          version: new Date().toUTCString(),
        },
        implementation
      );

      console.log('Converting ' + file + ' to GPX');

      await fs.writeFile(
        path.join(source, path.basename(file, '.json') + '.gpx'),
        gpx.toString()
      );
    })
);
