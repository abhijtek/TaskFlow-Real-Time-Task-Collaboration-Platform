import { Board } from "../../models/board.models.js";
import { List } from "../../models/list.models.js";
import { Task } from "../../models/task.models.js";
import { ensureBoardMember, ensureListInBoard, logActivity } from "../../utils/api-helpers.js";

export const listTasks = async (req, res) => {
  try {
    const { board } = req.query;
    if (!board) {
      return res.status(400).json({ error: "board is required" });
    }

    const allowedBoard = await ensureBoardMember(board, req.user._id);
    if (!allowedBoard) {
      return res.status(404).json({ error: "Board not found" });
    }

    const tasks = await Task.find({ board }).sort({ position: 1, createdAt: 1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description = "",
      list,
      board,
      position,
      priority = "medium",
      dueDate = null,
      assignee = null,
    } = req.body;

    if (!title || !list || !board) {
      return res.status(400).json({ error: "title, list and board are required" });
    }

    const allowedBoard = await ensureBoardMember(board, req.user._id);
    if (!allowedBoard) {
      return res.status(404).json({ error: "Board not found" });
    }

    const validList = await ensureListInBoard(list, board);
    if (!validList) {
      return res.status(400).json({ error: "Invalid list for board" });
    }

    let nextPosition = position;
    if (nextPosition === undefined) {
      const lastTask = await Task.findOne({ list }).sort({ position: -1 });
      nextPosition = lastTask ? lastTask.position + 1 : 0;
    }

    const task = await Task.create({
      title,
      description,
      list,
      board,
      position: nextPosition,
      priority,
      dueDate,
      assignee,
      createdBy: req.user._id,
    });

    await logActivity({
      type: "created",
      entity: "task",
      entityId: task._id,
      board,
      user: req.user._id,
      details: { title: task.title },
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const allowedBoard = await ensureBoardMember(task.board, req.user._id);
    if (!allowedBoard) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = {};
    ["title", "description", "priority", "dueDate", "position", "list"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.list) {
      const validList = await ensureListInBoard(updates.list, task.board);
      if (!validList) {
        return res.status(400).json({ error: "Invalid list for board" });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    await logActivity({
      type: "updated",
      entity: "task",
      entityId: updatedTask._id,
      board: updatedTask.board,
      user: req.user._id,
      details: { title: updatedTask.title, changes: updates },
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const allowedBoard = await ensureBoardMember(task.board, req.user._id);
    if (!allowedBoard) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Task.deleteOne({ _id: id });

    await logActivity({
      type: "deleted",
      entity: "task",
      entityId: task._id,
      board: task.board,
      user: req.user._id,
      details: { title: task.title },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const moveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { listId, position } = req.body;

    if (!listId || position === undefined) {
      return res.status(400).json({ error: "listId and position are required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const allowedBoard = await ensureBoardMember(task.board, req.user._id);
    if (!allowedBoard) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const targetList = await ensureListInBoard(listId, task.board);
    if (!targetList) {
      return res.status(400).json({ error: "Invalid list for board" });
    }

    const oldList = task.list;
    task.list = listId;
    task.position = position;
    await task.save();

    await logActivity({
      type: "moved",
      entity: "task",
      entityId: task._id,
      board: task.board,
      user: req.user._id,
      details: { title: task.title, from: oldList, to: listId },
    });

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    if (!assigneeId) {
      return res.status(400).json({ error: "assigneeId is required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const board = await ensureBoardMember(task.board, req.user._id);
    if (!board) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const isMember = board.members.some((memberId) => String(memberId) === String(assigneeId));
    if (!isMember) {
      return res.status(400).json({ error: "Assignee is not a board member" });
    }

    task.assignee = assigneeId;
    await task.save();

    await logActivity({
      type: "assigned",
      entity: "task",
      entityId: task._id,
      board: task.board,
      user: req.user._id,
      details: { title: task.title, assigneeId },
    });

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
