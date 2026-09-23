import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Workspace, Project } from '../api/client';
import { 
  Building2, 
  Plus, 
  LogOut, 
  ChevronDown, 
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (workspace: Workspace) => void;
  onOpenCreateWorkspace: () => void;

  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onOpenCreateProject: () => void;

  onOpenCreateIssue: () => void;
}

export function Navbar({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onOpenCreateWorkspace,
  projects,
  activeProject,
  onSelectProject,
  onOpenCreateProject,
  onOpenCreateIssue,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Brand & Workspace Switcher */}
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              onBoard
            </span>
          </div>

          <div className="h-5 w-px bg-zinc-800" />

          {/* Workspace Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/60 transition cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-violet-400" />
              <span className="max-w-[140px] truncate">
                {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            {/* Dropdown Menu */}
            {isWsDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl z-50">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setIsWsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer ${
                      activeWorkspace?.id === ws.id
                        ? 'bg-violet-600/20 text-violet-300 font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{ws.slug}</span>
                  </button>
                ))}
                
                <div className="my-1 border-t border-zinc-800" />
                
                <button
                  type="button"
                  onClick={() => {
                    setIsWsDropdownOpen(false);
                    onOpenCreateWorkspace();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-violet-400 hover:bg-violet-600/10 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </div>

          {/* Project Navigation Tabs */}
          {activeWorkspace && (
            <nav className="hidden md:flex items-center gap-1.5">
              {projects.map((p) => {
                const isActive = activeProject?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectProject(p)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-violet-400 font-semibold">
                      [{p.key}]
                    </span>
                    <span>{p.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onOpenCreateProject}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition cursor-pointer"
                title="Create Project"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Project</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Section: Action Buttons & User Menu */}
        <div className="flex items-center gap-3">
          {/* New Issue Button */}
          {activeProject && (
            <button
              type="button"
              onClick={onOpenCreateIssue}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Issue</span>
            </button>
          )}

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-300">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-zinc-300">
                {user?.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
