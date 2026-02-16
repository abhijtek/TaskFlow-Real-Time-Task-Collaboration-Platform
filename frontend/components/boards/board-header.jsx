"use client";

import { useBoard } from "@/context/board-context";
import { useAuth } from "@/context/auth-context";
import AvatarGroup from "@/components/shared/avatar-group";
import { LayoutDashboard, Filter } from "lucide-react";
import { useState } from "react";

  const { board, members, tasks, lists } = useBoard();
  const { user } = useAuth();
  const [filterPriority, setFilterPriority] = useState("all");
  const isAdmin = board?.members?.some(
    (m) => (m.user ? m.user : m) === user?._id && m.role === "admin"
  );

  const handleFilter = (p) => {
    setFilterPriority(p);
    if (onFilterChange) onFilterChange(p);
  };

  if (!board) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (board.color || "#d4a853") + "20" }}>
          <LayoutDashboard className="w-4 h-4" style={{ color: board.color || "#d4a853" }} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{board.title}</h2>
          <p className="text-xs text-muted-foreground">{lists.length} lists / {tasks.length} tasks</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AvatarGroup users={members} max={5} size="sm" />
        {isAdmin && (
          <>
            {/* Example admin-only controls: */}
            <button className="ml-2 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium">Edit Board</button>
            <button className="ml-2 px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs font-medium">Delete Board</button>
            {/* Add more admin controls as needed */}
          </>
        )}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={filterPriority}
            onChange={(e) => handleFilter(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
