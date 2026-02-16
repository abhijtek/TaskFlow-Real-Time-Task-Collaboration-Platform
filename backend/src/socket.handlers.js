import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";

export function setupSocketHandlers(io) {
  // Middleware to verify JWT token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication token required"));
    }

    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      socket.userId = decoded._id;
      socket.userEmail = decoded.email;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });
///////////////////////////
  io.on("connection", (socket) => {
    // Task created
    socket.on("task-created", (task) => {
      if (task.board) {
        socket.to(`board-${task.board}`).emit("task-created", task);
      }
    });

    // Task moved
    socket.on("task-moved", (data) => {
      const { board, taskId, fromList, toList, position } = data;
      // Broadcast to all users in the board except sender
      socket.to(`board-${board}`).emit("task-moved", {
        taskId,
        fromList,
        toList,
        position,
        board,
        userId: socket.userId,
        username: socket.username,
      });
    });
//////////////////////////
    // Task updated
    socket.on("task-updated", (task) => {
      if (task.board) {
        socket.to(`board-${task.board}`).emit("task-updated", task);
      }
    });

    // Task deleted
    socket.on("task-deleted", (data) => {
      const boardId = data?.board || data?.boardId;
      if (boardId) {
        socket.to(`board-${boardId}`).emit("task-deleted", data);
      }
    });
//////////////////////
    console.log(`User connected: ${socket.id}, userId: ${socket.userId}, username: ${socket.username}`);

    // Join board room
    socket.on("join-board", (data) => {
      const { boardId } = data;
      socket.join(`board-${boardId}`);
      console.log(`User ${socket.username} joined board ${boardId}`);
      socket.to(`board-${boardId}`).emit("user-joined", {
        userId: socket.userId,
        username: socket.username,
        boardId,
      });
    });
    // Board created
    socket.on("join-workspace",({workspaceId})=>{
       socket.join(`workspace-${workspaceId}`);
    })
    socket.on("leave-workspace",({workspaceId})=>{
        socket.leave(`workspace-${workspaceId}`);
    })
    socket.on("board-created", (board) => {
      if (!board?.workspace) return;
      socket.to(`workspace-${board.workspace}`).emit("board-created", board);
    });
    /////
    // Leave board room
    socket.on("leave-board", (data) => {
      const { boardId } = data;
      socket.leave(`board-${boardId}`);
      console.log(`User ${socket.username} left board ${boardId}`);
      socket.to(`board-${boardId}`).emit("user-left", {
        userId: socket.userId,
        username: socket.username,
        boardId,
      });
    });

    // List created
    socket.on("list-created", (list) => {
      if (list.board) {
        socket.to(`board-${list.board}`).emit("list-created", list);
      }
    });

    // List updated
    socket.on("list-updated", (list) => {
      if (list.board) {
        socket.to(`board-${list.board}`).emit("list-updated", list);
      }
    });

    // List deleted
    socket.on("list-deleted", (list) => {
      if (list.board) {
        socket.to(`board-${list.board}`).emit("list-deleted", list);
      }
    });
  });
}
