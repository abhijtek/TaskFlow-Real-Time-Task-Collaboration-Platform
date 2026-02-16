import { useWorkspaces } from "@/context/workspace-context";
import { useEffect, useState } from "react";
import LoadingSpinner from "../shared/loading-spinner.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, ChevronRight, Layers, Users, UserPlus, X } from "lucide-react";
import { boardService } from "@/services/board-service";
import { Link } from "react-router-dom";
import { getSocket, joinWorkspace, leaveWorkspace } from "@/lib/socket-client.jsx";

export default function Sidebar() {
  const { workspaces, currentWorkspace, fetchWorkspaces, fetchWorkspace, addMember, loading } = useWorkspaces();
  const params = useParams();
  const navigate = useNavigate();
  const workspaceId = params.workspaceId;
  const [boards, setBoards] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const syncCollapsedWithScreen = () => {
      setCollapsed(media.matches);
    };

    syncCollapsedWithScreen();
    media.addEventListener("change", syncCollapsedWithScreen);
    return () => media.removeEventListener("change", syncCollapsedWithScreen);
  }, []);

  useEffect(()=>{
       if(!workspaceId){
        console.log("workspaceId not found");
        return ;
       }
       const socket = getSocket();
       if(!socket){
        console.log("socket could not be fetched");
        return ;
       }
       const joinCurrentWorkspace = ()=>{
         joinWorkspace(workspaceId);
       };

       const handleBoardCreated = (board)=>{
        if (String(board.workspace) !== String(workspaceId)) return;
        setBoards((prev)=>
          prev.some((b)=> b._id === board._id) ? prev: [...prev,board]
        );
       };

       socket.on("connect",joinCurrentWorkspace);
       socket.on("board-created",handleBoardCreated);

       if(socket.connected)joinCurrentWorkspace();
       return ()=>{
        leaveWorkspace(workspaceId);
        socket.off("connect",joinCurrentWorkspace);
        socket.off("board-created",handleBoardCreated);
       }
  },[workspaceId]);
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Fetch latest workspace when opening members dialog
  useEffect(() => {
    if (membersOpen && workspaceId) {
      setMembersLoading(true);
      fetchWorkspace(workspaceId).finally(() => setMembersLoading(false));
    }
  }, [membersOpen, workspaceId, fetchWorkspace]);

  useEffect(() => {
    if (workspaceId) {
      boardService.list(workspaceId).then(setBoards).catch(() => setBoards([]));
      fetchWorkspace(workspaceId);
    }
  }, [workspaceId, params?.boardId, fetchWorkspace]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !workspaceId) return;
    setInviteError("");
    try {
      const res = await addMember(workspaceId, inviteEmail.trim());
      if (res?.error) {
        setInviteError(res.error);
      } else {
        setInviteEmail("");
        setInviteOpen(false);
        fetchWorkspace(workspaceId);
      }
    } catch (error) {
      setInviteError(error?.error || error?.message || "Unable to invite user");
    }
  };

  return (
    <aside className={`shrink-0 border-r border-border bg-sidebar transition-all duration-200 ${collapsed ? "w-14" : "w-52 sm:w-60"} flex flex-col`}>
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-bold text-sidebar-foreground truncate">Workspaces</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-sidebar-accent transition-colors"
        >
          <ChevronRight className={`w-4 h-4 text-sidebar-foreground transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {workspaces.map((ws) => {
          const isActive = ws._id === workspaceId;
          return (
            <div key={ws._id}>
              <button
                onClick={() => navigate(`/workspaces/${ws._id}`)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
                title={ws.name}
              >
                <div
                  className="w-5 h-5 rounded shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: ws.color + "30" }}
                >
                  <Layers className="w-3 h-3" style={{ color: ws.color }} />
                </div>
                {!collapsed && <span className="truncate">{ws.name}</span>}
              </button>

              {isActive && !collapsed && boards.length > 0 && (
                <div className="ml-6 border-l border-sidebar-border">
                  {boards.map((b) => {
                    const isBoardActive = params?.boardId === b._id;
                    return (
                      <Link
                        key={b._id}
                        to={`/workspaces/${ws._id}/boards/${b._id}`}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${isBoardActive ? "text-sidebar-accent-foreground bg-sidebar-accent/80" : "text-sidebar-foreground hover:text-sidebar-primary dark:hover:text-sidebar-foreground dark:hover:bg-sidebar-accent/40"}`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: b.color || "#d4a853" }}
                        />
                        <LayoutDashboard className="w-3 h-3" />
                        <span className="truncate">{b.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!collapsed && workspaceId && (
        <div className="p-3 border-t border-sidebar-border">
          {currentWorkspace && (
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setMembersOpen(!membersOpen)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Users className="w-3 h-3" />
                  {currentWorkspace.members?.length || 0} members
                </button>
                <button
                  onClick={() => setInviteOpen(!inviteOpen)}
                  className="h-6 px-2 rounded-md border border-border bg-background text-xs text-foreground hover:bg-secondary transition-colors inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  Invite
                </button>
              </div>
            </div>
          )}
          {membersOpen && (
            membersLoading ? (
              <div className="flex justify-center items-center py-4"><LoadingSpinner size={20} /></div>
            ) : currentWorkspace?.membersData?.length > 0 ? (
              <div className="mb-2 max-h-40 overflow-auto rounded-md border border-border bg-background/50">
                {currentWorkspace.membersData.map((member) => (
                  <div key={member._id} className="px-2 py-1.5 border-b border-border/60 last:border-b-0">
                    <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground py-2">No members found.</div>
            )
          )}
          {inviteOpen && (
            <form onSubmit={handleInvite} className="flex flex-col gap-1.5 mt-1">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
              <div className="flex items-center gap-1">
                <button type="submit" className="flex-1 h-6 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
                  Send
                </button>
                <button type="button" onClick={() => setInviteOpen(false)} className="h-6 px-2 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </aside>
  );
}
