"use client";

import { divIcon } from "leaflet";

/**
 * Create a custom DivIcon for a check-in marker.
 * Shows a small avatar/flag-style pin point.
 */
export function createCheckInMarkerIcon(
  imagePath?: string,
  isFocused: boolean = false
) {
  const borderColor = isFocused ? "#10B981" : "#ffffff";
  const size = isFocused ? 40 : 32;

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid ${borderColor};
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      overflow: hidden;
      background: ${
        imagePath ? "transparent" : "#10B981"
      };
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      ${
        imagePath
          ? `<img src="${imagePath}" style="width:100%;height:100%;object-fit:cover;" />`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 2L12 22M12 2L5 9M12 2L19 9"/></svg>`
      }
    </div>
  `;

  return divIcon({
    html,
    className: "custom-marker",
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
}

/**
 * Create a cluster icon showing a count.
 */
export function createClusterIcon(count: number) {
  const size = count > 10 ? 48 : count > 5 ? 40 : 32;

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: ${count > 10 ? 16 : 14}px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">
      ${count}
    </div>
  `;

  return divIcon({
    html,
    className: "custom-cluster",
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
}

/**
 * Create a marker icon for issue clusters with color based on count.
 * Green (1-2), Yellow (3-5), Red (6+)
 */
export function createIssueMarkerIcon(count: number) {
  const color = count >= 6 ? "#EF4444" : count >= 3 ? "#F59E0B" : "#10B981";
  const size = count >= 6 ? 44 : count >= 3 ? 38 : 32;

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 20px ${color}40;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: ${count >= 6 ? 16 : 14}px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    ">
      ${count}
    </div>
  `;

  return divIcon({
    html,
    className: "custom-issue-marker",
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
}

/**
 * Focused marker: green circle with white flag icon.
 */
export function createFocusedMarkerIcon() {
  const html = `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #10B981;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
        <path d="M12 2L12 22M12 2L5 9M12 2L19 9"/>
      </svg>
    </div>
  `;

  return divIcon({
    html,
    className: "custom-focused-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

/**
 * Search result marker: blue circle.
 */
export function createSearchResultMarkerIcon() {
  const html = `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2563EB;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21L17 17"/>
      </svg>
    </div>
  `;

  return divIcon({
    html,
    className: "custom-search-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

/**
 * Activity marker: white circle with colored icon.
 */
export function createActivityMarkerIcon(color: string) {
  const html = `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: white;
      border: 3px solid ${color};
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 18px; height: 18px; border-radius: 50%; background: ${color};"></div>
    </div>
  `;

  return divIcon({
    html,
    className: "custom-activity-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}
