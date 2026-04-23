'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Pencil, Users, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/axios';
import Badge from '@/components/shared/Badge';
import PageHeader from '@/components/shared/PageHeader';

const fetchCourses = () => api.get('/faculty/courses').then((r) => r.data.data);

export default function FacultyCoursesPage() {
  const qc = useQueryClient();
  const { data: courses = [], isLoading } = useQuery({ queryKey: ['faculty-courses'], queryFn: fetchCourses });
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/faculty/courses/${id}`, data),
    onSuccess: () => { toast.success('Course updated'); qc.invalidateQueries({ queryKey: ['faculty-courses'] }); setEditingId(null); },
    onError: () => toast.error('Failed to update'),
  });

  const startEdit = (c) => {
    reset({ course_name: c.course_name, timing: c.timing, duration: c.duration });
    setEditingId(c.course_id);
  };

  if (isLoading) return (
    <div className="pt-6">
      <div className="skeleton h-8 w-40 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card skeleton h-40" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <PageHeader title="My Courses" subtitle={`${courses.length} assigned courses`} />

      {courses.length === 0 ? (
        <div className="card text-center py-12 text-muted">
          <p className="text-2xl mb-2">📚</p>
          <p>No courses assigned yet. Contact the administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c.course_id} className="card">
              {editingId === c.course_id ? (
                <div className="space-y-3">
                  <div>
                    <label className="form-label">Course Name</label>
                    <input {...register('course_name')} className="form-input" id="edit-course-name" />
                  </div>
                  <div>
                    <label className="form-label">Timing</label>
                    <input {...register('timing')} className="form-input" id="edit-timing" />
                  </div>
                  <div>
                    <label className="form-label">Duration</label>
                    <input {...register('duration')} className="form-input" id="edit-duration" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSubmit((d) => updateMut.mutate({ id: c.course_id, data: d }))}
                      disabled={updateMut.isPending} className="btn-primary btn-sm flex-1">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary btn-sm">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{c.course_name}</h3>
                      <p className="text-xs text-muted mt-0.5">{c.department?.dept_name}</p>
                    </div>
                    <Badge status={c.mode} />
                  </div>
                  <div className="space-y-1 text-sm text-muted mb-4">
                    <p>⏱ {c.duration}</p>
                    <p>🕐 {c.timing}</p>
                    {c.platform && <p>💻 {c.platform}</p>}
                    {c.college_name && <p>🏫 {c.college_name}</p>}
                    <p className="text-primary font-medium">{c._count?.enrolments || 0} enrolled students</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/faculty/courses/${c.course_id}`} className="btn-secondary btn-sm flex-1 justify-center">
                      <Users className="w-3.5 h-3.5" /> View Students
                    </Link>
                    <button onClick={() => startEdit(c)} className="btn-ghost btn-sm btn-icon text-accent">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
