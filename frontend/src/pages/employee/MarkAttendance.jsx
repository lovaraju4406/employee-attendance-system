import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, LogOut, User, Home, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { attendanceAPI } from '../../services/api';
import { logout } from '../../store/slices/authSlice';
import { format } from 'date-fns';

const MarkAttendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchTodayStatus();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const { data } = await attendanceAPI.getTodayStatus();
      setTodayStatus(data);
    } catch (error) {
      console.error('Failed to fetch today status');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully!');
      fetchTodayStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully!');
      fetchTodayStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCheckedIn = todayStatus?.checkInTime;
  const isCheckedOut = todayStatus?.checkOutTime;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
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
              className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium"
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Mark Attendance
            </button>
            <button
              onClick={() => navigate('/employee/history')}
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Time Display */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-2">
            {format(currentTime, 'hh:mm:ss a')}
          </h2>
          <p className="text-xl text-gray-600">
            {format(currentTime, 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>

        {/* Attendance Action Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {!isCheckedIn ? (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to start your day?
              </h3>
              <p className="text-gray-600 mb-8">
                Click the button below to check in
              </p>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="px-12 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {actionLoading ? 'Processing...' : 'Check In'}
              </button>
            </div>
          ) : !isCheckedOut ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                You're Checked In
              </h3>
              <p className="text-gray-600 mb-2">
                Check-in time: {format(new Date(todayStatus.checkInTime), 'hh:mm:ss a')}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Status: <span className={`font-semibold ${todayStatus.status === 'late' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {todayStatus.status.toUpperCase()}
                </span>
              </p>
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="px-12 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {actionLoading ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Day Complete!
              </h3>
              <div className="space-y-2 mb-6">
                <p className="text-gray-600">
                  Check-in: {format(new Date(todayStatus.checkInTime), 'hh:mm:ss a')}
                </p>
                <p className="text-gray-600">
                  Check-out: {format(new Date(todayStatus.checkOutTime), 'hh:mm:ss a')}
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  Total Hours: {todayStatus.totalHours.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => navigate('/employee/history')}
                className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
              >
                View Attendance History
              </button>
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3">Attendance Guidelines</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Standard work hours: 9:00 AM - 6:00 PM</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Late arrival is marked after 9:15 AM</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Half-day is recorded if working less than 4 hours</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Make sure to check out before leaving</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default MarkAttendance;