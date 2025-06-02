import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const data = JSON.parse(readFileSync(join(__dirname, '../data/speedman-divisies.json'), 'utf8')).features.filter(f => f.geometry.type == 'LineString');

const fietsenData = data.filter(f => f.properties.name.toLowerCase().includes('fiets'));
const lopenData = data.filter(f => f.properties.name.toLowerCase().includes('lopen') || f.properties.name.toLowerCase().includes('loopparcours'));

const sortSegments = (segments) => {
    return segments.sort((a, b) => {
        const nameA = a.properties.name.toLowerCase();
        const nameB = b.properties.name.toLowerCase();
        
        // Aanloop comes first
        if (nameA.includes('aanloop') && !nameB.includes('aanloop')) return -1;
        if (!nameA.includes('aanloop') && nameB.includes('aanloop')) return 1;
        
        // Terugkom/finish comes last
        if ((nameA.includes('terugkom') || nameA.includes('finish')) && 
            !(nameB.includes('terugkom') || nameB.includes('finish'))) return 1;
        if (!(nameA.includes('terugkom') || nameA.includes('finish')) && 
            (nameB.includes('terugkom') || nameB.includes('finish'))) return -1;
        
        // Keep original order for other segments
        return 0;
    });
};

const createFeatureCollection = (features) => ({
    type: "FeatureCollection",
    features
});

writeFileSync(join(__dirname, '../data/speedman-parcours-fietsen.json'), JSON.stringify(createFeatureCollection(sortSegments(fietsenData)), null, 2));
writeFileSync(join(__dirname, '../data/speedman-parcours-lopen.json'), JSON.stringify(createFeatureCollection(sortSegments(lopenData)), null, 2));