'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Eye } from 'lucide-react';
import api from '@/lib/axios';
import DataTable from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PageHeader from '@/components/shared/PageHeader';

const fetchLibrary = ({ search, category }) =>
  api.get('/api/resources/library', { params: { search, category } }).then((r) => r.data);

const categories = ['All', 'Engineering', 'Computer Science', 'Civil', 'Mechanical', 'Electronics', 'Management'];

export default function AdminLibraryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [detailsModal, setDetailsModal] = useState({ open: false, resource: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-library', search, category],
    queryFn: () => fetchLibrary({ search, category }),
  });

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title', render: (val) => <span className="font-bold text-primary-900">{val}</span> },
    { key: 'subject', label: 'Subject' },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { key: 'uploaded_by_name', label: 'Uploaded By', render: (val) => val || 'System/Admin' },
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
      key: 'actions', label: 'Quick View',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDetailsModal({ open: true, resource: row })} 
            className="btn-ghost btn-sm btn-icon text-primary"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <a 
            href={row.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-ghost btn-sm btn-icon text-blue-600"
            title="Open/Download"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-6 animate-in fade-in duration-500">
      <PageHeader
        title="Manage Digital Library"
        subtitle="View all approved academic books and uploaded resources"
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
        open={detailsModal.open}
        onClose={() => setDetailsModal({ open: false })}
        title="Resource Details"
        footer={<button onClick={() => setDetailsModal({ open: false })} className="btn-primary">Close</button>}
      >
        {detailsModal.resource && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title</p>
              <p className="font-bold text-primary-900">{detailsModal.resource.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Author</p>
                <p className="font-medium text-slate-700">{detailsModal.resource.author}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                <p className="font-medium text-slate-700">{detailsModal.resource.category}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</p>
              <p className="font-medium text-slate-700">{detailsModal.resource.subject}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Uploaded By</p>
              <p className="font-medium text-slate-700">{detailsModal.resource.uploaded_by_name || 'System/Admin'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</p>
              <p className="text-sm text-slate-600 italic">
                {detailsModal.resource.description || 'No description provided.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
