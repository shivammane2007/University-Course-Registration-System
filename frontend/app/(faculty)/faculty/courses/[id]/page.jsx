'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/axios';
import Badge from '@/components/shared/Badge';

const fetchStudents = (id) => api.get(`/faculty/courses/${id}/students`).then((r) => r.data.data);

export default function CourseDetailPage() {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const { data: enrolments = [], isLoading } = useQuery({ queryKey: ['faculty-course-students', id], queryFn: () => fetchStudents(id) });

  const filtered = enrolments.filter((e) => {
    const s = e.student;
    const q = search.toLowerCase();
    return !q || s?.first_name?.toLowerCase().includes(q) || s?.last_name?.toLowerCase().includes(q) || s?.user_id?.toLowerCase().includes(q);
  });

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/faculty/courses" className="btn-ghost btn-icon">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">Course Students</h1>
          <p className="text-sm text-muted">Enrolled students for this course</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-primary">{enrolments.length} total enrolments</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 w-56" placeholder="Search students..." id="student-search" />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>PRN No</th><th>Full Name</th><th>Year Enrolled</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4].map((j) => <td key={j}><div className="skeleton h-4 w-3/4 rounded" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-muted">No students found</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.enrolment_id}>
                  <td className="font-mono text-sm">{e.student?.user_id}</td>
                  <td className="font-medium">{e.student?.first_name} {e.student?.last_name}</td>
                  <td>{e.student?.year_enrolled}</td>
                  <td><Badge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
