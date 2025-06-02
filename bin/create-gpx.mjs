import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = JSON.parse(readFileSync(join(__dirname, '../data/speedman-divisies.json'), 'utf8')).features.filter(f => f.geometry.type == 'LineString');

const fietsenData = data.filter(f => f.properties.name.toLowerCase().includes('fiets') && !f.properties.name.toLowerCase().includes('terugkom'));
const lopenData = data.filter(f => f.properties.name.toLowerCase().includes('loopparcours'));

const sortSegments = (segments) => {
    return segments.sort((a, b) => {
        const nameA = a.properties.name.toLowerCase();
        const nameB = b.properties.name.toLowerCase();
        
        // Aanloop comes first
        if (nameA.includes('aanloop') && !nameB.includes('aanloop')) return -1;
        if (!nameA.includes('aanloop') && nameB.includes('aanloop')) return 1;
        
        // Keep original order for other segments
        return 0;
    });
};

const createFeatureCollection = (features) => ({
    type: "FeatureCollection",
    features
});

const combineLineStrings = (features) => {
    const coordinates = features.flatMap(f => f.geometry.coordinates);
    return {
        type: "Feature",
        properties: {
            name: "Combined Route",
            ...features[0].properties
        },
        geometry: {
            type: "LineString",
            coordinates
        }
    };
};

const sortedFietsen = sortSegments(fietsenData);
const sortedLopen = sortSegments(lopenData);

writeFileSync(join(__dirname, '../data/speedman-parcours-fietsen.json'), JSON.stringify(createFeatureCollection([combineLineStrings(sortedFietsen)]), null, 2));
writeFileSync(join(__dirname, '../data/speedman-parcours-lopen.json'), JSON.stringify(createFeatureCollection([combineLineStrings(sortedLopen)]), null, 2));