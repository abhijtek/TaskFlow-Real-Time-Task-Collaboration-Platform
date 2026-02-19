"use client";

import { motion } from "framer-motion";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import ListHeader from "./list-header";
import TaskCard from "@/components/tasks/task-card";
import CreateTask from "@/components/tasks/create-task";

export default function BoardList({
  list,
  boardId,
  tasks = [],
  onTaskCreated,
  onTaskClick,
  onListDeleted,
  onListUpdated,
  dragHandleProps,
  index = 0,
}) {
  return (
    <motion.div
      layout
      className="flex-shrink-0 w-80 bg-card rounded-xl border border-border shadow-sm flex flex-col max-h-[calc(100vh-10rem)] overflow-hidden"
    >
      {/* List Header - Draggable Handle */}
      <motion.div {...dragHandleProps}>
        <ListHeader
          list={list}
          taskCount={tasks.length}
          onDelete={onListDeleted}
          onUpdated={onListUpdated}
        />
      </motion.div>

      {/* Task Drop Zone */}
      <Droppable droppableId={list._id} type="task">
        {(dropProvided, dropSnapshot) => (
          <motion.div
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className={`flex-1 overflow-y-auto scrollbar-hidden px-3 py-2 min-h-[100px] transition-all rounded-lg ${
              dropSnapshot.isDraggingOver ? "bg-primary/10" : "bg-secondary/30"
            }`}
            layout
          >
            <motion.div layout>
              {tasks.map((task, taskIndex) => (
                <Draggable
                  key={task._id}
                  draggableId={task._id}
                  index={taskIndex}
                >
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mb-2 ${
                        snapshot.isDragging ? "shadow-lg" : ""
                      }`}
                    >
                      <TaskCard
                        task={task}
                        index={taskIndex}
                        onClick={() => onTaskClick(task)}
                      />
                    </motion.div>
                  )}
                </Draggable>
              ))}
            </motion.div>
            {dropProvided.placeholder}
          </motion.div>
        )}
      </Droppable>

      {/* Create Task Button */}
      <motion.div className="px-3 pb-3 pt-1">
        <CreateTask
          listId={list._id}
          boardId={boardId || list.board}
          onTaskCreated={onTaskCreated}
        />
      </motion.div>
    </motion.div>
  );
}
