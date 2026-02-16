"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { listService } from "@/services/list-service";
import { motion } from "framer-motion";

export default function CreateList({ boardId, onListCreated, onCancel, showForm = true }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const newList = await listService.create(boardId, {
        name: title.trim(),
        position: 0,
      });
      onListCreated(newList);
      setTitle("");
      onCancel?.();
    } catch (error) {
      console.error("Error creating list:", error);
    }
    setLoading(false);
  };

  if (!showForm) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-80 rounded-lg border border-border bg-card p-4 shadow-md"
    >
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List title..."
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
          onKeyDown={(e) => {
            if (e.key === "Escape") onCancel?.();
          }}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="flex-1 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating..." : "Add"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
