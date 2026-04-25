'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, ExternalLink, Library } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const librarySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  fileUrl: z.string().url('Invalid URL').or(z.string().min(1, 'File URL required')),
  status: z.enum(['Active', 'Hidden']),
});

const fetchLibrary = ({ search, category }) =>
  api.get('/api/resources/library', { params: { search, category } }).then((r) => r.data);

const categories = ['All', 'Engineering', 'Computer Science', 'Civil', 'Mechanical', 'Electronics', 'Management'];

export default function AdminLibraryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState({ open: false, mode: 'add', resource: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, resource: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-library', search, category],
    queryFn: () => fetchLibrary({ search, category }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(librarySchema),
  });

  const openAdd = () => { reset({ status: 'Active' }); setModal({ open: true, mode: 'add', resource: null }); };
  const openEdit = (r) => {
    reset(r);
    setModal({ open: true, mode: 'edit', resource: r });
  };

  const createMut = useMutation({
    mutationFn: (d) => api.post('/api/resources/admin/library', d),
    onSuccess: () => { toast.success('Resource added'); qc.invalidateQueries({ queryKey: ['admin-library'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/resources/admin/library/${id}`, data),
    onSuccess: () => { toast.success('Resource updated'); qc.invalidateQueries({ queryKey: ['admin-library'] }); setModal({ open: false }); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/api/resources/admin/library/${id}`),
    onSuccess: () => { toast.success('Resource deleted'); qc.invalidateQueries({ queryKey: ['admin-library'] }); setDeleteModal({ open: false }); },
    onError: () => toast.error('Failed to delete'),
  });

  const onSubmit = (values) => {
    if (modal.mode === 'add') {
      createMut.mutate(values);
    } else {
      updateMut.mutate({ id: modal.resource.id, data: values });
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title', render: (val) => <span className="font-bold text-primary-900">{val}</span> },
    { key: 'subject', label: 'Subject' },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { 
      key: 'fileUrl', 
      label: 'File', 
      render: (val) => (
        <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
          <ExternalLink className="w-3 h-3" /> Link
        </a>
      ) 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => (
        <span className={`badge ${val === 'Active' ? 'badge-approved' : 'badge-pending'}`}>
          {val}
        </span>
      ) 
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="btn-ghost btn-sm btn-icon text-accent">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteModal({ open: true, resource: row })} className="btn-ghost btn-sm btn-icon text-danger">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-6">
      <PageHeader
        title="Manage Digital Library"
        subtitle="Upload and manage academic books and notes"
        action={<button onClick={openAdd} className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5" />Add Resource</button>}
      />

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
           <select 
             value={category} 
             onChange={(e) => setCategory(e.target.value)}
             className="form-select w-48"
           >
             {categories.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          onSearch={setSearch}
          searchPlaceholder="Search by title, subject or author..."
        />
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'Add Resource' : 'Edit Resource'}
        footer={
          <>
            <button onClick={() => setModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit(onSubmit)} disabled={createMut.isPending || updateMut.isPending} className="btn-primary">
              {createMut.isPending || updateMut.isPending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Book Title</label>
            <input {...register('title')} className={errors.title ? 'form-input-error' : 'form-input'} />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>
          <div>
            <label className="form-label">Subject</label>
            <input {...register('subject')} className={errors.subject ? 'form-input-error' : 'form-input'} />
            {errors.subject && <p className="form-error">{errors.subject.message}</p>}
          </div>
          <div>
            <label className="form-label">Author</label>
            <input {...register('author')} className={errors.author ? 'form-input-error' : 'form-input'} />
            {errors.author && <p className="form-error">{errors.author.message}</p>}
          </div>
          <div>
            <label className="form-label">Category</label>
            <select {...register('category')} className={errors.category ? 'form-input-error' : 'form-select'}>
              <option value="">Select Category</option>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="form-error">{errors.category.message}</p>}
          </div>
          <div>
            <label className="form-label">Status</label>
            <select {...register('status')} className="form-select">
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="form-label">File URL (PDF / Resource Link)</label>
            <input {...register('fileUrl')} className={errors.fileUrl ? 'form-input-error' : 'form-input'} placeholder="https://example.com/book.pdf" />
            {errors.fileUrl && <p className="form-error">{errors.fileUrl.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="form-label">Description</label>
            <textarea {...register('description')} className="form-input h-24 resize-none" />
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Resource"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary">Cancel</button>
            <button onClick={() => deleteMut.mutate(deleteModal.resource?.id)} disabled={deleteMut.isPending} className="btn-danger">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete <strong className="text-primary">{deleteModal.resource?.title}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
