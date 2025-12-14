const fs = require('fs');
const shapefile = require("./frontend/node_modules/shapefile");
const turf = require("./frontend/node_modules/@turf/turf");
const path = require("path");

async function mergeAndClean() {
    const shpPath = path.join(__dirname, "Data Shapefile/ADMINISTRASIDESA_AR_25K.shp");
    const dbfPath = path.join(__dirname, "Data Shapefile/ADMINISTRASIDESA_AR_25K.dbf");

    console.log("Reading shapefile...");

    const features = [];
    const source = await shapefile.open(shpPath, dbfPath, { encoding: "utf-8" });

    while (true) {
        const result = await source.read();
        if (result.done) break;
        features.push(result.value);
    }

    // Filter hanya Kecamatan Wates
    const watesFeatures = features.filter(f => f.properties.WADMKC === 'WATES');
    console.log('Desa di Kecamatan WATES:', watesFeatures.length);

    // Fungsi untuk menghapus lubang dari polygon
    function removeHoles(geometry) {
        if (geometry.type === 'Polygon') {
            // Polygon: ambil hanya ring pertama (outer boundary)
            return {
                type: 'Polygon',
                coordinates: [geometry.coordinates[0]]
            };
        } else if (geometry.type === 'MultiPolygon') {
            // MultiPolygon: untuk setiap polygon, ambil hanya ring pertama
            return {
                type: 'MultiPolygon',
                coordinates: geometry.coordinates.map(poly => [poly[0]])
            };
        }
        return geometry;
    }

    // Group by nama desa
    const groupedByName = {};
    watesFeatures.forEach(f => {
        const name = f.properties.NAMOBJ;
        if (!groupedByName[name]) {
            groupedByName[name] = [];
        }
        groupedByName[name].push(f);
    });

    console.log('\nProcessing features...');

    // Merge features dengan nama yang sama
    const mergedFeatures = [];

    Object.entries(groupedByName).forEach(([name, featureList]) => {
        // Hapus lubang dari setiap polygon dulu
        const cleanedFeatures = featureList.map(f => ({
            ...f,
            geometry: removeHoles(f.geometry)
        }));

        if (cleanedFeatures.length === 1) {
            mergedFeatures.push(cleanedFeatures[0]);
        } else {
            // Multiple features, lakukan union
            console.log(`  -> Union for ${name}...`);

            try {
                let unionResult = cleanedFeatures[0];

                for (let i = 1; i < cleanedFeatures.length; i++) {
                    unionResult = turf.union(
                        turf.featureCollection([unionResult, cleanedFeatures[i]])
                    );
                }

                // Hapus lubang lagi setelah union (jika ada)
                unionResult.geometry = removeHoles(unionResult.geometry);
                unionResult.properties = featureList[0].properties;

                console.log(`     -> Success: ${unionResult.geometry.type}`);
                mergedFeatures.push(unionResult);
            } catch (err) {
                console.error(`     -> Failed:`, err.message);
                // Fallback: gabungkan sebagai MultiPolygon tanpa lubang
                const allCoordinates = cleanedFeatures.map(f => {
                    if (f.geometry.type === 'Polygon') {
                        return [f.geometry.coordinates[0]];
                    }
                    return f.geometry.coordinates.map(poly => [poly[0]]);
                }).flat();

                mergedFeatures.push({
                    type: 'Feature',
                    properties: featureList[0].properties,
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: allCoordinates
                    }
                });
            }
        }
    });

    const geojson = {
        type: 'FeatureCollection',
        features: mergedFeatures
    };

    fs.writeFileSync('./frontend/public/wates-villages.geojson', JSON.stringify(geojson, null, 2));
    console.log('\nSaved! Verifying...');

    // Verify
    mergedFeatures.forEach((f, i) => {
        const g = f.geometry;
        const rings = g.type === 'Polygon' ? g.coordinates.length :
            g.coordinates.reduce((sum, p) => sum + p.length, 0);
        console.log(`${i + 1}. ${f.properties.NAMOBJ}: ${g.type}, ${rings} ring(s)`);
    });
}

mergeAndClean().catch(console.error);
