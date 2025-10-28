"use client";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
  useMap,
  ZoomControl,
  Marker,
} from "react-leaflet";
import { LatLngExpression, latLngBounds, divIcon } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

interface PredictionFeature {
  type: string;
  properties: {
    year?: number;
    label?: string;
    erosion?: number;
    confidence?: number;
    avg_distance_m?: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number][]; // [lng, lat]
  };
}

interface PredictionMapProps {
  predictions: PredictionFeature[];
}

// Fixed color by year range
function getColorByYearRange(year: number): string {
  if (year >= 2035 && year <= 2050) return "#FCD34D"; // Yellow
  if (year >= 2051 && year <= 2075) return "#EF4444"; // Red
  if (year >= 2076 && year <= 2100) return "#2BFB41"; // Bright Green
  return "#9CA3AF"; // Gray fallback
}

// Component to fit bounds
function FitBounds({ coordinates }: { coordinates: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
      map.setMaxZoom(20);
    }
  }, [coordinates, map]);
  return null;
}

export default function PredictionMap({ predictions }: PredictionMapProps) {
  const [yearRange, setYearRange] = useState<[number, number]>([2035, 2100]);

  // Compute all coordinates
  const allCoords: LatLngExpression[] = useMemo(
    () =>
      predictions.flatMap(
        (f) =>
          f.geometry?.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          ) || []
      ),
    [predictions]
  );

  const years = predictions
    .map((f) => f.properties.year)
    .filter((y): y is number => !!y && y >= 2035 && y <= 2100);

  const minYear = Math.min(...(years.length > 0 ? years : [2035]), 2035);
  const maxYear = Math.max(...(years.length > 0 ? years : [2100]), 2100);

  const filteredPredictions = predictions.filter(
    (f) =>
      f.properties.year &&
      f.properties.year >= yearRange[0] &&
      f.properties.year <= yearRange[1]
  );

  return (
    <div className="relative h-[600px] w-full">
      {/* Map */}
      <MapContainer
        center={[-38.1, 145.12]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full rounded-2xl shadow-lg"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Zoom Control at Top-Right */}
        <ZoomControl position="topright" />

        {filteredPredictions.map((feature, index) => {
          const coords = feature.geometry?.coordinates.map(
            ([lng, lat]) => [lng, lat] as [number, number]
          ) || [];
          const latLngs = coords.map(([lng, lat]) => [lat, lng] as [number, number]);
          const year = feature.properties.year ?? 0;
          const color = getColorByYearRange(year);

          // Compute center point for year label
          const centerLat = latLngs[Math.floor(latLngs.length / 2)][0];
          const centerLng = latLngs[Math.floor(latLngs.length / 2)][1];

          // Create custom icon for year tag
          const yearIcon = divIcon({
            html: `<div style="
              background: ${color};
              color: ${year >= 2076 ? '#000' : '#fff'};
              font-weight: bold;
              font-size: 12px;
              padding: 4px 8px;
              border-radius: 12px;
              white-space: nowrap;
              box-shadow: 0 1px 3px rgba(0,0,0,0.4);
              border: 2px solid #fff;
            ">${year}</div>`,
            className: "custom-year-tag",
            iconSize: [40, 24],
            iconAnchor: [20, 12],
          });

          return (
            <div key={index}>
              {/* Route Line */}
              <Polyline
                positions={latLngs}
                color={color}
                weight={4}
                opacity={0.95}
              >
                <Popup>
                  <div className="text-sm">
                    {feature.properties.year && (
                      <p>
                        <strong>Year:</strong> {feature.properties.year}
                      </p>
                    )}
                    {feature.properties.avg_distance_m && (
                      <p>
                        <strong>Avg Distance:</strong>{" "}
                        {feature.properties.avg_distance_m.toFixed(2)} m
                      </p>
                    )}
                    {feature.properties.erosion && (
                      <p>
                        <strong>Erosion:</strong>{" "}
                        {feature.properties.erosion.toFixed(2)}
                      </p>
                    )}
                    {feature.properties.confidence && (
                      <p>
                        <strong>Confidence:</strong>{" "}
                        {feature.properties.confidence.toFixed(1)}%
                      </p>
                    )}
                    {feature.properties.label && (
                      <p>
                        <strong>Label:</strong> {feature.properties.label}
                      </p>
                    )}
                  </div>
                </Popup>
              </Polyline>

              {/* Year Tag on Route */}
              <Marker position={[centerLat, centerLng]} icon={yearIcon} />
            </div>
          );
        })}

        <FitBounds coordinates={allCoords} />
      </MapContainer>

      {/* Floating Year Filter Panel */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-md z-[1000] w-[260px]">
        <h3 className="font-semibold text-gray-800 mb-3">
          Filter by Year Range
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-gray-600">
              From: <strong>{yearRange[0]}</strong> → To:{" "}
              <strong>{yearRange[1]}</strong>
            </label>
            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={yearRange[1]}
              onChange={(e) =>
                setYearRange([yearRange[0], Number(e.target.value)])
              }
              className="w-full h-2 bg-gradient-to-r from-yellow-300 via-red-500 to-green-400 rounded-lg appearance-none cursor-pointer mt-1"
              style={{
                background: `linear-gradient(to right, 
                  #FCD34D 0%, 
                  #FCD34D ${(2050 - 2035) / (2100 - 2035) * 100}%, 
                  #EF4444 ${(2050 - 2035) / (2100 - 2035) * 100}%, 
                  #EF4444 ${(2075 - 2035) / (2100 - 2035) * 100}%, 
                  #2BFB41 ${(2075 - 2035) / (2100 - 2035) * 100}%, 
                  #2BFB41 100%)`,
              }}
            />
          </div>
          <button
            onClick={() => setYearRange([minYear, maxYear])}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-3 py-1.5 transition"
          >
            Reset to Full Range
          </button>
        </div>

        {/* Discrete Color Legend */}
        <div className="mt-5 border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Year Range Colors
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: "#FCD34D" }}
              ></div>
              <span className="text-gray-700">2035 – 2050</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: "#EF4444" }}
              ></div>
              <span className="text-gray-700">2051 – 2075</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: "#2BFB41" }}
              ></div>
              <span className="text-gray-700">2076 – 2100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}