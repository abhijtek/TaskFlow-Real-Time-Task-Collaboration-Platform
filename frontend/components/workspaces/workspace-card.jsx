import { motion } from "framer-motion";
import { Users, LayoutDashboard, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/auth-context";

export default function WorkspaceCard({ workspace, boardCount = 0, index = 0, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = workspace.members?.some(
    (m) => (m.user ? m.user : m) === user?._id && m.role === "admin"
  );

  const handleEdit = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    onEdit?.(workspace);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    onDelete?.(workspace);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/workspaces/${workspace._id}`}>
        <div className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all cursor-pointer h-full relative">
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: workspace.color + "20" }}
            >
              <LayoutDashboard className="w-5 h-5" style={{ color: workspace.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-foreground/90 transition-colors">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{workspace.description}</p>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {workspace.members?.length || 0} members
            </span>
            <span className="flex items-center gap-1">
              <LayoutDashboard className="w-3.5 h-3.5" />
              {boardCount} boards
            </span>
          </div>

          <AnimatePresence>
            {menuOpen && isAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                onClick={(e) => e.preventDefault()}
                className="absolute top-full right-0 mt-1 w-48 rounded-lg border border-border bg-popover shadow-lg z-50"
              >
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-3 py-2 text-sm rounded-t-lg text-foreground hover:bg-secondary transition-colors"
                >
                  Edit Workspace
                </button>
                <div className="h-px bg-border" />
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 text-sm rounded-b-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Delete Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  );
}
