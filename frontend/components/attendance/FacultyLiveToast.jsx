'use client';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function FacultyLiveToast() {
  const { user } = useAuthStore();

  useEffect(() => {
    // Only connect if the user is a faculty member
    if (!user || user.role !== 'faculty') return;

    // Use environment variable or default to localhost:5000
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      // Join the faculty room
      socket.emit('join_faculty_room', user.entity_id);
    });

    socket.on('attendance_marked', (data) => {
      // Notify other components (like the attendance page) to refresh data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance_updated', { detail: data }));
      }

      // data: { studentName, courseName, time, status }
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out slide-out-to-right-2'
          } max-w-sm w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                   <span className="text-teal-600 text-xl">✅</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Attendance Marked
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">{data.studentName}</span> marked attendance
                </p>
                <div className="mt-2 text-xs text-gray-400 flex flex-col gap-1">
                  <span>Course: {data.courseName}</span>
                  <span>{new Date(data.time).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 3000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return null;
}
