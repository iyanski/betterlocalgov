import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import barangaysGeoJson from '../../data/aparri-barangays.json';

interface BarangayFeatureProperties {
  name: string;
  slug: string;
  psgcCode: string;
  areaSqKm: number;
}

// Approximate centroid of Aparri's mainland barangays (Fuga Island sits
// well offshore and is excluded from the initial view).
const APARRI_CENTER: [number, number] = [18.36, 121.64];
const DEFAULT_ZOOM = 12;

/**
 * Clickable barangay locator map for Aparri.
 *
 * Boundaries come from a national PSA/NAMRIA-sourced dataset
 * (bendlikeabamboo/barangay-boundaries-repository, MIT-licensed code,
 * data credited to PSA & NAMRIA — the same lineage bettergov.ph's Open
 * Data Portal uses) that has been simplified for a countrywide file.
 * Shapes here are approximate, not survey-accurate — good for "which
 * barangay is this," not for anything that needs precise boundaries.
 * See docs/plan/10-barangay-finder-map.
 */
export default function BarangayMap() {
  const navigate = useNavigate();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const featureStyle = (
    feature?: GeoJSON.Feature<GeoJSON.Geometry, BarangayFeatureProperties>
  ): PathOptions => {
    const isHovered = feature?.properties.slug === hoveredSlug;
    return {
      color: '#0066eb',
      weight: isHovered ? 2.5 : 1,
      fillColor: isHovered ? '#60a5fa' : '#93c5fd',
      fillOpacity: isHovered ? 0.6 : 0.35,
    };
  };

  const onEachFeature = (
    feature: GeoJSON.Feature<GeoJSON.Geometry, BarangayFeatureProperties>,
    layer: Layer
  ) => {
    const { name, slug } = feature.properties;
    layer.bindTooltip(name, { sticky: true, direction: 'top' });
    layer.on({
      mouseover: () => setHoveredSlug(slug),
      mouseout: () => setHoveredSlug(null),
      click: () => navigate(`/government/barangays/${slug}`),
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <MapContainer
        center={APARRI_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        style={{ height: '480px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={barangaysGeoJson as GeoJSON.GeoJsonObject}
          style={featureStyle as (feature?: GeoJSON.Feature) => PathOptions}
          onEachFeature={
            onEachFeature as (feature: GeoJSON.Feature, layer: Layer) => void
          }
        />
      </MapContainer>
      <p className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        Boundaries are approximate (simplified from a national dataset for Fuga
        Island and the mainland barangays) — for reference only, not
        survey-accurate. Click a barangay to view its profile.
      </p>
    </div>
  );
}
