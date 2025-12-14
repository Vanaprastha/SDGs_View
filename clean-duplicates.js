const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./frontend/public/wates-villages.geojson', 'utf8'));

// Hapus duplikat berdasarkan nama desa
const uniqueFeatures = [];
const seenNames = new Set();

data.features.forEach(f => {
    const name = f.properties.NAMOBJ;
    if (!seenNames.has(name)) {
        seenNames.add(name);
        uniqueFeatures.push(f);
    }
});

const cleanData = {
    type: 'FeatureCollection',
    features: uniqueFeatures
};

fs.writeFileSync('./frontend/public/wates-villages.geojson', JSON.stringify(cleanData, null, 2));
console.log('Cleaned! Before:', data.features.length, '-> After:', uniqueFeatures.length);
console.log('\nDesa unik:');
uniqueFeatures.forEach((f, i) => console.log(i + 1, '-', f.properties.NAMOBJ));
