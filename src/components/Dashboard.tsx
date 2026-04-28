import { useMemo } from 'react';
import { Users, Building2, Layers, CalendarOff } from 'lucide-react';
import { FACULTY_DATA } from '../data/faculty';
import { getEffectiveStatus } from '../utils/statusUtils';
import { STATUS_CONFIG } from '../utils/statusUtils';
import { REMARK_LABELS, REMARK_CLASSES } from '../utils/remarkClassifier';
import { FLOORS_ORDERED, FLOOR_LABELS, BLOCKS_BY_FLOOR } from '../utils/floorUtils';
import type { FacultyStatus, RemarkType, StatusOverrides } from '../types';

interface Props {
  overrides: StatusOverrides;
  overrideCount: number;
  onClearAll: () => void;
  isAdmin?: boolean;
}

const ALL_STATUSES: FacultyStatus[] = ['available', 'in_class', 'away', 'on_leave'];

const NOTABLE_REMARKS: RemarkType[] = [
  'medical_leave', 'maternity_leave', 'on_leave', 'shifted', 'sharing', 'entrepreneurship',
];

export function Dashboard({ overrides, overrideCount, onClearAll, isAdmin }: Props) {
  const stats = useMemo(() => {
    const byStatus: Record<FacultyStatus, number> = {
      available: 0, in_class: 0, away: 0, on_leave: 0,
    };
    const byFloor: Record<string, number> = {};
    const byRemark: Partial<Record<RemarkType, number>> = {};

    FACULTY_DATA.forEach(f => {
      // Status
      byStatus[getEffectiveStatus(f, overrides)]++;
      // Floor
      byFloor[f.floor] = (byFloor[f.floor] ?? 0) + 1;
      // Remark
      if (f.remarkType !== 'none') {
        byRemark[f.remarkType] = (byRemark[f.remarkType] ?? 0) + 1;
      }
    });

    return { byStatus, byFloor, byRemark };
  }, [overrides]);

  const total = FACULTY_DATA.length;
  const blockCount = Object.values(BLOCKS_BY_FLOOR).flat().length;
  const onLeave = stats.byStatus.on_leave;

  return (
    <div className="space-y-6">
      {/* Header stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Faculty"
          value={total}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={<Layers className="w-5 h-5" />}
          label="Active Floors"
          value={FLOORS_ORDERED.length}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={<Building2 className="w-5 h-5" />}
          label="Total Blocks"
          value={blockCount}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
        <StatCard
          icon={<CalendarOff className="w-5 h-5" />}
          label="On Leave"
          value={onLeave}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Status Overview</h2>
          {overrideCount > 0 && isAdmin && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Reset {overrideCount} override{overrideCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {ALL_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = stats.byStatus[s];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={s}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                    <span className="text-slate-600 font-medium">{cfg.label}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {count} <span className="text-slate-400 font-normal text-xs">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      s === 'available' ? 'bg-green-400' :
                      s === 'in_class'  ? 'bg-blue-400'  :
                      s === 'away'      ? 'bg-amber-400' :
                                          'bg-red-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Floor breakdown + Remark breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Floor breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Faculty by Floor</h2>
          <div className="space-y-2">
            {FLOORS_ORDERED.map(floor => {
              const count = stats.byFloor[floor] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={floor} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-16 flex-shrink-0">
                    {FLOOR_LABELS[floor]}
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remark breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Special Remarks</h2>
          {NOTABLE_REMARKS.filter(r => (stats.byRemark[r] ?? 0) > 0).length === 0 ? (
            <p className="text-sm text-slate-400">No special remarks found.</p>
          ) : (
            <div className="space-y-2">
              {NOTABLE_REMARKS.map(r => {
                const count = stats.byRemark[r] ?? 0;
                if (count === 0) return null;
                return (
                  <div key={r} className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${REMARK_CLASSES[r]}`}>
                      {REMARK_LABELS[r]}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Institution info */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">Institution</p>
        <h3 className="font-bold text-lg leading-tight">MIT School of Computing</h3>
        <p className="text-sm text-indigo-200 mt-1">MIT Art, Design & Technology University</p>
        <div className="mt-3 flex gap-4 text-sm text-indigo-200">
          <span>{total} Faculty</span>
          <span>·</span>
          <span>{FLOORS_ORDERED.length} Floors</span>
          <span>·</span>
          <span>{blockCount} Blocks</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, iconBg, iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${iconBg} ${iconColor} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
