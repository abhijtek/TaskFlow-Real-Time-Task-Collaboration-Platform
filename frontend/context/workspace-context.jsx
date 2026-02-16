import { createContext, useContext, useState, useCallback } from "react";
import { workspaceService } from "@/services/workspace-service";
import { useAuth } from "@/context/auth-context";

const WorkspaceContext = createContext(undefined);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const removeMember = useCallback(async (wsId, userId) => {
    return workspaceService.removeMember(wsId, userId);
  }, []);

  const changeMemberRole = useCallback(async (wsId, userId, role) => {
    return workspaceService.changeMemberRole(wsId, userId, role);
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await workspaceService.list(user._id);
      setWorkspaces(data || []);
    } catch {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchWorkspace = useCallback(async (id) => {
    try {
      const data = await workspaceService.get(id);
      setCurrentWorkspace(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const createWorkspace = useCallback(async (data) => {
    if (!user) return;
    const ws = await workspaceService.create(data, user._id);
    setWorkspaces((prev) => [...prev, ws]);
    return ws;
  }, [user]);

  const updateWorkspace = useCallback(async (id, data) => {
    const ws = await workspaceService.update(id, data);
    setWorkspaces((prev) => prev.map((w) => (w._id === id ? { ...w, ...ws } : w)));
    if (currentWorkspace?._id === id) setCurrentWorkspace((prev) => ({ ...prev, ...ws }));
    return ws;
  }, [currentWorkspace]);

  const removeWorkspace = useCallback(async (id) => {
    await workspaceService.remove(id);
    setWorkspaces((prev) => prev.filter((w) => w._id !== id));
    if (currentWorkspace?._id === id) setCurrentWorkspace(null);
  }, [currentWorkspace]);

  const addMember = useCallback(async (wsId, email) => {
    return workspaceService.addMember(wsId, email);
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      workspaces, currentWorkspace, loading,
      fetchWorkspaces, fetchWorkspace, createWorkspace, updateWorkspace, removeWorkspace, addMember,
      removeMember, changeMemberRole,
      setCurrentWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaces() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspaces must be used within WorkspaceProvider");
  return ctx;
}
