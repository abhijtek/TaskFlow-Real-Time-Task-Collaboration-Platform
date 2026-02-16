"use client";

import { useState, useEffect } from "react";
import { activityService } from "@/services/activity-service";
import { Activity, ArrowRight, Plus, Pencil, Trash2, UserPlus, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const ICONS = {
  created: Plus,
  updated: Pencil,
  moved: ArrowRight,
  assigned: UserPlus,
  deleted: Trash2,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityFeed({ boardId, taskId }) {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!boardId) return;
    setLoading(true);
    const fetchActivities = async () => {
      let activities = [];
      let total = 0;
      if (taskId) {
        activities = await activityService.getTaskActivities(boardId, taskId, 1, 10);
        total = activities.length;
      } else {
        const res = await activityService.list(boardId, 1, 10);
        activities = res.activities || [];
        total = res.total || 0;
      }
      setActivities(activities);
      setTotal(total);
      setPage(1);
    };
    fetchActivities().finally(() => setLoading(false));
  }, [boardId, taskId]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoading(true);
    let newActivities = [];
    if (taskId) {
      newActivities = await activityService.getTaskActivities(boardId, taskId, nextPage, 10);
    } else {
      const res = await activityService.list(boardId, nextPage, 10);
      newActivities = res.activities || [];
    }
    setActivities((prev) => [...prev, ...newActivities]);
    setPage(nextPage);
    setLoading(false);
  };

  if (!activities.length && !loading) return null;

  return (
    <div>
      <h4 className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-3">
        <Activity className="w-4 h-4 text-muted-foreground" />
        Activity
      </h4>
      <div className="flex flex-col gap-0">
        {activities.map((a, i) => {
          const Icon = ICONS[a.type] || Activity;
          return (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2 py-2 border-l-2 border-border pl-3 ml-2"
            >
              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-medium">{a.type}</span>
                  {" "}
                  <span className="text-muted-foreground">{a.entity}</span>
                  {a.details?.title && (
                    <span className="font-medium">{" \""}{a.details.title}{"\""}</span>
                  )}
                  {a.details?.from && a.details?.to && (
                    <span className="text-muted-foreground">
                      {" from "}{a.details.from}{" to "}{a.details.to}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(a.createdAt)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      {activities.length < total && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
        >
          <ChevronDown className="w-3 h-3" />
          Load more
        </button>
      )}
    </div>
  );
}
