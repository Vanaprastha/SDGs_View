const shapefile = require("./frontend/node_modules/shapefile");
const fs = require("fs");
const path = require("path");

async function convertShapefileToGeoJSON() {
    const shpPath = path.join(__dirname, "Data Shapefile/ADMINISTRASIDESA_AR_25K.shp");
    const dbfPath = path.join(__dirname, "Data Shapefile/ADMINISTRASIDESA_AR_25K.dbf");
    const outputPath = path.join(__dirname, "frontend/public/desa-boundaries.geojson");

    console.log("Reading shapefile:", shpPath);

    const features = [];

    const source = await shapefile.open(shpPath, dbfPath, { encoding: "utf-8" });

    while (true) {
        const result = await source.read();
        if (result.done) break;
        features.push(result.value);
    }

    const geojson = {
        type: "FeatureCollection",
        features: features
    };

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
    console.log(`GeoJSON saved to: ${outputPath}`);
    console.log(`Total features: ${features.length}`);

    // Print sample feature properties
    if (features.length > 0) {
        console.log("\nSample feature properties:");
        console.log(JSON.stringify(features[0].properties, null, 2));
    }
}

convertShapefileToGeoJSON().catch(console.error);
