import { divIcon } from "leaflet";

/**
 * Create a DivIcon for the current user location.
 * Green circle with white border, pulsing animation (CSS).
 */
export function createCurrentLocationIcon() {
  const html = `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
      animation: pulse-location 2s infinite;
    "></div>
  `;

  return divIcon({
    html,
    className: "custom-current-location",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}
