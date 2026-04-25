'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Users, X, Check, Clock, Calendar, Globe, MapPin, BookOpen, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/axios';
import Badge from '@/components/shared/Badge';
import PageHeader from '@/components/shared/PageHeader';

const schema = z.object({
  course_name: z.string().min(1, 'Required'),
  timing: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
});

const fetchCourses = () => api.get('/faculty/courses').then((r) => r.data.data);

export default function FacultyCoursesPage() {
  const qc = useQueryClient();
  const { data: courses = [], isLoading } = useQuery({ queryKey: ['faculty-courses'], queryFn: fetchCourses });
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card skeleton h-64" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-6 pb-12">
      <PageHeader 
        title="My Courses" 
        subtitle={`Managing ${courses.length} active academic programs`} 
      />

      {courses.length === 0 ? (
        <div className="card text-center py-20 bg-primary-50/30 border-dashed border-2 border-primary-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 text-2xl">📚</div>
          <p className="text-primary-900 font-bold text-lg mb-1">No Assigned Courses</p>
          <p className="text-muted text-sm max-w-xs mx-auto">You don't have any courses assigned to your profile yet. Please coordinate with the Registrar's office.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.course_id} className={`group relative card transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 ${editingId === c.course_id ? 'ring-2 ring-accent border-transparent' : ''}`}>
              {editingId === c.course_id ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-primary-50 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Pencil className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-primary-900">Modify Specifications</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label text-[10px]">Course Title</label>
                      <input {...register('course_name')} className={errors.course_name ? 'form-input-error' : 'form-input'} />
                      {errors.course_name && <p className="form-error">{errors.course_name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label text-[10px]">Weekly Timing</label>
                        <input {...register('timing')} className={errors.timing ? 'form-input-error' : 'form-input'} />
                        {errors.timing && <p className="form-error">{errors.timing.message}</p>}
                      </div>
                      <div>
                        <label className="form-label text-[10px]">Duration/Credits</label>
                        <input {...register('duration')} className={errors.duration ? 'form-input-error' : 'form-input'} />
                        {errors.duration && <p className="form-error">{errors.duration.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button onClick={handleSubmit((d) => updateMut.mutate({ id: c.course_id, data: d }))}
                      disabled={updateMut.isPending} className="btn-primary btn-sm flex-1 shadow-md shadow-accent/20">
                      {updateMut.isPending ? 'Syncing...' : 'Save Updates'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 transition-colors group-hover:bg-primary-100">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-primary-900 leading-tight group-hover:text-accent transition-colors">{c.course_name}</h3>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">{c.department?.dept_name}</span>
                      </div>
                    </div>
                    <Badge variant={c.mode.toLowerCase()} />
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-muted group-hover:text-primary-500 transition-colors">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Duration</span>
                        <span className="text-xs font-semibold text-primary-700">{c.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-muted group-hover:text-primary-500 transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Schedule</span>
                        <span className="text-xs font-semibold text-primary-700">{c.timing}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-muted group-hover:text-primary-500 transition-colors">
                        {c.mode === 'Online' ? <Globe className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">{c.mode === 'Online' ? 'Platform' : 'Location'}</span>
                        <span className="text-xs font-semibold text-primary-700 truncate max-w-[100px]">{c.platform || c.college_name || 'TBA'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-accent font-bold uppercase tracking-tighter">Students</span>
                        <span className="text-xs font-bold text-accent">{c._count?.enrolments || 0} Enrolled</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-primary-50/50">
                    <Link 
                      href={`/faculty/courses/${c.course_id}`} 
                      className="btn-primary btn-sm flex-1 justify-center gap-2 bg-primary-900 hover:bg-primary-800 shadow-lg shadow-primary-900/10"
                    >
                      Class Roster <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button 
                      onClick={() => startEdit(c)} 
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-primary-100 text-muted hover:text-accent hover:border-accent hover:bg-accent-soft transition-all"
                      title="Edit Course"
                    >
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
