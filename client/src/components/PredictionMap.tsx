"use client";

import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import { LatLngExpression, latLngBounds } from "leaflet";
import { useEffect } from "react";

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

// Component to auto-fit bounds
function FitBounds({ coordinates }: { coordinates: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] }); // fit bounds first
      map.setMaxZoom(20); // set the max zoom you want
    }
  }, [coordinates, map]);
  return null;
}

export default function PredictionMap({ predictions }: PredictionMapProps) {
  // Flatten all coordinates from all polylines
  const allCoords: LatLngExpression[] = predictions.flatMap((feature) =>
    (feature.geometry?.coordinates.map(([lng, lat]: [number, number]) =>
      [lat, lng] as [number, number]
    ) || [])
  );

  return (
    <div className="h-[600px] w-full relative">
      <MapContainer
        center={[-38.1, 145.12]} // temporary fallback
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {predictions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[9999]">
            <p className="text-gray-700 font-medium">No prediction data available.</p>
          </div>
        )}

        {predictions.map((feature, index) => {
          if (!feature.geometry?.coordinates) return null;

          const coordinates: LatLngExpression[] = feature.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

          return (
            <Polyline
              key={index}
              positions={coordinates}
              color={index % 2 === 0 ? "blue" : "green"}
              weight={3}
            >
              <Popup>
                <div>
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
          );
        })}

        {/* Auto-fit bounds for all coordinates */}
        <FitBounds coordinates={allCoords} />
      </MapContainer>
    </div>
  );
}
