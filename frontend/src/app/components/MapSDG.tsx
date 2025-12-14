"use client";

import { TileLayer, GeoJSON, Popup, useMap } from "react-leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

type Props = { goal: number };

// Tipe GeoJSON
interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: {
    NAMOBJ: string;
    WADMKC: string;
    [key: string]: any;
  };
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// 🎨 Warna cluster (hex colors untuk polygon fill)
const clusterColors: Record<number, string> = {
  0: "#3b82f6", // blue
  1: "#22c55e", // green
  2: "#f97316", // orange
  3: "#ef4444", // red
};

// 🎨 Warna border cluster
const clusterBorderColors: Record<number, string> = {
  0: "#1d4ed8", // darker blue
  1: "#15803d", // darker green
  2: "#c2410c", // darker orange
  3: "#b91c1c", // darker red
};

// 🧭 Komponen bantu — auto-fit ke bounds GeoJSON
function AutoFitGeoJSON({ geojson }: { geojson: GeoJSONCollection | null }) {
  const map = useMap();

  useEffect(() => {
    if (!geojson || !geojson.features.length) return;

    try {
      const geoLayer = L.geoJSON(geojson as any);
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch (e) {
      console.error("Error fitting bounds:", e);
    }
  }, [geojson, map]);

  return null;
}

// === LegendControl sebagai kontrol Leaflet dengan toggle hide/show ===
interface ClusterInfo {
  cluster: number;
  arti_cluster: string;
}

function LegendControl({ clusterInfo }: { clusterInfo: ClusterInfo[] }) {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const container = L.DomUtil.create("div", "info legend");
      container.style.background = "rgba(0,0,0,0.85)";
      container.style.color = "white";
      container.style.borderRadius = "12px";
      container.style.fontSize = "12px";
      container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
      container.style.maxWidth = "320px";
      container.style.lineHeight = "1.4";
      container.style.overflow = "hidden";

      // Header dengan toggle button
      const header = L.DomUtil.create("div", "legend-header", container);
      header.style.padding = "10px 14px";
      header.style.cursor = "pointer";
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.borderBottom = "1px solid rgba(255,255,255,0.2)";
      header.style.userSelect = "none";
      header.innerHTML = `
        <span style="font-size:14px;font-weight:bold;">📊 Legenda Cluster</span>
        <span class="legend-toggle" style="font-size:18px;transition:transform 0.3s;">▼</span>
      `;

      // Content container
      const content = L.DomUtil.create("div", "legend-content", container);
      content.style.padding = "8px 14px 14px";
      content.style.maxHeight = "300px";
      content.style.overflow = "auto";
      content.style.transition = "max-height 0.3s ease, padding 0.3s ease, opacity 0.3s ease";

      // Generate cluster info content
      if (clusterInfo.length > 0) {
        clusterInfo.forEach(({ cluster, arti_cluster }) => {
          const clr = clusterColors[cluster] || "#6b7280";
          const borderClr = clusterBorderColors[cluster] || "#374151";
          content.innerHTML += `
            <div style="display:flex;align-items:flex-start;gap:10px;margin-top:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
              <span style="display:inline-block;min-width:20px;width:20px;height:20px;background:${clr};border-radius:4px;border:2px solid ${borderClr};flex-shrink:0;margin-top:2px;"></span>
              <div>
                <span style="font-weight:600;color:${clr};">Cluster ${cluster}</span>
                <div style="font-size:11px;color:#d1d5db;margin-top:2px;">${arti_cluster || "Tidak ada deskripsi"}</div>
              </div>
            </div>`;
        });
      } else {
        Object.entries(clusterColors).forEach(([k, clr]) => {
          content.innerHTML += `
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
              <span style="display:inline-block;width:18px;height:18px;background:${clr};border-radius:4px;border:2px solid ${clusterBorderColors[Number(k)] || clr};"></span>
              <span>Cluster ${k}</span>
            </div>`;
        });
      }

      // Toggle functionality
      let isCollapsed = false;
      const toggleIcon = header.querySelector(".legend-toggle") as HTMLElement;

      L.DomEvent.on(header, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        isCollapsed = !isCollapsed;

        if (isCollapsed) {
          content.style.maxHeight = "0";
          content.style.padding = "0 14px";
          content.style.opacity = "0";
          toggleIcon.style.transform = "rotate(-90deg)";
          header.style.borderBottom = "none";
        } else {
          content.style.maxHeight = "300px";
          content.style.padding = "8px 14px 14px";
          content.style.opacity = "1";
          toggleIcon.style.transform = "rotate(0deg)";
          header.style.borderBottom = "1px solid rgba(255,255,255,0.2)";
        }
      });

      // Prevent map interactions when clicking on legend
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      return container;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map, clusterInfo]);

  return null;
}

// Fungsi normalisasi nama desa untuk matching
function normalizeDesaName(name: string): string {
  return name
    .toUpperCase()
    .trim()
    // Standarisasi variasi nama dulu (sebelum hapus spasi)
    .replace(/RINGIN\s*REJO/g, "RINGINREJO")
    .replace(/TUGU\s*REJO/g, "TUGUREJO")
    // Baru hapus semua spasi
    .replace(/\s+/g, "");
}

export default function MapSDG({ goal }: Props) {
  // 🔧 Solusi "Map container is already initialized"
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => setMapReady(true), []);

  const [data, setData] = useState<any[]>([]);
  const [geojson, setGeojson] = useState<GeoJSONCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0); // Untuk force re-render
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  // Fetch data SDG
  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log("[DEBUG] Fetching SDG data for goal:", goal);
    fetch(`/api/map/${goal}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        console.log("[DEBUG] SDG data received:", d.length, "items");
        console.log("[DEBUG] SDG data sample:", d[0]);
        setData(Array.isArray(d) ? d : []);
        setDataVersion(v => v + 1); // Increment untuk force re-render
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [goal]);

  // Fetch GeoJSON shapefile
  useEffect(() => {
    console.log("[DEBUG] Fetching GeoJSON...");
    fetch("/wates-villages.geojson")
      .then((r) => {
        if (!r.ok) throw new Error("GeoJSON not found");
        return r.json();
      })
      .then((gj) => {
        console.log("[DEBUG] GeoJSON received:", gj.features?.length, "features");
        console.log("[DEBUG] GeoJSON sample NAMOBJ:", gj.features?.[0]?.properties?.NAMOBJ);
        setGeojson(gj);
      })
      .catch((e) => console.error("Error loading GeoJSON:", e));
  }, []);

  // Gabungkan data SDG dengan GeoJSON
  const enrichedGeojson = useMemo(() => {
    if (!geojson || !data.length) return geojson;

    // Buat mapping nama_desa -> cluster data
    const clusterMap: Record<string, any> = {};
    data.forEach((d) => {
      const key = normalizeDesaName(d.nama_desa || "");
      clusterMap[key] = d;
    });

    // Debug: log mapping
    console.log("=== DEBUG MATCHING ===");
    console.log("Cluster Map Keys:", Object.keys(clusterMap));

    // Enriched features dengan data cluster
    const enrichedFeatures = geojson.features.map((feature) => {
      const desaName = normalizeDesaName(feature.properties.NAMOBJ || "");
      const clusterData = clusterMap[desaName];

      console.log(`GeoJSON: ${feature.properties.NAMOBJ} -> Normalized: ${desaName} -> Match: ${clusterData ? "YES" : "NO"}`);

      return {
        ...feature,
        properties: {
          ...feature.properties,
          cluster: clusterData?.cluster ?? null,
          arti_cluster: clusterData?.arti_cluster ?? "",
          indikator: clusterData?.indikator ?? [],
          nama_desa_original: clusterData?.nama_desa ?? feature.properties.NAMOBJ,
        },
      };
    });

    return {
      ...geojson,
      features: enrichedFeatures,
    };
  }, [geojson, data]);

  // Ekstrak info cluster unik untuk legenda dinamis
  const clusterInfo = useMemo(() => {
    const clusterMap = new Map<number, string>();
    data.forEach((d) => {
      if (d.cluster !== null && d.cluster !== undefined && d.arti_cluster) {
        clusterMap.set(d.cluster, d.arti_cluster);
      }
    });
    // Konversi ke array dan sort berdasarkan cluster number
    return Array.from(clusterMap.entries())
      .map(([cluster, arti_cluster]) => ({ cluster, arti_cluster }))
      .sort((a, b) => a.cluster - b.cluster);
  }, [data]);

  // Style untuk setiap feature
  const getFeatureStyle = (feature: any) => {
    const cluster = feature?.properties?.cluster;
    const hasCluster = cluster !== null && cluster !== undefined;

    return {
      fillColor: hasCluster ? (clusterColors[cluster] || "#6b7280") : "#6b7280",
      fillOpacity: hasCluster ? 0.9 : 0.7, // Tinggi agar menutupi label di bawahnya
      color: hasCluster ? (clusterBorderColors[cluster] || "#374151") : "#374151",
      weight: 2,
      opacity: 1,
    };
  };

  // Handler untuk setiap feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    const cluster = props.cluster;
    const hasCluster = cluster !== null && cluster !== undefined;
    const fillColor = hasCluster ? (clusterColors[cluster] || "#6b7280") : "#6b7280";

    const popupContent = `
      <div style="font-size: 12px; min-width: 220px;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px;">
          📍 ${props.nama_desa_original || props.NAMOBJ}
        </div>
        ${hasCluster ? `
          <div style="background: ${fillColor}; color: white; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 8px;">
            <b>Cluster ${cluster}</b> ${props.arti_cluster ? `- ${props.arti_cluster}` : ""}
          </div>
        ` : `
          <div style="background: #6b7280; color: white; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 8px;">
            Data tidak tersedia
          </div>
        `}
        <hr style="margin: 8px 0; border-color: #ddd;" />
        ${props.indikator && props.indikator.length > 0 ? `
          <div style="margin-top: 4px; font-size: 11px;">
            <b>📋 Indikator:</b>
            ${props.indikator.map((item: string) => `<div style="margin-top: 2px;">${item}</div>`).join("")}
          </div>
        ` : ""}
      </div>
    `;

    layer.bindPopup(popupContent);

    // Tambahkan label nama desa permanent di tengah polygon
    const desaName = props.nama_desa_original || props.NAMOBJ;
    if (desaName && (layer as any).bindTooltip) {
      (layer as any).bindTooltip(desaName, {
        permanent: true,
        direction: "center",
        className: "village-label",
        opacity: 1,
      });
    }

    // Hover effect
    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          weight: 4,
          fillOpacity: 0.8,
        });
        l.bringToFront();
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getFeatureStyle(feature));
      },
    });
  };

  const center: [number, number] = [-8.27, 112.35]; // Center of Wates area

  return (
    <div style={{ position: "relative" }}>
      {!mapReady && (
        <div className="mb-2 text-sm text-neutral-400">
          Memuat komponen peta...
        </div>
      )}
      {loading && (
        <div className="mb-2 text-sm text-neutral-400">
          Memuat peta SDGs {goal}…
        </div>
      )}
      {error && (
        <div className="mb-2 text-sm text-red-400">
          Gagal memuat data: {error}
        </div>
      )}
      {mapReady && (
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: 550, width: "100%", borderRadius: 12 }}
        >
          {/* OpenStreetMap dengan label - label di area polygon akan tertutup oleh polygon opacity tinggi */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Render GeoJSON dari Shapefile - hanya render jika kedua data tersedia */}
          {enrichedGeojson && data.length > 0 && (
            <GeoJSON
              key={`geojson-${goal}-v${dataVersion}`}
              data={enrichedGeojson as any}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
              ref={geoJsonRef}
            />
          )}

          {/* Auto-fit ke bounds GeoJSON */}
          <AutoFitGeoJSON geojson={enrichedGeojson} />

          {/* Legend dinamis dengan arti cluster */}
          <LegendControl clusterInfo={clusterInfo} />
        </MapContainer>
      )}

      {/* Hint Interaksi / Panduan */}
      <div className="mt-6 bg-neutral-900 rounded-2xl border border-neutral-700 p-4 sm:p-8 space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-green-300">
          Panduan Interaksi Peta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-neutral-300 text-xs sm:text-sm">
          <div>
            <h3 className="font-semibold mb-2">Langkah-langkah:</h3>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Pilih SDG yang ingin dilihat</li>
              <li>Perhatikan legenda untuk arti warna cluster</li>
              <li>Klik area desa untuk detail</li>
              <li>Lihat indikator spesifik pada popup</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Gunakan zoom untuk melihat lebih jelas</li>
              <li>Klik area desa untuk melihat indikator spesifik</li>
              <li>Warna cluster menunjukkan status desa</li>
              <li>Klik header legenda untuk hide/show</li>
              <li>Data diperbarui secara berkala</li>
            </ul>
          </div>
        </div>

        {/* Informasi Sumber Data */}
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <p className="text-xs text-neutral-400 flex items-start gap-2">
            <span className="text-blue-400">ℹ️</span>
            <span>
              Informasi batas wilayah desa diambil secara resmi dari <strong className="text-neutral-300">Data Geospasial Indonesia</strong> yang
              disediakan oleh <strong className="text-neutral-300">Badan Informasi Geospasial (BIG)</strong> Republik Indonesia.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
