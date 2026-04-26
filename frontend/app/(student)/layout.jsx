'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import StudentSidebar from '@/components/student/StudentSidebar';

export default function StudentLayout({ children }) {
  const router = useRouter();
  const { token, role } = useAuthStore();

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    if (role !== 'student') { router.replace('/login'); }
  }, [token, role, router]);

  if (!token || role !== 'student') return null;

  return (
    <div className="layout-wrapper">
      <StudentSidebar />
      <main className="page-content">
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}
