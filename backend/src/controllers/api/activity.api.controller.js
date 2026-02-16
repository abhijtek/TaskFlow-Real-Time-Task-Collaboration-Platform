import { Activity } from "../../models/activity.models.js";
import { ensureBoardMember } from "../../utils/api-helpers.js";

export const listActivities = async (req, res) => {
  try {
    const { boardId } = req.query;
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.max(Number(req.query.limit || 20), 1);

    if (!boardId) {
      return res.status(400).json({ error: "boardId is required" });
    }

    const board = await ensureBoardMember(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const total = await Activity.countDocuments({ board: boardId });
    const activities = await Activity.find({ board: boardId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.setHeader("X-Total-Count", total);
    return res.status(200).json({ activities, total, page });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
