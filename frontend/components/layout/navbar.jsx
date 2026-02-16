import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ChevronDown, User } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/shared/theme-toggle";
import SearchBar from "@/components/shared/search-bar";
import { getInitials, hashColor } from "@/components/shared/avatar-group";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ workspaceId }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Link to="/workspaces" className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <span className="text-base font-semibold text-foreground hidden sm:inline">TaskFlow</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {workspaceId && (
          <div className="hidden sm:block">
            <SearchBar workspaceId={workspaceId} />
          </div>
        )}
        <ThemeToggle />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: hashColor(user?.name), color: "#fff" }}
            >
              {getInitials(user?.name)}
            </div>
            <span className="hidden md:inline text-sm text-foreground">{user?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-popover shadow-lg z-50"
              >
                <div className="p-2">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/workspaces"); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary transition-colors text-foreground"
                  >
                    <User className="w-3.5 h-3.5" />
                    Workspaces
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-secondary transition-colors text-destructive"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
