import { MapActivity } from "@/lib/types";

export const mockActivities: MapActivity[] = [
  {
    id: "a1",
    point: [-7.5559, 110.8186],
    label: "Gotong Royong Bersih Sungai",
    type: "event",
    icon: "heart",
    color: "#EF4444",
  },
  {
    id: "a2",
    point: [-7.5571, 110.8214],
    label: "Donasi untuk Korban Banjir",
    type: "campaign",
    icon: "gift",
    color: "#F59E0B",
  },
  {
    id: "a3",
    point: [-7.5606, 110.8192],
    label: "Rapat Warga Mingguan",
    type: "event",
    icon: "calendar",
    color: "#3B82F6",
  },
  {
    id: "a4",
    point: [-7.5545, 110.8205],
    label: "Posko Kesehatan Gratis",
    type: "campaign",
    icon: "cross",
    color: "#10B981",
  },
];
