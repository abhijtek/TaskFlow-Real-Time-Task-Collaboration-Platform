import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import KanbanBoard from "@/components/boards/kanban-board";
import CreateBoardDialog from "@/components/boards/create-board-dialog";
import DeleteBoardDialog from "@/components/boards/delete-board-dialog";
import { boardService } from "@/services/board-service";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { Plus, Trash2 } from "lucide-react";

export default function WorkspaceBoardPage() {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);

  useEffect(() => {
    async function fetchBoard() {
      try {
        setLoading(true);
        if (boardId) {
          const selectedBoard = await boardService.get(boardId);
          setBoard(selectedBoard || null);
        } else {
          // Fallback: redirect to first board in workspace
          const boards = await boardService.list(workspaceId);
          if (boards && boards.length > 0) {
            const firstBoard = await boardService.get(boards[0]._id);
            setBoard(firstBoard || boards[0]);
            navigate(`/workspaces/${workspaceId}/boards/${boards[0]._id}`, { replace: true });
          } else {
            setBoard(null);
          }
        }
      } catch (error) {
        console.error("Error fetching board:", error);
        setError(error?.message || "Failed to load board");
        setBoard(null);
      } finally {
        setLoading(false);
      }
    }

    if (workspaceId && user) {
      fetchBoard();
    }
  }, [workspaceId, boardId, user, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar workspaceId={workspaceId} />
          <main className="flex-1 overflow-auto flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">Loading workspace...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar workspaceId={workspaceId} />
        <main className="flex-1 overflow-auto">
          <div className="flex flex-col gap-3 px-4 py-3 border-b border-border sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate sm:text-2xl">
                {board?.title || "Workspace Board"}
              </h1>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                onClick={() => setDeleteBoardOpen(true)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs font-medium hover:bg-secondary transition-opacity inline-flex items-center gap-2 sm:text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setCreateBoardOpen(true)}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                New Board
              </button>
            </div>
          </div>

          {board ? (
            <KanbanBoard board={board} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <p className="text-muted-foreground">No boards found in this workspace</p>
              <button
                onClick={() => setCreateBoardOpen(true)}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Board
              </button>
            </div>
          )}
        </main>
      </div>
      <CreateBoardDialog
        open={createBoardOpen}
        onClose={() => setCreateBoardOpen(false)}
        workspaceId={workspaceId}
        onCreated={(newBoard) => {
          setBoard(newBoard);
          navigate(`/workspaces/${workspaceId}/boards/${newBoard._id}`);
        }}
      />
      {board && (
        <DeleteBoardDialog
          open={deleteBoardOpen}
          onClose={() => setDeleteBoardOpen(false)}
          board={board}
          workspaceId={workspaceId}
          onDeleted={() => navigate(`/workspaces/${workspaceId}`)}
        />
      )}
    </div>
  );
}
