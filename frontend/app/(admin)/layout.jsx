'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { token, role } = useAuthStore();

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (role !== 'admin') { router.replace('/login'); }
  }, [token, role, router]);

  if (!token || role !== 'admin') return null;

  return (
    <div className="layout-wrapper">
      <AdminSidebar />
      <main className="page-content">
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}
