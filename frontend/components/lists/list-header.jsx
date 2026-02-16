"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import { listService } from "@/services/list-service";
import { emitListDeleted, emitListUpdated } from "@/lib/socket-client";

export default function ListHeader({ list, taskCount = 0, onDelete, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.name || list.title || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(list.name || list.title || "");
  }, [list.name, list.title, list._id]);

  const handleSave = async () => {
    if (!title.trim() || title === (list.name || list.title)) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      const updated = await listService.update(list._id, { name: title.trim() });
      const payload = { ...list, ...updated };
      emitListUpdated(payload);
      onUpdated?.(payload);
      setEditing(false);
    } catch (error) {
      console.error("Error saving list:", error);
      setTitle(list.name || list.title);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${list.name || list.title}" list?`)) return;
    setLoading(true);
    try {
      await listService.remove(list._id);
      emitListDeleted(list); // Emit socket event for real-time update
      if (onDelete) {
        onDelete(list._id);
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      alert("Failed to delete list");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
      {editing ? (
        <div className="flex items-center gap-1 flex-1">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setTitle(list.name || list.title);
                setEditing(false);
              }
            }}
            className="flex-1 h-8 rounded-lg border border-input bg-background px-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="h-8 w-8 rounded flex items-center justify-center text-primary hover:bg-secondary disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setTitle(list.name || list.title);
              setEditing(false);
            }}
            className="h-8 w-8 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {list.name || list.title}
            </h3>
            <p className="text-xs text-muted-foreground">{taskCount} tasks</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-8 w-8 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-border bg-card shadow-md">
                <button
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-md"
                >
                  <Pencil className="w-4 h-4" />
                  Edit List
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setMenuOpen(false);
                  }}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-secondary transition-colors last:rounded-b-md disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete List
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
