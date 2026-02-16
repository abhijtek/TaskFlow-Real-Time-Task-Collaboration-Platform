import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { boardService } from "@/services/board-service";
import { listService } from "@/services/list-service";
import { taskService } from "@/services/task-service";
import { useAuth } from "@/context/auth-context";
import { getSocket } from "@/lib/socket-client";
import { emitTaskCreated, emitTaskUpdated, emitTaskMoved, emitTaskDeleted, joinBoard, leaveBoard } from "@/lib/socket-client";

const BoardContext = createContext(undefined);

export function BoardProvider({ boardId, children }) {
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const data = await boardService.get(boardId);
      if (data) {
        setBoard(data);
        setLists((data.lists || []).sort((a, b) => a.position - b.position));
        setTasks(data.tasks || []);
        setMembers(data.membersData || []);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Socket.io real-time listeners
  useEffect(() => {
    if (!boardId) return;
    joinBoard(boardId);
    const socket = getSocket();
    if (!socket) return;

    const handleTaskCreated = (task) => {
      if (task.board === boardId) {
        setTasks((prev) => [...prev.filter((t) => t._id !== task._id), task]);
      }
    };
    const handleTaskUpdated = (task) => {
      if (task.board === boardId) {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, ...task } : t)));
      }
    };
    const handleTaskMovedRemote = (data) => {
      setTasks((prev) => prev.map((t) =>
        t._id === data.taskId ? { ...t, list: data.toList, position: data.position } : t
      ));
    };
    const handleTaskDeletedRemote = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    socket.on("task-created", handleTaskCreated);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("task-moved", handleTaskMovedRemote);
    socket.on("task-deleted", handleTaskDeletedRemote);

    return () => {
      leaveBoard(boardId);
      socket.off("task-created", handleTaskCreated);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("task-moved", handleTaskMovedRemote);
      socket.off("task-deleted", handleTaskDeletedRemote);
    };
  }, [boardId]);

  const getTasksForList = useCallback((listId) => {
    return tasks.filter((t) => t.list === listId).sort((a, b) => a.position - b.position);
  }, [tasks]);

  const createTask = useCallback(async (data) => {
    const task = await taskService.create({ ...data, board: boardId }, user?._id);
    setTasks((prev) => [...prev, task]);
    emitTaskCreated(task);
    return task;
  }, [boardId, user]);

  const updateTask = useCallback(async (id, data) => {
    const task = await taskService.update(id, data, user?._id);
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...task } : t)));
    emitTaskUpdated(task);
    return task;
  }, [user]);

  const removeTask = useCallback(async (id) => {
    await taskService.remove(id, user?._id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    emitTaskDeleted(id);
  }, [user]);

  const moveTask = useCallback(async (taskId, fromListId, toListId, newPosition) => {
    // Optimistic update
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t._id === taskId) return { ...t, list: toListId, position: newPosition };
        return t;
      });
      return updated;
    });
    await taskService.move(taskId, toListId, newPosition, user?._id);
    emitTaskMoved({ taskId, fromList: fromListId, toList: toListId, position: newPosition });
  }, [user]);

  const assignTask = useCallback(async (id, assigneeId) => {
    const task = await taskService.assign(id, assigneeId, user?._id);
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...task } : t)));
    emitTaskUpdated(task);
  }, [user]);

  const createList = useCallback(async (title) => {
    const list = await listService.create({ title, board: boardId });
    setLists((prev) => [...prev, list]);
    return list;
  }, [boardId]);

  const updateList = useCallback(async (id, data) => {
    const list = await listService.update(id, data);
    setLists((prev) => prev.map((l) => (l._id === id ? { ...l, ...list } : l)));
  }, []);

  const removeList = useCallback(async (id) => {
    await listService.remove(id);
    setLists((prev) => prev.filter((l) => l._id !== id));
    setTasks((prev) => prev.filter((t) => t.list !== id));
  }, []);

  const handleDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "list") {
      const reordered = Array.from(lists);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setLists(reordered);
      await listService.reorder(boardId, reordered.map((l) => l._id));
      return;
    }

    // Task drag
    const fromListId = source.droppableId;
    const toListId = destination.droppableId;

    await moveTask(draggableId, fromListId, toListId, destination.index);
  }, [lists, boardId, moveTask]);

  return (
    <BoardContext.Provider value={{
      board, lists, tasks, members, loading,
      getTasksForList, createTask, updateTask, removeTask, moveTask, assignTask,
      createList, updateList, removeList, handleDragEnd, fetchBoard,
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
}
