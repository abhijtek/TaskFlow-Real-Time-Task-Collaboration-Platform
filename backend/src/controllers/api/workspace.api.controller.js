// Remove a member from workspace (admin only)
export const removeWorkspaceMember = async (req, res) => {
  try {
    const { wsId, userId } = req.params;
    const workspace = await ensureWorkspaceMember(wsId, req.user._id);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    if (!isWorkspaceAdmin(workspace, req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    // Prevent removing self if only admin
    const adminCount = workspace.members.filter((m) => m.role === "admin").length;
    
    const member = workspace.members.find((m) => extractMemberUserId(m) === String(userId));
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    if (member.role === "admin" && adminCount === 1) {
      return res.status(400).json({ error: "Cannot remove the only admin" });
    }
    workspace.members = workspace.members.filter((m) => extractMemberUserId(m) !== String(userId));
    await workspace.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

// Change a member's role (admin only)
export const changeWorkspaceMemberRole = async (req, res) => {
  try {
    const { wsId, userId } = req.params;
    const { role } = req.body;
    if (!role || !["admin", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const workspace = await ensureWorkspaceMember(wsId, req.user._id);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    if (!isWorkspaceAdmin(workspace, req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const member = workspace.members.find((m) => extractMemberUserId(m) === String(userId));
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    member.role = role;
    await workspace.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
import { Workspace } from "../../models/workspace.models.js";
import { User } from "../../models/user.models.js";
import { Board } from "../../models/board.models.js";
import { List } from "../../models/list.models.js";
import { Task } from "../../models/task.models.js";
import { Activity } from "../../models/activity.models.js";
import { asObjectId, ensureWorkspaceMember, isValidObjectId, isWorkspaceAdmin } from "../../utils/api-helpers.js";
import { serializeUser } from "../../middlewares/api-auth.middleware.js";
const extractMemberUserId = (member) => String(member?.user?._id || member?.user || member || "");
const getWorkspaceMemberUserIds = (workspace) => {
  const ids = (workspace?.members || [])
    .map((member) => extractMemberUserId(member))
    .filter(Boolean);

  return [...new Set(ids)];
};

export const listWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ "members.user": req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(workspaces);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await ensureWorkspaceMember(id, req.user._id);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }


    // Ensure owner is always in members array
    const hasOwner = workspace.members.some((m) => extractMemberUserId(m) === String(workspace.owner));
    if (!hasOwner) {
      workspace.members.push({ user: workspace.owner, role: "admin" });
      await workspace.save();
    }

    const memberUserIds = getWorkspaceMemberUserIds(workspace);
    const membersData = await User.find({ _id: { $in: memberUserIds } }).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    return res.status(200).json({
      ...workspace.toObject(),
      membersData: membersData.map(serializeUser),
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const createWorkspace = async (req, res) => {
  try {
    const { name, description = "", color = "" } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const workspace = await Workspace.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    return res.status(201).json(workspace);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await ensureWorkspaceMember(id, req.user._id);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    if (!isWorkspaceAdmin(workspace, req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = {};
    ["name", "description", "color"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Workspace.findByIdAndUpdate(id, updates, { new: true });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await ensureWorkspaceMember(id, req.user._id);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    if (!isWorkspaceAdmin(workspace, req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const boards = await Board.find({ workspace: id }).select("_id");
    const boardIds = boards.map((board) => board._id);

    await Promise.all([
      Task.deleteMany({ board: { $in: boardIds } }),
      List.deleteMany({ board: { $in: boardIds } }),
      Activity.deleteMany({ board: { $in: boardIds } }),
      Board.deleteMany({ workspace: id }),
      Workspace.deleteOne({ _id: id }),
    ]);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const addWorkspaceMember = async (req, res) => {
  try {
    const { wsId } = req.params;
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const workspace = await ensureWorkspaceMember(wsId, req.user._id);
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    if (!isWorkspaceAdmin(workspace, req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyMember = workspace.members.some(
      (m) => extractMemberUserId(m) === String(userToAdd._id)
    );
    if (!alreadyMember) {
      workspace.members.push({ user: asObjectId(userToAdd._id), role: "member" });
      await workspace.save();
      await Board.updateMany(
        { workspace: workspace._id },
        { $addToSet: { members: { user: asObjectId(userToAdd._id), role: "member" } } },
      );
    }

    const memberUserIds = getWorkspaceMemberUserIds(workspace);
    const membersData = await User.find({ _id: { $in: memberUserIds } }).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    return res.status(200).json({
      ...workspace.toObject(),
      membersData: membersData.map(serializeUser),
    });
  } catch (error) {
    console.error("addWorkspaceMember error:", error);
    if (error.name === "BSONError" || !isValidObjectId(req.params.wsId)) {
      return res.status(400).json({ error: "Invalid workspace id" });
    }
    return res.status(500).json({ error: error.message || "Server error" });
  }
};



