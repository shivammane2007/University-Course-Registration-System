'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Pencil, BookOpen, Clock, 
  MapPin, Phone, GraduationCap, 
  Calendar, CheckCircle2, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Modal from '@/components/shared/Modal';
import StatCard from '@/components/shared/StatCard';

const fetchProfile = () => api.get('/student/profile').then((r) => r.data.data);
const fetchEnrolled = () => api.get('/student/courses/enrolled').then((r) => r.data.data);

export default function StudentDashboard() {
  const qc = useQueryClient();
  const [editModal, setEditModal] = useState(false);
  const { data: profile, isLoading } = useQuery({ queryKey: ['student-profile'], queryFn: fetchProfile });
  const { data: enrolled = [] } = useQuery({ queryKey: ['student-enrolled'], queryFn: fetchEnrolled });

  const { register, handleSubmit, reset } = useForm();

  const pendingCount = enrolled.filter((e) => e.status === 'Pending').length;
  const approvedCount = enrolled.filter((e) => e.status === 'Approved').length;

  const openEdit = () => {
    reset({
      phone_no: profile?.phone_no, city: profile?.city,
      state: profile?.state, pincode: profile?.pincode,
    });
    setEditModal(true);
  };

  const updateMut = useMutation({
    mutationFn: (d) => api.put('/student/profile', d),
    onSuccess: () => { 
      toast.success('Profile updated successfully'); 
      qc.invalidateQueries({ queryKey: ['student-profile'] }); 
      setEditModal(false); 
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) return (
    <div className="page-inner">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1,2,3].map((i) => <div key={i} className="card skeleton h-32" />)}
      </div>
      <div className="card skeleton h-96" />
    </div>
  );

  return (
    <div className="page-inner">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 leading-none mb-1">
              Hello, {profile?.first_name || 'Student'} 👋
            </h1>
            <p className="text-muted font-medium flex items-center gap-2">
              <span className="text-blue-600">{profile?.department?.dept_name}</span> 
              <span className="text-primary-200">|</span>
              Year {profile?.year_enrolled}
            </p>
          </div>
        </div>
        <button onClick={openEdit} className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20">
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Enrolled Courses" value={enrolled.length} icon={BookOpen} color="blue" />
        <StatCard label="Approved Courses" value={approvedCount} icon={CheckCircle2} color="green" />
        <StatCard label="Pending Requests" value={pendingCount} icon={Clock} color="purple" trend="In review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-display font-bold text-primary-900">Personal Information</h2>
              <Badge status={profile?.status || 'Active'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
              {[
                { label: 'Full Name', value: `${profile?.first_name} ${profile?.last_name}`, icon: User },
                { label: 'PRN Number', value: profile?.user_id, icon: AlertCircle },
                { label: 'Date of Birth', value: profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—', icon: Calendar },
                { label: 'Gender', value: profile?.gender, icon: User },
                { label: 'Phone Number', value: profile?.phone_no, icon: Phone },
                { label: 'Department', value: profile?.department?.dept_name, icon: GraduationCap },
              ].map((item) => (
                <div key={item.label} className="group">
                  <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">{item.label}</p>
                  <p className="font-bold text-primary-900 group-hover:text-blue-600 transition-colors">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-display font-bold text-primary-900 mb-6">Address Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'City', value: profile?.city, icon: MapPin },
                { label: 'State', value: profile?.state, icon: MapPin },
                { label: 'Pincode', value: profile?.pincode, icon: MapPin },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">{item.label}</p>
                  <p className="font-bold text-primary-900">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links / Next Class */}
        <div className="space-y-6">
          <div className="card bg-blue-600 text-white border-none">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-200" /> Current Status
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                <p className="text-blue-100 text-xs mb-1 uppercase tracking-wider font-bold">Upcoming Semester</p>
                <p className="text-lg font-bold">Fall 2026</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                <p className="text-blue-100 text-xs mb-1 uppercase tracking-wider font-bold">Registration Deadline</p>
                <p className="text-lg font-bold">15 May, 2026</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-bold mb-4 text-primary-900">Academic Resources</h4>
            <div className="space-y-3">
              {[
                { label: 'Digital Library', href: '#' },
                { label: 'Examination Schedule', href: '#' },
                { label: 'Grading Rubric', href: '#' },
                { label: 'Holiday Calendar', href: '#' },
              ].map((link) => (
                <a key={link.label} href={link.href} className="block p-3 rounded-xl hover:bg-primary-50 text-sm font-medium text-primary-700 hover:text-blue-600 transition-all border border-transparent hover:border-border">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Update Profile Information"
        footer={
          <>
            <button onClick={() => setEditModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit((d) => updateMut.mutate(d))} disabled={updateMut.isPending} className="btn-primary">
              {updateMut.isPending ? 'Updating...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { id: 'phone_no', label: 'Phone Number' },
            { id: 'city', label: 'City' },
            { id: 'state', label: 'State' },
            { id: 'pincode', label: 'Pincode' },
          ].map(({ id, label }) => (
            <div key={id}>
              <label className="form-label">{label}</label>
              <input {...register(id)} className="form-input" id={id} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function User(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

function Badge({ status }) {
  return (
    <span className="badge-approved">
      <CheckCircle2 className="w-3 h-3" /> {status}
    </span>
  );
}
