import type { Issue } from '../api/client';
import { Calendar, Trash2, ArrowRight } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onUpdateStatus: (issueId: string, status: Issue['status']) => void;
  onDelete: (issueId: string) => void;
}

const PRIORITY_STYLES = {
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
  HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  LOW: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

const STATUS_OPTIONS: { id: Issue['status']; label: string }[] = [
  { id: 'BACKLOG', label: 'Backlog' },
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
];

export function IssueCard({ issue, onUpdateStatus, onDelete }: IssueCardProps) {
  const priorityClass = PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.MEDIUM;

  const formattedDate = issue.due_date
    ? new Date(issue.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="group relative rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-sm hover:border-zinc-700 hover:bg-zinc-900/90 transition">
      {/* Top Header: Priority Badge & Delete Action */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityClass}`}>
          {issue.priority}
        </span>

        <button
          type="button"
          onClick={() => onDelete(issue.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
          title="Delete Issue"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-zinc-100 leading-snug mb-1.5">
        {issue.title}
      </h4>

      {/* Description */}
      {issue.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
          {issue.description}
        </p>
      )}

      {/* Card Footer: Status Selector & Due Date */}
      <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs">
        {/* Due Date */}
        {formattedDate ? (
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            <span>{formattedDate}</span>
          </div>
        ) : (
          <div />
        )}

        {/* Move Status Dropdown */}
        <div className="flex items-center gap-1">
          <ArrowRight className="h-3 w-3 text-zinc-500" />
          <select
            value={issue.status}
            onChange={(e) => onUpdateStatus(issue.id, e.target.value as Issue['status'])}
            className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[11px] text-zinc-300 hover:border-zinc-700 focus:border-violet-500 focus:outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
