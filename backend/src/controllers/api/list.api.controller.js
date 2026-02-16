import { Board } from "../../models/board.models.js";
import { List } from "../../models/list.models.js";
import { Task } from "../../models/task.models.js";
import { ensureBoardMember, logActivity } from "../../utils/api-helpers.js";

export const createList = async (req, res) => {
  try {
    const { title, board, position } = req.body;
    if (!title || !board) {
      return res.status(400).json({ error: "title and board are required" });
    }

    const allowedBoard = await ensureBoardMember(board, req.user._id);
    if (!allowedBoard) {
      return res.status(404).json({ error: "Board not found" });
    }

    let nextPosition = position;
    if (nextPosition === undefined) {
      const lastList = await List.findOne({ board }).sort({ position: -1 });
      nextPosition = lastList ? lastList.position + 1 : 0;
    }

    const list = await List.create({ title, board, position: nextPosition });

    await logActivity({
      type: "created",
      entity: "list",
      entityId: list._id,
      board,
      user: req.user._id,
      details: { title: list.title },
    });

    return res.status(201).json(list);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    const allowedBoard = await ensureBoardMember(list.board, req.user._id);
    if (!allowedBoard) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = {};
    ["title", "position"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedList = await List.findByIdAndUpdate(id, updates, { new: true });

    await logActivity({
      type: "updated",
      entity: "list",
      entityId: updatedList._id,
      board: updatedList.board,
      user: req.user._id,
      details: { title: updatedList.title, changes: updates },
    });

    return res.status(200).json(updatedList);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await List.findById(id);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    const allowedBoard = await ensureBoardMember(list.board, req.user._id);
    if (!allowedBoard) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Promise.all([Task.deleteMany({ list: id }), List.deleteOne({ _id: id })]);

    await logActivity({
      type: "deleted",
      entity: "list",
      entityId: list._id,
      board: list.board,
      user: req.user._id,
      details: { title: list.title },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const reorderLists = async (req, res) => {
  try {
    const { boardId, listOrder } = req.body;
    if (!boardId || !Array.isArray(listOrder)) {
      return res.status(400).json({ error: "boardId and listOrder are required" });
    }

    const allowedBoard = await ensureBoardMember(boardId, req.user._id);
    if (!allowedBoard) {
      return res.status(404).json({ error: "Board not found" });
    }

    const updates = listOrder.map((entry, index) => {
      const listId = typeof entry === "string" ? entry : entry.listId;
      const position = typeof entry === "string" ? index : entry.position;
      return List.updateOne({ _id: listId, board: boardId }, { $set: { position } });
    });

    await Promise.all(updates);

    await logActivity({
      type: "moved",
      entity: "list",
      entityId: allowedBoard._id,
      board: allowedBoard._id,
      user: req.user._id,
      details: { listOrder },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
