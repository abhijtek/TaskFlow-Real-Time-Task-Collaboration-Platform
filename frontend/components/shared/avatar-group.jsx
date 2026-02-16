"use client";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const COLORS = ["#d4a853", "#6b8e6b", "#5b7db1", "#9b6b9b", "#e07a3a", "#c0392b"];

function hashColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function AvatarGroup({ users = [], max = 4, size = "sm" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-8 h-8 text-xs", lg: "w-10 h-10 text-sm" };
  const shown = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((user) => (
        <div
          key={user._id}
          className={`${sizes[size]} rounded-full border-2 border-background flex items-center justify-center font-medium`}
          style={{ backgroundColor: hashColor(user.name), color: "#fff" }}
          title={user.name}
        >
          {getInitials(user.name)}
        </div>
      ))}
      {overflow > 0 && (
        <div className={`${sizes[size]} rounded-full border-2 border-background bg-secondary flex items-center justify-center text-muted-foreground font-medium`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

export { getInitials, hashColor };
