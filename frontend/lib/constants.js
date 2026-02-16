export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const PRIORITIES = {
  low: { label: "Low", color: "#6b8e6b", bg: "#2d3a2d" },
  medium: { label: "Medium", color: "#d4a853", bg: "#3a3420" },
  high: { label: "High", color: "#e07a3a", bg: "#3a2a1a" },
  urgent: { label: "Urgent", color: "#c0392b", bg: "#3a1a1a" },
};

export const PRIORITIES_LIGHT = {
  low: { label: "Low", color: "#2e7d32", bg: "#e8f5e9" },
  medium: { label: "Medium", color: "#b8860b", bg: "#fff8e1" },
  high: { label: "High", color: "#e65100", bg: "#fff3e0" },
  urgent: { label: "Urgent", color: "#c62828", bg: "#ffebee" },
};

export const WORKSPACE_COLORS = [
  "#d4a853", "#e07a3a", "#6b8e6b", "#5b7db1",
  "#9b6b9b", "#c0392b", "#2e7d32", "#1565c0",
];

export const BOARD_COLORS = [
  "#d4a853", "#e07a3a", "#6b8e6b", "#5b7db1",
  "#9b6b9b", "#c0392b", "#e8b44d", "#b8860b",
];

export const DEFAULT_LISTS = ["To Do", "In Progress", "In Review", "Done"];
