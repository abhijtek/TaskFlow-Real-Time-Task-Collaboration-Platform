import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Calendar, Flag, AlignLeft, User } from "lucide-react";
import { taskService } from "@/services/task-service";
import { emitTaskUpdated } from "@/lib/socket-client";
import ActivityFeed from "@/components/shared/activity-feed";

export default function TaskDetailDialog({
  task,
  members = [],
  open,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setAssigneeId(task.assignee || "");
    }
  }, [task, open]);

  const handleSave = async () => {
    if (!task || !title.trim()) return;

    setLoading(true);
    try {
      let updated = await taskService.update(task._id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
      });

      if (assigneeId && assigneeId !== (task.assignee || "")) {
        updated = await taskService.assign(task._id, assigneeId);
      }

      emitTaskUpdated({ ...task, ...updated }); // Emit socket event for live update
      onTaskUpdated?.(updated);
    } catch (error) {
      console.error("Error updating task:", error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    if (window.confirm(`Delete "${task.title}"?`)) {
      setLoading(true);
      try {
        await taskService.delete(task._id);
        onTaskDeleted?.(task._id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
      setLoading(false);
    }
  };

  const handleClose = async () => {
    await handleSave();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-lg max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Task Details</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1">
                  <AlignLeft className="w-4 h-4" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Add task description..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1">
                  <Flag className="w-4 h-4" />
                  Priority
                </label>
                <div className="flex gap-2">
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        priority === p
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1">
                  <User className="w-4 h-4" />
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Task History */}
              {task && task.board && (
                <div className="pt-4 border-t border-border">
                  <ActivityFeed boardId={task.board} taskId={task._id} />
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="h-10 w-10 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
