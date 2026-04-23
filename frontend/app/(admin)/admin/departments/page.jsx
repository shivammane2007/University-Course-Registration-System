'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const fetchDepts = () => api.get('/admin/departments').then((r) => r.data.data);

export default function DepartmentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState({ open: false, mode: 'add', dept: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, dept: null });
  const { data: depts = [], isLoading } = useQuery({ queryKey: ['depts'], queryFn: fetchDepts });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openAdd = () => { reset({ dept_name: '' }); setModal({ open: true, mode: 'add', dept: null }); };
  const openEdit = (d) => { reset({ dept_name: d.dept_name }); setModal({ open: true, mode: 'edit', dept: d }); };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/admin/departments', d),
    onSuccess: () => { toast.success('Department created'); qc.invalidateQueries({ queryKey: ['depts'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/departments/${id}`, data),
    onSuccess: () => { toast.success('Department updated'); qc.invalidateQueries({ queryKey: ['depts'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/departments/${id}`),
    onSuccess: () => { toast.success('Department deleted'); qc.invalidateQueries({ queryKey: ['depts'] }); setDeleteModal({ open: false }); },
    onError: () => toast.error('Failed to delete (may have linked records)'),
  });

  const onSubmit = ({ dept_name }) => {
    if (modal.mode === 'add') createMut.mutate({ dept_name });
    else updateMut.mutate({ id: modal.dept.dept_id, data: { dept_name } });
  };

  return (
    <div className="pt-6">
      <PageHeader
        title="Departments"
        subtitle={`${depts.length} departments`}
        action={<button onClick={openAdd} className="btn-primary btn-sm" id="add-dept-btn"><Plus className="w-3.5 h-3.5" />Add Department</button>}
      />

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{[1, 2, 3].map((j) => <td key={j}><div className="skeleton h-4 rounded w-3/4" /></td>)}</tr>
                ))
              ) : depts.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-muted">No departments yet</td></tr>
              ) : depts.map((d) => (
                <tr key={d.dept_id}>
                  <td className="text-muted">#{d.dept_id}</td>
                  <td className="font-medium">{d.dept_name}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(d)} className="btn-ghost btn-sm btn-icon text-accent"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteModal({ open: true, dept: d })} className="btn-ghost btn-sm btn-icon text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'Add Department' : 'Edit Department'}
        footer={
          <>
            <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending} className="btn-primary">
              {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div>
          <label className="form-label">Department Name</label>
          <input {...register('dept_name', { required: 'Required' })} className={errors.dept_name ? 'form-input-error' : 'form-input'} id="dept_name" placeholder="e.g. Computer Science" />
          {errors.dept_name && <p className="form-error">{errors.dept_name.message}</p>}
        </div>
      </Modal>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false })} title="Delete Department"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMut.mutate(deleteModal.dept?.dept_id)} disabled={deleteMut.isPending} className="btn-danger">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">Delete <strong className="text-primary">{deleteModal.dept?.dept_name}</strong>?</p>
      </Modal>
    </div>
  );
}
