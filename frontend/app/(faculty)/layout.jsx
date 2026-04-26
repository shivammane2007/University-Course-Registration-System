'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import FacultySidebar from '@/components/faculty/FacultySidebar';

export default function FacultyLayout({ children }) {
  const router = useRouter();
  const { token, role } = useAuthStore();

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (role !== 'faculty') { router.replace('/login'); }
  }, [token, role, router]);

  if (!token || role !== 'faculty') return null;

  return (
    <div className="layout-wrapper">
      <FacultySidebar />
      <main className="page-content">
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}
