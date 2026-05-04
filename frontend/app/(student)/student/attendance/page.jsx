'use client';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import AttendanceCard from '@/components/attendance/AttendanceCard';

export default function StudentAttendancePage() {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'history'
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, historyRes] = await Promise.all([
        axios.get('/student/courses/enrolled'),
        axios.get('/student/attendance/history')
      ]);
      
      if (coursesRes.data?.success) {
        const approvedEnrolments = coursesRes.data.data.filter(e => e.status === 'Approved');
        setEnrolledCourses(approvedEnrolments.map(e => e.course));
      }
      
      if (historyRes.data?.success) {
        setHistory(historyRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">Mark your daily attendance and view history</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-max">
        <button
          onClick={() => setActiveTab('mark')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'mark' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My History
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'mark' ? (
        <div>
          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500 text-lg">No enrolled courses available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                <AttendanceCard 
                  key={course.course_id} 
                  course={course} 
                  onMarked={fetchData} 
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No attendance records found.</p>
            </div>
          ) : (
             <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {record.course?.course_name}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(record.marked_at).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
