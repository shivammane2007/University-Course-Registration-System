'use client';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function FacultyAttendancePage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendance();
    }

    const handleAttendanceUpdate = () => {
      if (selectedCourse) {
        fetchAttendance();
      }
    };

    window.addEventListener('attendance_updated', handleAttendanceUpdate);
    return () => window.removeEventListener('attendance_updated', handleAttendanceUpdate);
  }, [selectedCourse, dateFilter]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/faculty/courses');
      if (res.data?.success) {
        setCourses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedCourse(res.data.data[0].course_id);
        }
      }
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`/faculty/attendance/course/${selectedCourse}?date=${dateFilter}`);
      if (res.data?.success) {
        setAttendance(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load attendance');
    }
  };

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Attendance</h1>
          <p className="text-gray-500 mt-1">View and manage student attendance</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          >
            {courses.length === 0 ? (
              <option disabled value="">No courses assigned</option>
            ) : (
              courses.map(course => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            📊
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Present</p>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            ✅
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Absent</p>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            ❌
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
             <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No attendance records found for this course on the selected date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4">Student ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {record.student?.user_id}
                    </td>
                    <td className="px-6 py-4">
                      {record.student?.first_name} {record.student?.last_name}
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
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {record.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
