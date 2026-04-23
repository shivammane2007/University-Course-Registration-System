'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';

const fetchSchedule = () => api.get('/faculty/schedule').then((r) => r.data.data);

export default function FacultySchedulePage() {
  const { data: schedule = [], isLoading } = useQuery({ queryKey: ['faculty-schedule'], queryFn: fetchSchedule });

  if (isLoading) return (
    <div className="pt-6">
      <div className="skeleton h-8 w-32 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card skeleton h-20" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <PageHeader title="My Schedule" subtitle="Assigned course timings" />

      {schedule.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          <p className="text-2xl mb-2">📅</p>
          <p>No schedule found. Courses will appear here once assigned.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedule.map((item, i) => (
            <div key={i} className="card flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-50 rounded-btn flex items-center justify-center flex-shrink-0">
                <span className="text-faculty-accent font-bold text-sm">#{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary">{item.course_name}</p>
                <p className="text-sm text-muted">{item.dept_name}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium text-primary">{item.timing}</p>
                <p className="text-muted">{item.platform || item.college_name || '—'}</p>
              </div>
              <Badge status={item.mode} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
