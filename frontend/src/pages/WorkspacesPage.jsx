import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useWorkspaces } from "@/context/workspace-context";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import CreateWorkspaceDialog from "@/components/workspaces/create-workspace-dialog";
import EditWorkspaceDialog from "@/components/workspaces/edit-workspace-dialog";
import WorkspaceCard from "@/components/workspaces/workspace-card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { boardService } from "@/services/board-service";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const { workspaces, loading, fetchWorkspaces } = useWorkspaces();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [boardCounts, setBoardCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    // Fetch board counts for each workspace
    const fetchBoardCounts = async () => {
      const counts = {};
      for (const ws of workspaces) {
        try {
          const boards = await boardService.list(ws._id);
          counts[ws._id] = boards?.length || 0;
        } catch {
          counts[ws._id] = 0;
        }
      }
      setBoardCounts(counts);
    };
    if (workspaces.length > 0) {
      fetchBoardCounts();
    }
  }, [workspaces]);

  const handleEdit = (workspace) => {
    setSelectedWorkspace(workspace);
    setEditOpen(true);
  };

  const handleDelete = (workspace) => {
    setSelectedWorkspace(workspace);
    setEditOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <div className="mb-8">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Workspaces</h1>
                  <p className="text-muted-foreground">Access your workspaces and collaborate with your team</p>
                </div>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Workspace
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading workspaces...</p>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <h3 className="text-lg font-semibold text-foreground">No workspaces yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first workspace to start collaborating.
                </p>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="mt-4 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {workspaces.map((ws, index) => (
                  <WorkspaceCard
                    key={ws._id}
                    workspace={ws}
                    boardCount={boardCounts[ws._id] || 0}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateWorkspaceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {selectedWorkspace && (
        <EditWorkspaceDialog 
          open={editOpen} 
          onClose={() => {
            setEditOpen(false);
            setSelectedWorkspace(null);
          }} 
          workspace={selectedWorkspace}
        />
      )}
    </div>
  );
}
