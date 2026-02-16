import { Board } from "../../models/board.models.js";
import { Workspace } from "../../models/workspace.models.js";
import { List } from "../../models/list.models.js";
import { Task } from "../../models/task.models.js";
import { Activity } from "../../models/activity.models.js";
import { User } from "../../models/user.models.js";
import { ensureBoardMember, ensureWorkspaceMember, logActivity } from "../../utils/api-helpers.js";
import { serializeUser } from "../../middlewares/api-auth.middleware.js";

const extractMemberUserId = (member) => member?.user?._id || member?.user || member;

export const listBoards = async (req, res) => {
  try {
    const { workspace } = req.query;
    if (!workspace) {
      return res.status(400).json({ error: "workspace is required" });
    }

    const allowedWorkspace = await ensureWorkspaceMember(workspace, req.user._id);
    if (!allowedWorkspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const boards = await Board.find({ workspace }).sort({ createdAt: -1 });
    return res.status(200).json(boards);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await ensureBoardMember(id, req.user._id);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    // Allow all board members to fetch board details

    const memberUserIds = (board.members || [])
      .map((member) => extractMemberUserId(member))
      .filter(Boolean);

    const [lists, tasks, membersData] = await Promise.all([
      List.find({ board: id }).sort({ position: 1, createdAt: 1 }),
      Task.find({ board: id }).sort({ position: 1, createdAt: 1 }),
      User.find({ _id: { $in: memberUserIds } }).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
      ),
    ]);

    return res.status(200).json({
      ...board.toObject(),
      lists,
      tasks,
      membersData: membersData.map(serializeUser),
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const createBoard = async (req, res) => {
  try {
    const { title, workspace, color = "" } = req.body;
    if (!title || !workspace) {
      return res.status(400).json({ error: "title and workspace are required" });
    }

    const allowedWorkspace = await ensureWorkspaceMember(workspace, req.user._id);
    if (!allowedWorkspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const board = await Board.create({
      title,
      workspace,
      color,
      members: [{ user: req.user._id, role: "admin" }],
    });

    await logActivity({
      type: "created",
      entity: "board",
      entityId: board._id,
      board: board._id,
      user: req.user._id,
      details: { title: board.title },
    });

    return res.status(201).json(board);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await ensureBoardMember(id, req.user._id);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    const updates = {};
    ["title", "color"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedBoard = await Board.findByIdAndUpdate(id, updates, { new: true });
    await logActivity({
      type: "updated",
      entity: "board",
      entityId: updatedBoard._id,
      board: updatedBoard._id,
      user: req.user._id,
      details: { title: updatedBoard.title, changes: updates },
    });

    return res.status(200).json(updatedBoard);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await ensureBoardMember(id, req.user._id);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    await Promise.all([
      Task.deleteMany({ board: id }),
      List.deleteMany({ board: id }),
      Activity.deleteMany({ board: id }),
      Board.deleteOne({ _id: id }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
