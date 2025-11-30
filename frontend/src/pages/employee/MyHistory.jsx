import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, LogOut, User, Home, Clock, History, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { attendanceAPI } from '../../services/api';
import { logout } from '../../store/slices/authSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const MyHistory = () => {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [view, setView] = useState('calendar'); // calendar or table
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();

      const [historyRes, summaryRes] = await Promise.all([
        attendanceAPI.getMyHistory({ month, year }),
        attendanceAPI.getMySummary({ month, year })
      ]);

      setHistory(historyRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getStatusForDate = (date) => {
    return history.find(record => 
      isSameDay(new Date(record.date), date)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 text-white';
      case 'late':
        return 'bg-yellow-500 text-white';
      case 'half-day':
        return 'bg-orange-500 text-white';
      case 'absent':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-100 text-gray-400';
    }
  };

  const renderCalendar = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const record = getStatusForDate(day);
          return (
            <div
              key={index}
              className={`aspect-square p-2 rounded-lg border-2 ${
                record 
                  ? getStatusColor(record.status)
                  : 'bg-white border-gray-200'
              } flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition`}
              title={record ? `${record.status} - ${record.totalHours.toFixed(1)} hrs` : 'No record'}
            >
              <span className={`text-sm font-semibold ${record ? '' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </span>
              {record && (
                <span className="text-xs mt-1">
                  {record.totalHours.toFixed(1)}h
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Attendance History</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.employeeId}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              onClick={() => navigate('/employee/dashboard')}
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/employee/mark-attendance')}
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Mark Attendance
            </button>
            <button
              onClick={() => navigate('/employee/history')}
              className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium"
            >
              <History className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => navigate('/employee/profile')}
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Previous
              </button>
              <h3 className="text-xl font-bold text-gray-900">
                {format(selectedMonth, 'MMMM yyyy')}
              </h3>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Next
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg transition ${
                  view === 'calendar' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-4 py-2 rounded-lg transition ${
                  view === 'table' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.totalDays}</p>
              <p className="text-sm text-gray-600 mt-1">Total Days</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.present}</p>
              <p className="text-sm text-gray-600 mt-1">Present</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
              <p className="text-sm text-gray-600 mt-1">Absent</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
              <p className="text-sm text-gray-600 mt-1">Late</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{summary.totalHours}</p>
              <p className="text-sm text-gray-600 mt-1">Total Hours</p>
            </div>
          </div>
        )}

        {/* Calendar or Table View */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {view === 'calendar' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Attendance Calendar</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Half-day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Absent</span>
                  </div>
                </div>
              </div>
              {renderCalendar()}
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.totalHours.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'half-day' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <p className="text-center text-gray-500 py-8">No attendance records for this month</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyHistory;