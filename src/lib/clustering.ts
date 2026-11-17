import { FeedPost } from "./types";
import { distanceMeters } from "./distance";

/**
 * Group feed posts into clusters based on zoom level.
 * Ported from Flutter's _feedCheckInMarkerGroups() logic.
 *
 * Radius cluster = 90 * 2^(16 - zoom) meters
 * If zoom < 17, markers within the radius are grouped.
 */
export function clusterFeedPosts(
  posts: FeedPost[],
  zoom: number
): (FeedPost | FeedPost[])[] {
  if (zoom >= 17 || posts.length === 0) {
    return posts.map((p) => p);
  }

  const radius = 90 * Math.pow(2, 16 - zoom);
  const groups: (FeedPost | FeedPost[])[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < posts.length; i++) {
    if (assigned.has(posts[i].id)) continue;

    const p1 = posts[i];
    if (
      !p1.locationLatitude ||
      !p1.locationLongitude
    ) {
      groups.push(p1);
      assigned.add(p1.id);
      continue;
    }

    const cluster: FeedPost[] = [p1];
    assigned.add(p1.id);

    for (let j = i + 1; j < posts.length; j++) {
      if (assigned.has(posts[j].id)) continue;

      const p2 = posts[j];
      if (
        !p2.locationLatitude ||
        !p2.locationLongitude
      )
        continue;

      const dist = distanceMeters(
        [p1.locationLatitude, p1.locationLongitude],
        [p2.locationLatitude, p2.locationLongitude]
      );

      if (dist <= radius) {
        cluster.push(p2);
        assigned.add(p2.id);
      }
    }

    if (cluster.length === 1) {
      groups.push(cluster[0]);
    } else {
      groups.push(cluster);
    }
  }

  return groups;
}

/**
 * Get the center point of a cluster of posts
 */
export function clusterCenter(posts: FeedPost[]): [number, number] {
  const lats = posts.map((p) => p.locationLatitude ?? 0);
  const lngs = posts.map((p) => p.locationLongitude ?? 0);
  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
  return [avgLat, avgLng];
}
