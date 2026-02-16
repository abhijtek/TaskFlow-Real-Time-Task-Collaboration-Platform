import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2 } from "lucide-react";
import { WORKSPACE_COLORS } from "@/lib/constants";
import { useWorkspaces } from "@/context/workspace-context";

import { useAuth } from "@/context/auth-context";
import WorkspaceMemberList from "./workspace-member-list.jsx";

const resolveMemberId = (member) => String(member?._id || member?.id || member?.user?._id || member?.user?.id || member?.user || member || "");

export default function EditWorkspaceDialog({ open, onClose, workspace }) {
  const { updateWorkspace, removeWorkspace, fetchWorkspace } = useWorkspaces();
  const { user } = useAuth();

  const [workspaceData, setWorkspaceData] = useState(workspace || null);
  const [name, setName] = useState(workspace?.name || "");
  const [description, setDescription] = useState(workspace?.description || "");
  const [color, setColor] = useState(workspace?.color || WORKSPACE_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!open || !workspace?._id) return;

    setWorkspaceData(workspace);
    setName(workspace.name || "");
    setDescription(workspace.description || "");
    setColor(workspace.color || WORKSPACE_COLORS[0]);

    fetchWorkspace(workspace._id).then((fullWorkspace) => {
      if (fullWorkspace?._id === workspace._id) {
        setWorkspaceData(fullWorkspace);
      }
    });
  }, [open, workspace, fetchWorkspace]);

  const currentUserId = String(user?._id || "");
  const isOwner = String(workspaceData?.owner?._id || workspaceData?.owner || "") === currentUserId;
  const isAdmin = isOwner || (workspaceData?.members || []).some((member) => {
    const role = String(member?.role || "").toLowerCase();
    return resolveMemberId(member) === currentUserId && role === "admin";
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await updateWorkspace(workspaceData._id, {
      name: name.trim(),
      description: description.trim(),
      color,
    });
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    await removeWorkspace(workspaceData._id);
    setLoading(false);
    onClose();
  };

  if (!workspaceData) return null;

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
            className="relative w-full max-w-xl mx-4 rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Edit Workspace</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {showDeleteConfirm ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-foreground">Delete "{workspaceData?.name}"?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will permanently delete the workspace, all boards, lists, and tasks. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 h-10 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 h-10 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Workspace name"
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="What is this workspace about?"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {WORKSPACE_COLORS.map((c) => (
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

                {isAdmin && (
                  <div className="pt-2">
                    <WorkspaceMemberList workspace={workspaceData} onWorkspaceUpdated={setWorkspaceData} />
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading || !name.trim()}
                      className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-secondary transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


