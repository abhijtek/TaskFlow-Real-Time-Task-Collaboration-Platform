"use client";

import { motion } from "framer-motion";
import { Calendar, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const priorityColors = {
  low: { bg: "bg-slate-200 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300" },
  medium: { bg: "bg-amber-200 dark:bg-amber-900", text: "text-amber-800 dark:text-amber-200" },
  high: { bg: "bg-orange-200 dark:bg-orange-900", text: "text-orange-800 dark:text-orange-200" },
  urgent: { bg: "bg-red-200 dark:bg-red-900", text: "text-red-800 dark:text-red-200" },
};

export default function TaskCard({ task, index, onClick }) {
  const priority = priorityColors[task.priority] || priorityColors.medium;
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      onClick={() => onClick?.(task)}
      className={`rounded-lg border bg-card p-3 cursor-pointer transition-all hover:shadow-md ${
        isOverdue
          ? "border-red-500/40 dark:border-red-400/70 dark:shadow-[0_0_0_1px_rgba(248,113,113,0.15)]"
          : "border-border/70 dark:border-white/35 hover:border-primary/40 dark:hover:border-white/55 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1">
          {task.title}
        </p>
        {task.priority && (
          <span className={`shrink-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${priority.bg} ${priority.text}`}>
            {task.priority}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {task.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : ""}`}>
            <Calendar className="w-3 h-3" />
            {isOverdue ? "Overdue" : formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
