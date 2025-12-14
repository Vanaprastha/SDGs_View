"use client";

import { TileLayer, Popup, useMap, CircleMarker } from "react-leaflet";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

interface FeedbackData {
  sdg_goal: number;
  location_lat: number;
  location_lon: number;
  nama_desa: string;
  problem_title: string;
  [key: string]: any;
}

interface ClusteredData {
  sdg_goal: number;
  latitude: number;
  longitude: number;
  count: number;
  titles: string[]; // hanya judul masalah
  nama_desa: string;
}

interface Props {
  goal?: number;
}

// 🎨 Warna untuk setiap SDG goal
const sdgColors: Record<number, string> = {
  1: "#e74c3c",
  2: "#f39c12",
  3: "#27ae60",
  4: "#3498db",
  5: "#e91e63",
  6: "#00bcd4",
  7: "#ffc107",
  8: "#9c27b0",
  9: "#673ab7",
  10: "#2196f3",
  11: "#4caf50",
  12: "#ff5722",
  13: "#009688",
  14: "#03a9f4",
  15: "#8bc34a",
  16: "#795548",
  17: "#607d8b",
};

const sdgLabels: Record<number, string> = {
  1: "SDG 1: Tanpa Kemiskinan",
  2: "SDG 2: Tanpa Kelaparan",
  3: "SDG 3: Kehidupan Sehat",
  4: "SDG 4: Pendidikan Berkualitas",
  5: "SDG 5: Kesetaraan Gender",
  6: "SDG 6: Air Bersih",
  7: "SDG 7: Energi Bersih",
  8: "SDG 8: Pekerjaan Layak",
  9: "SDG 9: Industri & Inovasi",
  10: "SDG 10: Berkurangnya Kesenjangan",
  11: "SDG 11: Kota Berkelanjutan",
  12: "SDG 12: Konsumsi Bertanggung Jawab",
  13: "SDG 13: Penanganan Iklim",
  14: "SDG 14: Ekosistem Lautan",
  15: "SDG 15: Ekosistem Daratan",
  16: "SDG 16: Perdamaian & Keadilan",
  17: "SDG 17: Kemitraan",
};

// 🧭 Komponen bantu untuk auto-fit semua titik laporan
function AutoFitBounds({ data }: { data: ClusteredData[] }) {
  const map = useMap();

  useEffect(() => {
    if (data.length === 0) return;

    const bounds = L.latLngBounds(
      data.map((d) => [d.latitude, d.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [data, map]);

  return null;
}

// 🧾 Legend (keterangan warna dan ukuran)
function LegendControl({ goal }: { goal?: number }) {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background = "rgba(0,0,0,0.7)";
      div.style.color = "white";
      div.style.padding = "10px 15px";
      div.style.borderRadius = "8px";
      div.style.fontSize = "12px";
      div.style.maxWidth = "220px";

      if (goal) {
        div.innerHTML = `<b>${sdgLabels[goal] || `SDG ${goal}`}</b><br/>`;
        div.innerHTML += `<span style="font-size: 11px; color: #ccc;">Clustering Laporan Masalah</span><br/>`;
        div.innerHTML += `<span style="font-size: 11px; color: #ccc;">Ukuran marker = jumlah laporan</span>`;
      } else {
        div.innerHTML = "<b>Semua Laporan SDGs</b><br/>";
        div.innerHTML += `<span style="font-size: 11px; color: #ccc;">Warna = SDG Goal</span><br/>`;
        div.innerHTML += `<span style="font-size: 11px; color: #ccc;">Ukuran = jumlah laporan</span>`;
      }

      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map, goal]);

  return null;
}

// 🗺️ Komponen utama peta
export default function FeedbackMap({ goal }: Props) {
  const [mapReady, setMapReady] = useState(false);
  const [data, setData] = useState<ClusteredData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMapReady(true);
  }, []);

  // 🚀 Fetch feedback data dan cluster berdasarkan lokasi
  useEffect(() => {
    setLoading(true);
    setError(null);

    const url = goal ? `/api/feedback?goal=${goal}` : "/api/feedback";

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((feedbacks: FeedbackData[]) => {
        const clustered: Record<string, ClusteredData> = {};

        feedbacks.forEach((feedback) => {
          if (feedback.location_lat && feedback.location_lon) {
            const lat = Math.round(feedback.location_lat * 10000) / 10000;
            const lon = Math.round(feedback.location_lon * 10000) / 10000;
            const key = `${lat}-${lon}-${feedback.sdg_goal}`;

            if (!clustered[key]) {
              clustered[key] = {
                sdg_goal: feedback.sdg_goal,
                latitude: lat,
                longitude: lon,
                count: 0,
                titles: [],
                nama_desa: feedback.nama_desa || "-",
              };
            }

            clustered[key].count++;
            clustered[key].titles.push(
              feedback.problem_title || "Tidak ada judul masalah"
            );
          }
        });

        setData(Object.values(clustered));
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [goal]);

  return (
    <div style={{ position: "relative" }}>
      {!mapReady && (
        <div className="mb-2 text-sm text-neutral-400">
          Memuat komponen peta...
        </div>
      )}
      {loading && (
        <div className="mb-2 text-sm text-neutral-400">
          Memuat peta laporan masalah…
        </div>
      )}
      {error && (
        <div className="mb-2 text-sm text-red-400">
          Gagal memuat data: {error}
        </div>
      )}
      {mapReady && (
        <MapContainer
          center={[-7.802, 112.02]} // titik awal sementara
          zoom={13}
          style={{ height: 420, width: "100%", borderRadius: 12 }}
        >
          {/* 🌍 Tile dasar peta */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 🔵 Marker tiap cluster laporan */}
          {data.map((cluster, idx) => {
            const lat = Number(cluster.latitude);
            const lon = Number(cluster.longitude);
            if (!isFinite(lat) || !isFinite(lon)) return null;

            const radius = Math.max(5, Math.min(30, cluster.count * 3));
            const color = sdgColors[cluster.sdg_goal] || "#999";

            return (
              <CircleMarker
                key={idx}
                center={[lat, lon]}
                radius={radius}
                fillColor={color}
                color={color}
                weight={2}
                opacity={0.8}
                fillOpacity={0.6}
              >
                <Popup>
                  <div style={{ fontSize: 12, minWidth: 250 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>
                      {sdgLabels[cluster.sdg_goal] ||
                        `SDG ${cluster.sdg_goal}`}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Jumlah Laporan:</b> {cluster.count}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Nama Desa:</b> {cluster.nama_desa}
                    </div>
                    <hr style={{ margin: "8px 0" }} />
                    <div
                      style={{
                        fontSize: 11,
                        maxHeight: 150,
                        overflowY: "auto",
                      }}
                    >
                      <b>Judul Masalah:</b>
                      <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                        {cluster.titles.map((title, i) => (
                          <li key={i}>{title}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* 🔥 Auto-fit semua titik laporan */}
          <AutoFitBounds data={data} />

          {/* 📘 Keterangan */}
          <LegendControl goal={goal} />
        </MapContainer>
      )}
    </div>
  );
}

