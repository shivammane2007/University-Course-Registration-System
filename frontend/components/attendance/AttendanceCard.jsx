import { useState } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function AttendanceCard({ course, onMarked }) {
  const [loading, setLoading] = useState(false);

  const handleMarkAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/student/attendance/mark', {
        course_id: course.course_id
      });
      if (res.data.success) {
        toast.success('Attendance Marked Successfully');
        if (onMarked) onMarked();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const facultyName = course.courseFaculty?.[0]?.faculty 
    ? `${course.courseFaculty[0].faculty.first_name} ${course.courseFaculty[0].faculty.last_name}`
    : 'Not Assigned';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.course_name}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p className="flex items-center gap-2">
             <span className="font-semibold text-gray-700">Faculty:</span> {facultyName}
          </p>
          <p className="flex items-center gap-2">
             <span className="font-semibold text-gray-700">Timing:</span> {course.timing}
          </p>
          <p className="flex items-center gap-2">
             <span className="font-semibold text-gray-700">Mode:</span> {course.mode}
          </p>
        </div>
      </div>
      <button
        onClick={handleMarkAttendance}
        disabled={loading}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Mark Attendance'
        )}
      </button>
    </div>
  );
}
