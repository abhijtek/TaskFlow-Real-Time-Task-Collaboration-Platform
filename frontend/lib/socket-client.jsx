export function emitListDeleted(list) {
  const s = getSocket();
  if (s?.connected) s.emit("list-deleted", list);
}
export function emitListCreated(list) {
  const s = getSocket();
  if (s?.connected) s.emit("list-created", list);
}
export function emitListUpdated(list) {
  const s = getSocket();
  if (s?.connected) s.emit("list-updated", list);
}
export function joinWorkspace(workspaceId){
  const s = getSocket();
  if(s?.connected)s.emit("join-workspace",{workspaceId});
}

export function leaveWorkspace(workspaceId){
  const s = getSocket();
  if(s?.connected)s.emit("leave-workspace",{workspaceId});
}

export function emitBoardCreated(board){
  const s = getSocket();
  if(s?.connected)s.emit("board-created",board);
}

import { io } from "socket.io-client";
import { SOCKET_URL } from "./constants";

let socket = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (socket) return socket;

  try {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", () => {
      // Server not available, socket will retry silently
    });

    return socket;
  } catch {
    return null;
  }
}

export function connectSocket(token) {
  const s = getSocket();
  if (!s) return;
  s.auth = { token };
  s.connect();
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinBoard(boardId) {
  const s = getSocket();
  if (s?.connected) s.emit("join-board", { boardId });
}

export function leaveBoard(boardId) {
  const s = getSocket();
  if (s?.connected) s.emit("leave-board", { boardId });
}

export function emitTaskCreated(task) {
  const s = getSocket();
  if (s?.connected) s.emit("task-created", task);
}

export function emitTaskUpdated(task) {
  const s = getSocket();
  if (s?.connected) s.emit("task-updated", task);
}

export function emitTaskMoved(data) {
  const s = getSocket();
  if (s?.connected) s.emit("task-moved", data);
}

export function emitTaskDeleted(taskId, boardId) {
  const s = getSocket();
  if (!s?.connected) return;
  const payload = { taskId };
  if (boardId) payload.board = boardId;
  s.emit("task-deleted", payload);
}
