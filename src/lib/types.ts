export interface FeedPost {
  id: string;
  author: string;
  city: string;
  timeAgo: string;
  title: string;
  body: string;
  imageAsset: string;
  createdAt?: string;
  topic: string;
  imagePaths: string[];
  locationEnabled: boolean;
  locationLabel?: string;
  coordinateLabel?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  checkoutCompleted: boolean;
  likes: number;
  comments: number;
}

export interface MapIssueCluster {
  point: [number, number]; // [lat, lng]
  count: number;
  radiusMeters: number;
}

export interface MapFocusedCheckIn {
  id: number;
  point: [number, number];
  label: string;
  coordinateLabel?: string;
  caption?: string;
  author: string;
  timeLabel: string;
  imageAsset?: string;
  imagePaths: string[];
  authorImagePath?: string;
}

export interface VisibleCheckIn {
  point: [number, number];
  author: string;
  timeLabel: string;
  title: string;
  subtitle: string;
  meta: string;
  color: string;
  icon: string;
  distanceMeters: number;
  imageAsset?: string;
  imagePaths: string[];
  authorImagePath?: string;
  post?: FeedPost;
  isFocused: boolean;
  isPostRecord: boolean;
}

export interface MapActivity {
  id: string;
  point: [number, number];
  label: string;
  type: "event" | "campaign" | "other";
  icon: string;
  color: string;
}
