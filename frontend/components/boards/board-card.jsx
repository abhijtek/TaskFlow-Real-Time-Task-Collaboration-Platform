import { motion } from "framer-motion";
import { LayoutDashboard, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function BoardCard({ board, workspaceId, taskCount = 0, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/workspaces/${workspaceId}/boards/${board._id}`}>
        <div className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all cursor-pointer h-full">
          <div className="h-2" style={{ backgroundColor: board.color }} />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-4 h-4" style={{ color: board.color }} />
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {board.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {taskCount} tasks
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
