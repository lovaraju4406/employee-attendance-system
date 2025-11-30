import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar as CalIcon, FileText, LogOut, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { attendanceAPI } from '../../services/api';
import { logout } from '../../store/slices/authSlice';

const TeamCalendar = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const { data } = await attendanceAPI.getTodayTeamStatus();
      setTodayStatus(data);
    } catch (error) {
      toast.error('Failed to fetch team status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Team Calendar</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button onClick={() => navigate('/manager/dashboard')} className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium">
              <Home className="w-4 h-4 inline mr-2" />Dashboard
            </button>
            <button onClick={() => navigate('/manager/attendance')} className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium">
              <Users className="w-4 h-4 inline mr-2" />All Attendance
            </button>
            <button onClick={() => navigate('/manager/calendar')} className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              <CalIcon className="w-4 h-4 inline mr-2" />Team Calendar
            </button>
            <button onClick={() => navigate('/manager/reports')} className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium">
              <FileText className="w-4 h-4 inline mr-2" />Reports
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Present Today ({todayStatus?.present?.length || 0})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayStatus?.present?.map((record) => (
                  <div key={record._id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                      <span className="text-green-700 font-semibold">{record.userId.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{record.userId.name}</p>
                      <p className="text-sm text-gray-500">{record.userId.employeeId} - {record.userId.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Absent Today ({todayStatus?.absent?.length || 0})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayStatus?.absent?.map((employee) => (
                  <div key={employee._id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                      <span className="text-red-700 font-semibold">{employee.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{employee.name}</p>
                      <p className="text-sm text-gray-500">{employee.employeeId} - {employee.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamCalendar;