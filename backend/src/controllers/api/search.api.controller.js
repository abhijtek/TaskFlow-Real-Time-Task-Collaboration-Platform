import { Board } from "../../models/board.models.js";
import { Task } from "../../models/task.models.js";
import { ensureWorkspaceMember } from "../../utils/api-helpers.js";

export const search = async (req, res) => {
  try {
    const { q = "", workspace } = req.query;
    if (!workspace) {
      return res.status(400).json({ error: "workspace is required" });
    }

    const allowedWorkspace = await ensureWorkspaceMember(workspace, req.user._id);
    if (!allowedWorkspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const query = q.trim();
    if (!query) {
      return res.status(200).json({ tasks: [], boards: [] });
    }

    const workspaceBoards = await Board.find({ workspace }).select("_id");
    const boardIds = workspaceBoards.map((board) => board._id);

    const [tasks, boards] = await Promise.all([
      Task.find({
        board: { $in: boardIds },
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      }).limit(30),
      Board.find({
        workspace,
        title: { $regex: query, $options: "i" },
      }).limit(30),
    ]);

    return res.status(200).json({ tasks, boards });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
