import type { Issue } from '../api/client';
import { IssueCard } from './IssueCard';
import { Layers } from 'lucide-react';

interface KanbanBoardProps {
  issues: Issue[];
  onUpdateStatus: (issueId: string, status: Issue['status']) => void;
  onDeleteIssue: (issueId: string) => void;
}

const COLUMNS: { id: Issue['status']; title: string; dotColor: string }[] = [
  { id: 'BACKLOG', title: 'Backlog', dotColor: 'bg-zinc-500' },
  { id: 'TODO', title: 'To Do', dotColor: 'bg-blue-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', dotColor: 'bg-amber-400' },
  { id: 'DONE', title: 'Done', dotColor: 'bg-emerald-400' },
];

export function KanbanBoard({ issues, onUpdateStatus, onDeleteIssue }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {COLUMNS.map((col) => {
        const columnIssues = issues.filter((i) => i.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 min-h-[600px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                <h3 className="text-sm font-semibold text-zinc-200">
                  {col.title}
                </h3>
              </div>

              <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs font-mono font-medium text-zinc-400">
                {columnIssues.length}
              </span>
            </div>

            {/* Column Card List */}
            <div className="flex-1 space-y-3">
              {columnIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 rounded-xl border border-dashed border-zinc-800 text-center p-4">
                  <Layers className="h-5 w-5 text-zinc-600 mb-1" />
                  <p className="text-xs text-zinc-500">No issues here</p>
                </div>
              ) : (
                columnIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onUpdateStatus={onUpdateStatus}
                    onDelete={onDeleteIssue}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
