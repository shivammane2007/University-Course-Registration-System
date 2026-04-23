'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  user_id: z.string().min(1, 'Required'),
  dob: z.string().min(1, 'Required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string().min(1, 'Required'),
  domain: z.string().min(1, 'Required'),
  designation: z.string().min(1, 'Required'),
  contact_no: z.string().min(10, 'Required'),
  dept_id: z.string().min(1, 'Required'),
  password: z.string().optional(),
});

const fetchFaculties = ({ page, search }) =>
  api.get('/admin/faculties', { params: { page, limit: 10, search } }).then((r) => r.data);
const fetchDepts = () => api.get('/admin/departments').then((r) => r.data.data);

export default function FacultiesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', faculty: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, faculty: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-faculties', page, search],
    queryFn: () => fetchFaculties({ page, search }),
  });
  const { data: depts = [] } = useQuery({ queryKey: ['depts'], queryFn: fetchDepts });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const openAdd = () => { reset({}); setModal({ open: true, mode: 'add', faculty: null }); };
  const openEdit = (f) => {
    reset({ ...f, dob: f.dob?.split('T')[0] || '', dept_id: String(f.dept_id), password: '' });
    setModal({ open: true, mode: 'edit', faculty: f });
  };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/admin/faculties', d),
    onSuccess: () => { toast.success('Faculty member added'); qc.invalidateQueries({ queryKey: ['admin-faculties'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to add faculty'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/faculties/${id}`, data),
    onSuccess: () => { toast.success('Faculty details updated'); qc.invalidateQueries({ queryKey: ['admin-faculties'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update faculty'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/faculties/${id}`),
    onSuccess: () => { toast.success('Faculty member removed'); qc.invalidateQueries({ queryKey: ['admin-faculties'] }); setDeleteModal({ open: false }); },
    onError: () => toast.error('Failed to remove faculty'),
  });

  const onSubmit = (values) => {
    const payload = { ...values };
    if (modal.mode === 'edit' && !payload.password) delete payload.password;
    if (modal.mode === 'add') {
      if (!payload.password) return toast.error('Initial password is required');
      createMut.mutate(payload);
    } else {
      updateMut.mutate({ id: modal.faculty.faculty_id, data: payload });
    }
  };

  const handleSearch = useCallback((val) => { setSearch(val); setPage(1); }, []);

  const columns = [
    { 
      key: 'name', 
      label: 'Faculty Name', 
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs">
            {r.first_name[0]}{r.last_name[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-primary-900">{r.first_name} {r.last_name}</span>
            <span className="text-[10px] text-muted font-mono">{r.user_id}</span>
          </div>
        </div>
      )
    },
    { key: 'department', label: 'Department', render: (_, r) => <span className="font-medium">{r.department?.dept_name || '—'}</span> },
    { key: 'designation', label: 'Designation', render: (v) => <span className="badge bg-primary-50 text-primary-700 border-none">{v}</span> },
    { key: 'domain', label: 'Specialization' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="btn-icon btn-ghost text-accent"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteModal({ open: true, faculty: row })} className="btn-icon btn-ghost text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-inner">
      <PageHeader
        title="Faculty Management"
        subtitle={`Overseeing ${data?.pagination?.total ?? 0} specialized educators`}
        action={
          <button onClick={openAdd} className="btn-primary shadow-lg shadow-accent/20" id="add-faculty-btn">
            <Plus className="w-4 h-4" /> Add Faculty Member
          </button>
        }
      />

      <div className="card">
        <DataTable 
          columns={columns} 
          data={data?.data || []} 
          loading={isLoading} 
          pagination={data?.pagination}
          onPageChange={setPage} 
          onSearch={handleSearch} 
          searchPlaceholder="Search by name, ID or specialization..." 
        />
      </div>

      {/* Form Modal */}
      <Modal 
        open={modal.open} 
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'Register New Faculty' : 'Modify Faculty Record'}
        footer={
          <>
            <button onClick={() => setModal({ open: false })} className="btn-secondary">Discard Changes</button>
            <button onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending} className="btn-primary">
              {createMut.isPending || updateMut.isPending ? 'Syncing...' : 'Save Record'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4 col-span-1 sm:col-span-2">
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] border-b border-primary-50 pb-2">Personal Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name</label>
                <input {...register('first_name')} className="form-input" />
                {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input {...register('last_name')} className="form-input" />
                {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Faculty ID / Username</label>
              <input {...register('user_id')} className="form-input" />
              {errors.user_id && <p className="form-error">{errors.user_id.message}</p>}
            </div>
            <div>
              <label className="form-label">Contact Number</label>
              <input {...register('contact_no')} className="form-input" />
              {errors.contact_no && <p className="form-error">{errors.contact_no.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Designation</label>
              <input {...register('designation')} className="form-input" placeholder="e.g. Associate Professor" />
              {errors.designation && <p className="form-error">{errors.designation.message}</p>}
            </div>
            <div>
              <label className="form-label">Academic Domain</label>
              <input {...register('domain')} className="form-input" placeholder="e.g. Quantum Computing" />
              {errors.domain && <p className="form-error">{errors.domain.message}</p>}
            </div>
          </div>

          <div className="space-y-4 col-span-1 sm:col-span-2">
            <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] border-b border-primary-50 pb-2">Administrative Info</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Department</label>
                <select {...register('dept_id')} className="form-select">
                  <option value="">Select Department</option>
                  {depts.map((d) => <option key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</option>)}
                </select>
                {errors.dept_id && <p className="form-error">{errors.dept_id.message}</p>}
              </div>
              <div>
                <label className="form-label">System Password</label>
                <input {...register('password')} type="password" placeholder="••••••••" className="form-input" autoComplete="new-password" />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false })} title="Remove Faculty Member"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMut.mutate(deleteModal.faculty?.faculty_id)} disabled={deleteMut.isPending} className="btn-danger shadow-lg shadow-danger/20">
              {deleteMut.isPending ? 'Removing...' : 'Confirm Removal'}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-danger-soft rounded-full flex items-center justify-center text-danger mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-primary-900 font-bold text-lg mb-1">Are you absolutely sure?</p>
          <p className="text-muted text-sm max-w-xs">
            Removing <strong className="text-primary-900">{deleteModal.faculty?.first_name} {deleteModal.faculty?.last_name}</strong> will revoke all system access and unassign them from their courses.
          </p>
        </div>
      </Modal>
    </div>
  );
}
