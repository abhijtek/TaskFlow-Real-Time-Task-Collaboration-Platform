"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { taskService } from "@/services/task-service";
import { motion } from "framer-motion";

export default function CreateTask({ listId, boardId, onTaskCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const newTask = await taskService.create(listId, {
        title: title.trim(),
        description: "",
        board: boardId,
        priority: "medium",
        dueDate: null,
      });
      onTaskCreated?.(newTask);
      setTitle("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTitle("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add task
      </button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="p-2 border border-border rounded-lg bg-secondary/20"
    >
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2"
        onKeyDown={(e) => {
          if (e.key === "Escape") handleCancel();
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "..." : "Add"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.form>
  );
}
