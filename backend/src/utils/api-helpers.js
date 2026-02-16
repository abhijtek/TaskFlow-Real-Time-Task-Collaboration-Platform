import mongoose from "mongoose";
import { Workspace } from "../models/workspace.models.js";
import { Board } from "../models/board.models.js";
import { List } from "../models/list.models.js";
import { Activity } from "../models/activity.models.js";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const asObjectId = (id) => new mongoose.Types.ObjectId(id);


export const ensureWorkspaceMember = async (workspaceId, userId) => {
  if (!isValidObjectId(workspaceId)) return null;
  return Workspace.findOne({
    _id: workspaceId,
    "members.user": userId,
  });
};

export const isWorkspaceAdmin = (workspace, userId) => {
  return (
    workspace.members.find(
      (m) => String(m.user) === String(userId) && m.role === "admin"
    ) !== undefined
  );
};

export const ensureBoardMember = async (boardId, userId) => {
  if (!isValidObjectId(boardId)) return null;
  const board = await Board.findById(boardId);
  if (!board) return null;

  const workspace = await ensureWorkspaceMember(board.workspace, userId);
  if (!workspace) return null;

  return board;
};

export const isBoardAdmin = (board, userId) => {
  return (
    board.members.find(
      (m) => String(m.user) === String(userId) && m.role === "admin"
    ) !== undefined
  );
};



export const ensureListInBoard = async (listId, boardId) => {
  if (!isValidObjectId(listId) || !isValidObjectId(boardId)) return null;
  return List.findOne({ _id: listId, board: boardId });
};

export const logActivity = async ({
  type,
  entity,
  entityId,
  board,
  user,
  details = {},
}) => {
  await Activity.create({
    type,
    entity,
    entityId,
    board,
    user,
    details,
  });
};

