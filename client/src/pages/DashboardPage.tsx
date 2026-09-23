import { useState, useEffect } from 'react';
import { api, type Workspace, type Project, type Issue } from '../api/client';
import { Navbar } from '../components/Navbar';
import { KanbanBoard } from '../components/KanbanBoard';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { CreateIssueModal } from '../components/CreateIssueModal';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';

const PRIORITIES = ['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;

export function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Modal Visibility States
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);

  // 1. Initial Load: Fetch Workspaces
  useEffect(() => {
    async function loadWorkspaces() {
      try {
        setLoading(true);
        const data = await api.workspaces.list();
        const wsList = data.workspace || [];
        setWorkspaces(wsList);
        if (wsList.length > 0) {
          setActiveWorkspace(wsList[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaces();
  }, []);

  // 2. When active workspace changes: Fetch its projects
  useEffect(() => {
    if (!activeWorkspace) return;

    async function loadProjects() {
      try {
        const data = await api.projects.listByWorkspace(activeWorkspace!.id);
        const projList = data.projests || [];
        setProjects(projList);
        if (projList.length > 0) {
          setActiveProject(projList[0]);
        } else {
          setActiveProject(null);
          setIssues([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load projects');
      }
    }
    loadProjects();
  }, [activeWorkspace]);

  // 3. When active project, search, or priority changes: Fetch issues
  useEffect(() => {
    if (!activeProject) return;

    async function loadIssues() {
      try {
        const filterParams: { q?: string; priority?: string } = {};
        if (searchQuery.trim()) filterParams.q = searchQuery.trim();
        if (selectedPriority !== 'ALL') filterParams.priority = selectedPriority;

        const data = await api.issues.listByProject(activeProject!.id, filterParams);
        setIssues(data.issues || []);
      } catch (err: any) {
        console.error('Failed to load issues', err);
      }
    }

    const timer = setTimeout(loadIssues, 150); // Debounce search
    return () => clearTimeout(timer);
  }, [activeProject, searchQuery, selectedPriority]);

  // Handle live status changes (Optimistic UI)
  const handleUpdateStatus = async (issueId: string, status: Issue['status']) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status } : i))
    );

    try {
      await api.issues.update(issueId, { status });
    } catch (err: any) {
      console.error('Failed to update issue status', err);
      if (activeProject) {
        const data = await api.issues.listByProject(activeProject.id);
        setIssues(data.issues || []);
      }
    }
  };

  // Handle issue deletion
  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    setIssues((prev) => prev.filter((i) => i.id !== issueId));

    try {
      await api.issues.delete(issueId);
    } catch (err: any) {
      console.error('Failed to delete issue', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navbar */}
      <Navbar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenCreateIssue={() => setIsCreateIssueOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Control Bar: Search & Priority Filter Pills */}
        {activeProject && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search issues by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Priority Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <span className="text-[11px] font-mono text-zinc-500 mr-2 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Priority:
              </span>
              {PRIORITIES.map((p) => {
                const isSelected = selectedPriority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPriority(p)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty States / Loading / Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3 text-zinc-500">
              <RefreshCw className="h-6 w-6 animate-spin text-violet-500" />
              <p className="text-xs">Loading board data...</p>
            </div>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Plus className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-100">No Workspaces Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Get started by creating your first team workspace to manage sprints and track tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateWorkspaceOpen(true)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition cursor-pointer"
            >
              + Create Workspace
            </button>
          </div>
        ) : !activeProject ? (
          <div className="flex flex-col items-center justify-center h-96 rounded-2xl border border-dashed border-zinc-800 p-8 text-center space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-100">No Projects in this Workspace</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Create a project (like 'Web Core' or 'API') to start adding issues.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateProjectOpen(true)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition cursor-pointer"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <KanbanBoard
            issues={issues}
            onUpdateStatus={handleUpdateStatus}
            onDeleteIssue={handleDeleteIssue}
          />
        )}

      </main>

      {/* Creation Modals */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onSuccess={(newWs) => {
          setWorkspaces((prev) => [newWs, ...prev]);
          setActiveWorkspace(newWs);
        }}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        workspaceId={activeWorkspace?.id || null}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={(newProj) => {
          setProjects((prev) => [...prev, newProj]);
          setActiveProject(newProj);
        }}
      />

      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        projectId={activeProject?.id || null}
        onClose={() => setIsCreateIssueOpen(false)}
        onSuccess={(newIssue) => {
          setIssues((prev) => [newIssue, ...prev]);
        }}
      />
    </div>
  );
}
