import { v4 as uuidv4 } from "uuid";

const USER_1 = uuidv4();
const USER_2 = uuidv4();
const USER_3 = uuidv4();
const WS_1 = uuidv4();
const WS_2 = uuidv4();
const BOARD_1 = uuidv4();
const BOARD_2 = uuidv4();
const BOARD_3 = uuidv4();
const LIST_1 = uuidv4();
const LIST_2 = uuidv4();
const LIST_3 = uuidv4();
const LIST_4 = uuidv4();

export const SEED_USERS = [
  { _id: USER_1, name: "Demo User", email: "demo@hintro.com", password: "demo123", avatar: null, createdAt: new Date().toISOString() },
  { _id: USER_2, name: "Admin User", email: "admin@hintro.com", password: "admin123", avatar: null, createdAt: new Date().toISOString() },
  { _id: USER_3, name: "Jane Cooper", email: "jane@hintro.com", password: "jane123", avatar: null, createdAt: new Date().toISOString() },
];

export const SEED_WORKSPACES = [
  { _id: WS_1, name: "Product Team", description: "Main product development workspace", color: "#d4a853", owner: USER_1, members: [USER_1, USER_2, USER_3], createdAt: new Date().toISOString() },
  { _id: WS_2, name: "Marketing", description: "Marketing campaigns and content planning", color: "#6b8e6b", owner: USER_2, members: [USER_1, USER_2], createdAt: new Date().toISOString() },
];

export const SEED_BOARDS = [
  { _id: BOARD_1, title: "Sprint 24", workspace: WS_1, color: "#d4a853", members: [USER_1, USER_2, USER_3], createdAt: new Date().toISOString() },
  { _id: BOARD_2, title: "Bug Tracker", workspace: WS_1, color: "#c0392b", members: [USER_1, USER_2], createdAt: new Date().toISOString() },
  { _id: BOARD_3, title: "Q1 Campaigns", workspace: WS_2, color: "#6b8e6b", members: [USER_1, USER_2], createdAt: new Date().toISOString() },
];

export const SEED_LISTS = [
  { _id: LIST_1, title: "To Do", board: BOARD_1, position: 0, createdAt: new Date().toISOString() },
  { _id: LIST_2, title: "In Progress", board: BOARD_1, position: 1, createdAt: new Date().toISOString() },
  { _id: LIST_3, title: "In Review", board: BOARD_1, position: 2, createdAt: new Date().toISOString() },
  { _id: LIST_4, title: "Done", board: BOARD_1, position: 3, createdAt: new Date().toISOString() },
];

export const SEED_TASKS = [
  { _id: uuidv4(), title: "Design new dashboard layout", description: "Create wireframes and mockups for the updated dashboard", list: LIST_1, board: BOARD_1, position: 0, assignee: USER_1, priority: "high", dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), createdBy: USER_1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: uuidv4(), title: "Implement user authentication", description: "Set up JWT-based auth with login and signup flows", list: LIST_1, board: BOARD_1, position: 1, assignee: USER_2, priority: "urgent", dueDate: new Date(Date.now() + 1 * 86400000).toISOString(), createdBy: USER_1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: uuidv4(), title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", list: LIST_2, board: BOARD_1, position: 0, assignee: USER_3, priority: "medium", dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), createdBy: USER_2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: uuidv4(), title: "Write API documentation", description: "Document all REST endpoints using Swagger/OpenAPI", list: LIST_2, board: BOARD_1, position: 1, assignee: USER_1, priority: "low", dueDate: null, createdBy: USER_1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: uuidv4(), title: "Review PR #142", description: "Code review for the new notification system", list: LIST_3, board: BOARD_1, position: 0, assignee: USER_2, priority: "medium", dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), createdBy: USER_3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { _id: uuidv4(), title: "Deploy v2.1 to staging", description: "Push latest changes to staging environment for QA", list: LIST_4, board: BOARD_1, position: 0, assignee: USER_1, priority: "high", dueDate: null, createdBy: USER_1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const SEED_ACTIVITIES = [
  { _id: uuidv4(), type: "created", entity: "board", entityId: BOARD_1, board: BOARD_1, user: USER_1, details: { title: "Sprint 24" }, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: uuidv4(), type: "created", entity: "task", entityId: SEED_TASKS[0]?._id, board: BOARD_1, user: USER_1, details: { title: "Design new dashboard layout" }, createdAt: new Date(Date.now() - 43200000).toISOString() },
  { _id: uuidv4(), type: "moved", entity: "task", entityId: SEED_TASKS[4]?._id, board: BOARD_1, user: USER_2, details: { title: "Review PR #142", from: "In Progress", to: "In Review" }, createdAt: new Date(Date.now() - 3600000).toISOString() },
];
