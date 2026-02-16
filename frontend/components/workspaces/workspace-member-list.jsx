import { useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useWorkspaces } from "@/context/workspace-context";

const resolveMemberId = (member) => String(member?._id || member?.id || member?.user?._id || member?.user?.id || member?.user || member || "");

export default function WorkspaceMemberList({ workspace, onWorkspaceUpdated }) {
  const { user } = useAuth();
  const { removeMember, changeMemberRole, fetchWorkspace } = useWorkspaces();
  const [loading, setLoading] = useState("");

  const currentUserId = String(user?._id || "");
  const isOwner = String(workspace?.owner?._id || workspace?.owner || "") === currentUserId;
  const isAdmin = isOwner || (workspace?.members || []).some((member) => {
    const role = String(member?.role || "").toLowerCase();
    return resolveMemberId(member) === currentUserId && role === "admin";
  });

  const roleById = useMemo(() => {
    const map = new Map();
    (workspace?.members || []).forEach((member) => {
      const id = resolveMemberId(member);
      if (!id) return;
      map.set(id, member?.role || "member");
    });
    return map;
  }, [workspace?.members]);

  const members = useMemo(() => {
    const membersData = workspace?.membersData || [];

    if (membersData.length > 0) {
      const seen = new Set();
      return membersData
        .map((member) => {
          const id = String(member?._id || "");
          if (!id || seen.has(id)) return null;
          seen.add(id);
          return {
            _id: id,
            role: roleById.get(id) || "member",
            name: member?.name || "Unknown user",
            email: member?.email || "",
          };
        })
        .filter(Boolean);
    }

    return (workspace?.members || []).map((member) => {
      const id = resolveMemberId(member);
      return {
        _id: id,
        role: member?.role || "member",
        name: member?.user?.name || "Unknown user",
        email: member?.user?.email || "",
      };
    });
  }, [workspace?.members, workspace?.membersData, roleById]);

  const refreshWorkspace = async () => {
    if (!workspace?._id) return;
    const latest = await fetchWorkspace(workspace._id);
    if (latest) onWorkspaceUpdated?.(latest);
  };

  const handleRemove = async (memberId) => {
    setLoading(`${memberId}-remove`);
    try {
      await removeMember(workspace._id, memberId);
      await refreshWorkspace();
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setLoading("");
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setLoading(`${memberId}-role`);
    try {
      await changeMemberRole(workspace._id, memberId, newRole);
      await refreshWorkspace();
    } catch (error) {
      console.error("Failed to change role:", error);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-foreground mb-2">Members</h3>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {members.map((member) => {
          const canManage = isAdmin && currentUserId !== member._id;

          return (
            <li key={member._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{member.name}</div>
                <div className="text-xs text-muted-foreground truncate">{member.email || "No email"}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="text-xs px-2 py-1 rounded bg-secondary text-foreground capitalize">
                  {member.role}
                </span>

                {canManage && (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      disabled={loading === `${member._id}-role`}
                      className="h-8 w-full sm:w-auto min-w-[110px] rounded border border-input bg-background text-foreground text-xs px-2"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member._id)}
                      disabled={loading === `${member._id}-remove`}
                      className="h-8 px-2 rounded border border-destructive/40 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
