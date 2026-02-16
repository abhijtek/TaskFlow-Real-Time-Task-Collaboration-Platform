import { useState, useRef, useEffect } from "react";
import { Search, X, LayoutDashboard, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchService } from "@/services/search-service";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ workspaceId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    if (!workspaceId) return;
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchService.search(value.trim(), workspaceId);
        setResults(data);
        setOpen(true);
      } catch {
        setResults(null);
      }
    }, 300);
  };

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks & boards..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results && setOpen(true)}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 left-0 right-0 rounded-lg border border-border bg-popover shadow-lg z-50 max-h-72 overflow-auto"
          >
            {(!results.tasks?.length && !results.boards?.length) ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No results found</p>
            ) : (
              <div className="py-1">
                {results.boards?.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Boards</p>
                    {results.boards.map((b) => (
                      <button
                        key={b._id}
                        onClick={() => {
                          setOpen(false);
                          navigate(`/workspaces/${b.workspace}/boards/${b._id}`);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                        {b.title}
                      </button>
                    ))}
                  </div>
                )}
                {results.tasks?.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tasks</p>
                    {results.tasks.slice(0, 8).map((t) => (
                      <button
                        key={t._id}
                        onClick={() => {
                          setOpen(false);
                          navigate(`/workspaces/${workspaceId}/boards/${t.board}`);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="truncate">{t.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
