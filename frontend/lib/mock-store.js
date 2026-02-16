import { SEED_USERS, SEED_WORKSPACES, SEED_BOARDS, SEED_LISTS, SEED_TASKS, SEED_ACTIVITIES } from "./mock-data";
import { v4 as uuidv4 } from "uuid";

const STORE_KEY = "taskflow_store";

function getStore() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  const initial = {
    users: SEED_USERS,
    workspaces: SEED_WORKSPACES,
    boards: SEED_BOARDS,
    lists: SEED_LISTS,
    tasks: SEED_TASKS,
    activities: SEED_ACTIVITIES,
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(initial));
  return initial;
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function addActivity(store, { type, entity, entityId, board, user, details }) {
  const activity = {
    _id: uuidv4(),
    type, entity, entityId, board, user, details,
    createdAt: new Date().toISOString(),
  };
  store.activities.unshift(activity);
  return activity;
}

// --- Auth ---
export const mockAuth = {
  login(email, password) {
    const store = getStore();
    const user = store.users.find((u) => u.email === email && u.password === password);
    if (!user) return { error: "Invalid credentials" };
    const token = "mock_jwt_" + user._id;
    return { token, user: { ...user, password: undefined } };
  },
  signup(name, email, password) {
    const store = getStore();
    if (store.users.find((u) => u.email === email)) return { error: "Email already exists" };
    const user = { _id: uuidv4(), name, email, password, avatar: null, createdAt: new Date().toISOString() };
    store.users.push(user);
    saveStore(store);
    const token = "mock_jwt_" + user._id;
    return { token, user: { ...user, password: undefined } };
  },
  me(token) {
    const store = getStore();
    const userId = token?.replace("mock_jwt_", "");
    const user = store.users.find((u) => u._id === userId);
    if (!user) return { error: "Not authenticated" };
    return { user: { ...user, password: undefined } };
  },
};

// --- Workspaces ---
export const mockWorkspaces = {
  list(userId) {
    const store = getStore();
    return store.workspaces.filter((ws) => ws.members.includes(userId));
  },
  get(id) {
    const store = getStore();
    const ws = store.workspaces.find((w) => w._id === id);
    if (!ws) return null;
    const members = store.users.filter((u) => ws.members.includes(u._id)).map((u) => ({ ...u, password: undefined }));
    return { ...ws, membersData: members };
  },
  create(data, userId) {
    const store = getStore();
    const ws = { _id: uuidv4(), ...data, owner: userId, members: [userId], createdAt: new Date().toISOString() };
    store.workspaces.push(ws);
    saveStore(store);
    return ws;
  },
  update(id, data) {
    const store = getStore();
    const idx = store.workspaces.findIndex((w) => w._id === id);
    if (idx === -1) return null;
    store.workspaces[idx] = { ...store.workspaces[idx], ...data };
    saveStore(store);
    return store.workspaces[idx];
  },
  delete(id) {
    const store = getStore();
    store.workspaces = store.workspaces.filter((w) => w._id !== id);
    store.boards = store.boards.filter((b) => b.workspace !== id);
    saveStore(store);
    return true;
  },
  addMember(wsId, email) {
    const store = getStore();
    const user = store.users.find((u) => u.email === email);
    if (!user) return { error: "User not found" };
    const ws = store.workspaces.find((w) => w._id === wsId);
    if (!ws) return { error: "Workspace not found" };
    if (!ws.members.includes(user._id)) {
      ws.members.push(user._id);
      saveStore(store);
    }
    return { ...ws, membersData: store.users.filter((u) => ws.members.includes(u._id)).map((u) => ({ ...u, password: undefined })) };
  },
};

// --- Boards ---
export const mockBoards = {
  list(workspaceId) {
    const store = getStore();
    return store.boards.filter((b) => b.workspace === workspaceId);
  },
  get(id) {
    const store = getStore();
    const board = store.boards.find((b) => b._id === id);
    if (!board) return null;
    const lists = store.lists.filter((l) => l.board === id).sort((a, b) => a.position - b.position);
    const tasks = store.tasks.filter((t) => t.board === id);
    const members = store.users.filter((u) => board.members.includes(u._id)).map((u) => ({ ...u, password: undefined }));
    return { ...board, lists, tasks, membersData: members };
  },
  create(data) {
    const store = getStore();
    const board = { _id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    store.boards.push(board);
    saveStore(store);
    return board;
  },
  update(id, data) {
    const store = getStore();
    const idx = store.boards.findIndex((b) => b._id === id);
    if (idx === -1) return null;
    store.boards[idx] = { ...store.boards[idx], ...data };
    saveStore(store);
    return store.boards[idx];
  },
  delete(id) {
    const store = getStore();
    store.boards = store.boards.filter((b) => b._id !== id);
    store.lists = store.lists.filter((l) => l.board !== id);
    store.tasks = store.tasks.filter((t) => t.board !== id);
    saveStore(store);
    return true;
  },
};

// --- Lists ---
export const mockLists = {
  create(data) {
    const store = getStore();
    const maxPos = Math.max(-1, ...store.lists.filter((l) => l.board === data.board).map((l) => l.position));
    const list = { _id: uuidv4(), ...data, position: maxPos + 1, createdAt: new Date().toISOString() };
    store.lists.push(list);
    saveStore(store);
    return list;
  },
  update(id, data) {
    const store = getStore();
    const idx = store.lists.findIndex((l) => l._id === id);
    if (idx === -1) return null;
    store.lists[idx] = { ...store.lists[idx], ...data };
    saveStore(store);
    return store.lists[idx];
  },
  delete(id) {
    const store = getStore();
    store.tasks = store.tasks.filter((t) => t.list !== id);
    store.lists = store.lists.filter((l) => l._id !== id);
    saveStore(store);
    return true;
  },
  reorder(boardId, listOrder) {
    const store = getStore();
    listOrder.forEach((id, idx) => {
      const list = store.lists.find((l) => l._id === id);
      if (list) list.position = idx;
    });
    saveStore(store);
    return true;
  },
};

// --- Tasks ---
export const mockTasks = {
  create(data, userId) {
    const store = getStore();
    const maxPos = Math.max(-1, ...store.tasks.filter((t) => t.list === data.list).map((t) => t.position));
    const task = {
      _id: uuidv4(), ...data,
      position: maxPos + 1,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.tasks.push(task);
    addActivity(store, { type: "created", entity: "task", entityId: task._id, board: data.board, user: userId, details: { title: data.title } });
    saveStore(store);
    return task;
  },
  update(id, data, userId) {
    const store = getStore();
    const idx = store.tasks.findIndex((t) => t._id === id);
    if (idx === -1) return null;
    store.tasks[idx] = { ...store.tasks[idx], ...data, updatedAt: new Date().toISOString() };
    addActivity(store, { type: "updated", entity: "task", entityId: id, board: store.tasks[idx].board, user: userId, details: { title: store.tasks[idx].title, changes: data } });
    saveStore(store);
    return store.tasks[idx];
  },
  delete(id, userId) {
    const store = getStore();
    const task = store.tasks.find((t) => t._id === id);
    if (task) {
      addActivity(store, { type: "deleted", entity: "task", entityId: id, board: task.board, user: userId, details: { title: task.title } });
    }
    store.tasks = store.tasks.filter((t) => t._id !== id);
    saveStore(store);
    return true;
  },
  move(id, listId, position, userId) {
    const store = getStore();
    const task = store.tasks.find((t) => t._id === id);
    if (!task) return null;
    const fromList = store.lists.find((l) => l._id === task.list);
    const toList = store.lists.find((l) => l._id === listId);
    task.list = listId;
    task.position = position;
    task.updatedAt = new Date().toISOString();
    // Recalculate positions for target list
    const targetTasks = store.tasks.filter((t) => t.list === listId && t._id !== id).sort((a, b) => a.position - b.position);
    targetTasks.splice(position, 0, task);
    targetTasks.forEach((t, i) => { t.position = i; });
    addActivity(store, { type: "moved", entity: "task", entityId: id, board: task.board, user: userId, details: { title: task.title, from: fromList?.title, to: toList?.title } });
    saveStore(store);
    return task;
  },
  assign(id, assigneeId, userId) {
    const store = getStore();
    const task = store.tasks.find((t) => t._id === id);
    if (!task) return null;
    task.assignee = assigneeId;
    task.updatedAt = new Date().toISOString();
    const assignee = store.users.find((u) => u._id === assigneeId);
    addActivity(store, { type: "assigned", entity: "task", entityId: id, board: task.board, user: userId, details: { title: task.title, assigneeName: assignee?.name } });
    saveStore(store);
    return task;
  },
};

// --- Activities ---
export const mockActivities = {
  list(boardId, page = 1, limit = 20) {
    const store = getStore();
    const all = store.activities.filter((a) => a.board === boardId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = all.length;
    const start = (page - 1) * limit;
    return { activities: all.slice(start, start + limit), total, page };
  },
};

// --- Search ---
export const mockSearch = {
  search(query, workspaceId) {
    const store = getStore();
    const q = query.toLowerCase();
    const boardIds = store.boards.filter((b) => b.workspace === workspaceId).map((b) => b._id);
    const tasks = store.tasks.filter((t) => boardIds.includes(t.board) && (t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))));
    const boards = store.boards.filter((b) => b.workspace === workspaceId && b.title.toLowerCase().includes(q));
    return { tasks, boards };
  },
};
