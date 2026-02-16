"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { BOARD_COLORS, DEFAULT_LISTS } from "@/lib/constants";
import { boardService } from "@/services/board-service";
import { listService } from "@/services/list-service";
import { emitBoardCreated } from "@/lib/socket-client";

export default function CreateBoardDialog({ open, onClose, workspaceId, onCreated }) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(BOARD_COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const board = await boardService.create({
        title: title.trim(),
        color,
        workspace: workspaceId,
        members: [],
      })
      emitBoardCreated(board);
      // Create default lists
      for (const listTitle of DEFAULT_LISTS) {
        await listService.create({ title: listTitle, board: board._id });
      }
      if (onCreated) onCreated(board);
      setTitle("");
      setColor(BOARD_COLORS[0]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md mx-4 rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">New Board</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Board Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Sprint 24"
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {BOARD_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded-lg transition-all"
                      style={{
                        backgroundColor: c,
                        boxShadow: color === c ? `0 0 0 2px var(--background), 0 0 0 4px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                This board will be created with default lists: {DEFAULT_LISTS.join(", ")}
              </p>

              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Board
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
