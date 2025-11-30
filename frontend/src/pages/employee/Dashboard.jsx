import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, CheckCircle, XCircle, AlertCircle, 
  TrendingUp, LogOut, User, Home, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { dashboardAPI, attendanceAPI } from '../../services/api';
import { logout } from '../../store/slices/authSlice';
import socketService from '../../services/socket';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchDashboardData();
    
    // Connect socket
    socketService.connect();
    socketService.on('attendance-update', handleAttendanceUpdate);

    return () => {
      socketService.off('attendance-update');
    };
  }, []);

  const handleAttendanceUpdate = (data) => {
    if (data.userId === user._id) {
      fetchDashboardData();
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data } = await dashboardAPI.getEmployeeDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully!');
      fetchDashboardData();
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
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    socketService.disconnect();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCheckedIn = dashboardData?.today?.status === 'checked-in';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
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
              className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Status Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isCheckedIn ? 'You are Checked In' : 'Not Checked In Yet'}
              </h2>
              <p className="text-blue-100">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
              {isCheckedIn && dashboardData.today.checkInTime && (
                <p className="mt-4 text-lg">
                  Check-in Time: {format(new Date(dashboardData.today.checkInTime), 'hh:mm a')}
                </p>
              )}
            </div>
            <Clock className="w-16 h-16 opacity-20" />
          </div>
          
          <div className="mt-6">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Check In Now'}
              </button>
            ) : !dashboardData.today.checkOutTime ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Check Out'}
              </button>
            ) : (
              <div className="bg-white/20 px-4 py-2 rounded-lg inline-block">
                Checked out at {format(new Date(dashboardData.today.checkOutTime), 'hh:mm a')}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Present Days</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData.thisMonth.present}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Absent Days</p>
                <p className="text-3xl font-bold text-red-600">
                  {dashboardData.thisMonth.absent}
                </p>
              </div>
              <XCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Late Arrivals</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {dashboardData.thisMonth.late}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData.thisMonth.totalHours}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Attendance (Last 7 Days)</h3>
          <div className="space-y-3">
            {dashboardData.recent.length > 0 ? (
              dashboardData.recent.map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(record.date), 'MMMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.checkInTime && format(new Date(record.checkInTime), 'hh:mm a')}
                        {record.checkOutTime && ` - ${format(new Date(record.checkOutTime), 'hh:mm a')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : record.status === 'half-day'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {record.totalHours.toFixed(1)} hrs
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent attendance records</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;