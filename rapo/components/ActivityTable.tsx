'use client';

import { useState, useMemo } from 'react';
import { Activity, ActivityStatus } from '@/types';
import { StatusBadge, RiskBadge } from './StatusBadge';
import { useRopa } from '@/lib/ropaContext'

interface ActivityTableProps {
  activities: Activity[];
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

type SortKey = 'activityName' | 'department' | 'status' | 'riskLevel' | 'updatedAt';
type SortDir = 'asc' | 'desc';

// ... (Icons Code: SearchIcon, SortIcon, EditIcon, EyeIcon, TrashIcon, ChevronIcon คงเดิม)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SortIcon = ({ dir }: { dir?: 'asc' | 'desc' | null }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${dir === 'desc' ? 'rotate-180' : ''} ${dir ? 'text-blue-600' : 'text-slate-400'}`}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 5 5 12" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ChevronIcon = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

const statusOptions: (ActivityStatus | 'ALL')[] = ['ALL', 'ACTIVE', 'REVIEW', 'DRAFT', 'REJECTED', 'ARCHIVED'];
const PAGE_SIZE = 5;

export function ActivityTable({ activities, onEdit, onView, onDelete }: ActivityTableProps) {
  const { deleteActivity } = useRopa(); 

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...activities];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.activityName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') list = list.filter((a) => a.status === statusFilter);
    list.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [activities, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const colHeader = (label: string, key: SortKey) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
      onClick={() => handleSort(key)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <SortIcon dir={sortKey === key ? sortDir : null} />
      </span>
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Processing Activities</h2>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-full sm:w-52 transition-all duration-200"
            />
          </div>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as ActivityStatus | 'ALL'); setPage(1); }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer transition-all duration-200"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">ID</th>
              {colHeader('Activity Name', 'activityName')}
              {colHeader('Department', 'department')}
              {colHeader('Status', 'status')}
              {colHeader('Risk', 'riskLevel')}
              {colHeader('Updated', 'updatedAt')}
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                  No activities found
                </td>
              </tr>
            ) : (
              paginated.map((activity) => (
                <tr
                  key={activity.id}
                  className="hover:bg-slate-50/70 transition-colors duration-150 group"
                >
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-mono text-slate-400">{activity.id}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{activity.activityName}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{activity.purpose}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-600">{activity.department}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={activity.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <RiskBadge level={activity.riskLevel} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-500">{activity.updatedAt}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {deleteConfirm === activity.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500">Delete?</span>
                          <button
                            onClick={() => { 
                              deleteActivity(activity.id); // สั่งลบใน Context
                              onDelete?.(activity.id);     // สั่งลบผ่าน Props (ถ้ามี)
                              setDeleteConfirm(null);      // ปิดกล่องยืนยัน
                            }}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >Yes</button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300 transition-colors"
                          >No</button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onView?.(activity.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                            title="View"
                          >
                            <EyeIcon />
                          </button>
                          <button
                            onClick={() => onEdit?.(activity.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(activity.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination ... (โค้ดส่วนที่เหลือคงเดิม) */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 gap-3">
        <p className="text-xs text-slate-500">
          Showing{' '}
          <span className="font-medium text-slate-700">
            {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
          </span>{' '}
          of <span className="font-medium text-slate-700">{filtered.length}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronIcon dir="left" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronIcon dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}