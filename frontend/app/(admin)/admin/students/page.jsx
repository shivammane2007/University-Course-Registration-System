'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const studentSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  user_id: z.string().min(1, 'PRN No required'),
  password: z.string().optional(),
  dob: z.string().min(1, 'Required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone_no: z.string().min(10, 'Valid phone required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  pincode: z.string().min(6, 'Required'),
  year_enrolled: z.string().min(4, 'Required'),
  dept_id: z.string().min(1, 'Required'),
});

const fetchStudents = ({ page, search }) =>
  api.get('/admin/students', { params: { page, limit: 10, search } }).then((r) => r.data);
const fetchDepts = () => api.get('/admin/departments').then((r) => r.data.data);

export default function StudentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', student: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', page, search],
    queryFn: () => fetchStudents({ page, search }),
  });
  const { data: depts = [] } = useQuery({ queryKey: ['depts'], queryFn: fetchDepts });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
  });

  const openAdd = () => { reset({}); setModal({ open: true, mode: 'add', student: null }); };
  const openEdit = (s) => {
    reset({
      ...s,
      dob: s.dob ? s.dob.split('T')[0] : '',
      dept_id: String(s.dept_id),
      year_enrolled: String(s.year_enrolled),
      password: '',
    });
    setModal({ open: true, mode: 'edit', student: s });
  };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/admin/students', d),
    onSuccess: () => { toast.success('Student created'); qc.invalidateQueries({ queryKey: ['admin-students'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/students/${id}`, data),
    onSuccess: () => { toast.success('Student updated'); qc.invalidateQueries({ queryKey: ['admin-students'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/students/${id}`),
    onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries({ queryKey: ['admin-students'] }); setDeleteModal({ open: false }); },
    onError: () => toast.error('Failed to delete'),
  });

  const onSubmit = (values) => {
    const payload = { ...values };
    if (modal.mode === 'edit' && !payload.password) delete payload.password;
    if (modal.mode === 'add') {
      if (!payload.password) return toast.error('Password required for new student');
      createMut.mutate(payload);
    } else {
      updateMut.mutate({ id: modal.student.student_id, data: payload });
    }
  };

  const handleSearch = useCallback((val) => { setSearch(val); setPage(1); }, []);

  const columns = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'user_id', label: 'PRN No' },
    { key: 'department', label: 'Department', render: (_, r) => r.department?.dept_name || '—' },
    { key: 'year_enrolled', label: 'Year Enrolled' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="btn-ghost btn-sm btn-icon text-accent">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteModal({ open: true, student: row })} className="btn-ghost btn-sm btn-icon text-danger">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const FormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        { id: 'first_name', label: 'First Name' },
        { id: 'last_name', label: 'Last Name' },
        { id: 'user_id', label: 'PRN No' },
        { id: 'phone_no', label: 'Phone No' },
        { id: 'city', label: 'City' },
        { id: 'state', label: 'State' },
        { id: 'pincode', label: 'Pincode' },
        { id: 'year_enrolled', label: 'Year Enrolled', type: 'number' },
      ].map(({ id, label, type = 'text' }) => (
        <div key={id}>
          <label className="form-label">{label}</label>
          <input {...register(id)} type={type} className={errors[id] ? 'form-input-error' : 'form-input'} id={id} />
          {errors[id] && <p className="form-error">{errors[id].message}</p>}
        </div>
      ))}
      <div>
        <label className="form-label">Date of Birth</label>
        <input {...register('dob')} type="date" className={errors.dob ? 'form-input-error' : 'form-input'} id="dob" />
        {errors.dob && <p className="form-error">{errors.dob.message}</p>}
      </div>
      <div>
        <label className="form-label">Gender</label>
        <select {...register('gender')} className={errors.gender ? 'form-input-error' : 'form-select'} id="gender">
          <option value="">Select gender</option>
          {['Male', 'Female', 'Other'].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {errors.gender && <p className="form-error">{errors.gender.message}</p>}
      </div>
      <div>
        <label className="form-label">Department</label>
        <select {...register('dept_id')} className={errors.dept_id ? 'form-input-error' : 'form-select'} id="dept_id">
          <option value="">Select department</option>
          {depts.map((d) => <option key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</option>)}
        </select>
        {errors.dept_id && <p className="form-error">{errors.dept_id.message}</p>}
      </div>
      <div>
        <label className="form-label">Password {modal.mode === 'edit' && <span className="text-muted">(leave blank to keep)</span>}</label>
        <input {...register('password')} type="password" className="form-input" id="password" autoComplete="new-password" />
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <PageHeader
        title="Students"
        subtitle={`${data?.pagination?.total ?? 0} total students`}
        action={<button onClick={openAdd} className="btn-primary btn-sm" id="add-student-btn"><Plus className="w-3.5 h-3.5" />Add Student</button>}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          onSearch={handleSearch}
          searchPlaceholder="Search by name or PRN..."
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'Add Student' : 'Edit Student'}
        footer={
          <>
            <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending} className="btn-primary" id="save-student-btn">
              {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <FormFields />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Student"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMut.mutate(deleteModal.student?.student_id)} disabled={deleteMut.isPending} className="btn-danger">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete <strong className="text-primary">{deleteModal.student?.first_name} {deleteModal.student?.last_name}</strong>? This will also remove all their enrolments.
        </p>
      </Modal>
    </div>
  );
}
