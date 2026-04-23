'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Calendar, LogOut, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const links = [
  { href: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/faculty/courses', label: 'My Courses', icon: BookOpen },
  { href: '/faculty/schedule', label: 'Schedule', icon: Calendar },
];

export default function FacultySidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      <div className="flex items-center gap-4 px-6 py-8 border-b border-white/5">
        <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group cursor-pointer transition-transform hover:scale-105">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div className="flex flex-col">
          <p className="font-display font-bold text-base text-white tracking-tight leading-tight">Faculty Portal</p>
          <p className="text-xs text-primary-300 font-medium mt-1 truncate max-w-[120px]">{user?.name || 'Faculty'}</p>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={pathname === href || pathname.startsWith(href + '/') ? 'sidebar-link-active' : 'sidebar-link'}
            style={pathname.startsWith(href) ? { color: '#0D9488', backgroundColor: 'rgb(20 184 166 / 0.1)' } : {}}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button onClick={handleLogout} className="sidebar-link w-full text-danger hover:bg-red-50 hover:text-danger">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
