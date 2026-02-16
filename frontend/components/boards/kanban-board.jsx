import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import CreateList from "@/components/lists/create-list";
import BoardList from "@/components/lists/board-list";
import TaskDetailDialog from "@/components/tasks/task-detail-dialog";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { listService } from "@/services/list-service";
import { taskService } from "@/services/task-service";
import { Plus } from "lucide-react";
import {
  emitTaskCreated,
  emitTaskDeleted,
  emitTaskMoved,
  emitTaskUpdated,
  getSocket,
  emitListCreated,
  emitListUpdated,
  emitListDeleted,
} from "@/lib/socket-client";

export default function KanbanBoard({ board }) {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const syncScreenSize = () => {
      setIsSmallScreen(media.matches);
    };

    syncScreenSize();
    media.addEventListener("change", syncScreenSize);
    return () => media.removeEventListener("change", syncScreenSize);
  }, []);

  const handleListDeleted = (deletedListId) => {
    setLists((prev) => prev.filter((l) => l._id !== deletedListId));
    setTasks((prev) => {
      const next = { ...prev };
      delete next[deletedListId];
      return next;
    });
  };

  const upsertTaskInLists = (prev, task) => {
    const next = { ...prev };
    Object.keys(next).forEach((listId) => {
      next[listId] = (next[listId] || []).filter((t) => t._id !== task._id);
    });
    next[task.list] = [...(next[task.list] || []), task];
    return next;
  };

  // Load lists and tasks
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const listsData = await listService.list(board._id);
        setLists(listsData || []);

        // Load tasks for the board and group by list
        const boardTasks = await taskService.listByBoard(board._id);
        const tasksByList = {};
        for (const list of listsData || []) {
          tasksByList[list._id] = boardTasks.filter((t) => t.list === list._id) || [];
        }
        setTasks(tasksByList);
      } catch (error) {
        console.error("Error loading board data:", error);
      }
      setLoading(false);
    }
    load();
  }, [board._id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const joinCurrentBoard = () => {
      socket.emit("join-board", { boardId: board._id });
    };

    const handleTaskCreatedRemote = (task) => {
      if (task.board !== board._id) return;
      setTasks((prev) => upsertTaskInLists(prev, task));
    };

    const handleTaskUpdatedRemote = (task) => {
      if (task.board !== board._id) return;
      setTasks((prev) => upsertTaskInLists(prev, task));
    };

    const handleTaskMovedRemote = (data) => {
      if ((data.board || data.boardId) !== board._id) return;
      setTasks((prev) => {
        const next = { ...prev };
        let movedTask = null;

        Object.keys(next).forEach((listId) => {
          const found = (next[listId] || []).find((t) => t._id === data.taskId);
          if (found) movedTask = { ...found };
          next[listId] = (next[listId] || []).filter((t) => t._id !== data.taskId);
        });

        if (!movedTask) return prev;

        movedTask.list = data.toList;
        movedTask.position = data.position;

        const targetListTasks = [...(next[data.toList] || [])];
        targetListTasks.splice(data.position, 0, movedTask);
        next[data.toList] = targetListTasks;

        return next;
      });
    };

    const handleTaskDeletedRemote = (data) => {
      if ((data.board || data.boardId) !== board._id) return;
      setTasks((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((listId) => {
          next[listId] = (next[listId] || []).filter((t) => t._id !== data.taskId);
        });
        return next;
      });
    };

    const handleListCreatedRemote = (list) => {
      if (list.board !== board._id) return;
      setLists((prev) => {
        if (prev.some((l) => l._id === list._id)) return prev;
        return [...prev, list];
      });
      setTasks((prev) => ({ ...prev, [list._id]: [] }));
    };

    const handleListDeletedRemote = (list) => {
      if (list.board !== board._id) return;
      setLists((prev) => prev.filter((l) => l._id !== list._id));
      setTasks((prev) => {
        const next = { ...prev };
        delete next[list._id];
        return next;
      });
    };

    const handleListUpdatedRemote = (list) => {
      if (list.board !== board._id) return;
      setLists((prev) => prev.map((l) => (l._id === list._id ? { ...l, ...list } : l)));
    };

    socket.on("connect", joinCurrentBoard);
    socket.on("task-created", handleTaskCreatedRemote);
    socket.on("task-updated", handleTaskUpdatedRemote);
    socket.on("task-moved", handleTaskMovedRemote);
    socket.on("task-deleted", handleTaskDeletedRemote);
    socket.on("list-created", handleListCreatedRemote);
    socket.on("list-updated", handleListUpdatedRemote);
    socket.on("list-deleted", handleListDeletedRemote);

    if (socket.connected) joinCurrentBoard();

    return () => {
      socket.emit("leave-board", { boardId: board._id });
      socket.off("connect", joinCurrentBoard);
      socket.off("task-created", handleTaskCreatedRemote);
      socket.off("task-updated", handleTaskUpdatedRemote);
      socket.off("task-moved", handleTaskMovedRemote);
      socket.off("task-deleted", handleTaskDeletedRemote);
      socket.off("list-created", handleListCreatedRemote);
      socket.off("list-updated", handleListUpdatedRemote);
      socket.off("list-deleted", handleListDeletedRemote);
    };
  }, [board._id]);

  // Handle drag and drop
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    // If dropped in same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      if (type === "list") {
        // List reordering would be handled here
        return;
      }

      // Task was moved
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;
      const taskIndex = source.index;

      const sourceTasks = [...(tasks[sourceListId] || [])];
      const [movedTask] = sourceTasks.splice(taskIndex, 1);

      if (sourceListId === destListId) {
        // Same list, just reorder
        sourceTasks.splice(destination.index, 0, movedTask);
        setTasks((prev) => ({
          ...prev,
          [sourceListId]: sourceTasks,
        }));
      } else {
        // Different list - update state immediately (optimistically) for smooth animation
        const destTasks = [...(tasks[destListId] || [])];
        destTasks.splice(destination.index, 0, movedTask);

        setTasks((prev) => ({
          ...prev,
          [sourceListId]: sourceTasks,
          [destListId]: destTasks,
        }));

        // Update task's list in backend
        try {
          await taskService.update(movedTask._id, { list: destListId });
          emitTaskMoved({
            board: board._id,
            taskId: movedTask._id,
            fromList: sourceListId,
            toList: destListId,
            position: destination.index,
          });
        } catch (error) {
          console.error("Error updating task:", error);
        }
      }
    } catch (error) {
      console.error("Error handling drag:", error);
    }
  };

  const handleTaskCreated = (listId, newTask) => {
    setTasks((prev) => ({
      ...prev,
      [listId]: [...(prev[listId] || []), newTask],
    }));
    emitTaskCreated({ ...newTask, board: board._id });
  };

  const handleListCreated = (newList) => {
    setLists((prev) => [...prev, newList]);
    setTasks((prev) => ({
      ...prev,
      [newList._id]: [],
    }));
    emitListCreated(newList);
    setCreatingList(false);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleListUpdated = (updatedList) => {
    setLists((prev) => prev.map((l) => (l._id === updatedList._id ? { ...l, ...updatedList } : l)));
    emitListUpdated(updatedList);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) => upsertTaskInLists(prev, updatedTask));
    emitTaskUpdated({ ...updatedTask, board: updatedTask.board || board._id });
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((listId) => {
        next[listId] = (next[listId] || []).filter((t) => t._id !== taskId);
      });
      return next;
    });
    emitTaskDeleted(taskId, board._id);
    setTaskDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner text="Loading board..." />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background/50">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="board"
          type="list"
          direction={isSmallScreen ? "vertical" : "horizontal"}
          isCombineEnabled={false}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-3 p-3 min-h-0 sm:h-full sm:flex-row sm:gap-6 sm:p-6"
            >

              <AnimatePresence mode="popLayout">
                {lists.map((list, index) => (
                  <motion.div
                    key={list._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full sm:flex-shrink-0 sm:w-80"
                  >
                    <BoardList
                      list={list}
                      tasks={tasks[list._id] || []}
                      onTaskCreated={(task) => handleTaskCreated(list._id, task)}
                      onTaskClick={handleTaskClick}
                      onListDeleted={handleListDeleted}
                      onListUpdated={handleListUpdated}
                      boardId={board._id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Create List Button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full sm:flex-shrink-0 sm:w-80"
              >
                {creatingList ? (
                  <CreateList
                    boardId={board._id}
                    onListCreated={handleListCreated}
                    onCancel={() => setCreatingList(false)}
                  />
                ) : (
                  <button
                    onClick={() => setCreatingList(true)}
                    className="w-full h-12 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-foreground/50 hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    Add List
                  </button>
                )}
              </motion.div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          members={board?.membersData || []}
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
