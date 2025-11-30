import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, XCircle, Clock, LogOut,
  Home, Calendar, FileText, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { dashboardAPI } from '../../services/api';
import { logout } from '../../store/slices/authSlice';
import socketService from '../../services/socket';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchDashboardData();
    
    // Connect socket
    socketService.connect();
    socketService.on('attendance-update', () => {
      fetchDashboardData();
    });

    return () => {
      socketService.off('attendance-update');
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await dashboardAPI.getManagerDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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

  // Prepare chart data
  const weeklyData = dashboardData?.weeklyTrend?.map(day => ({
    date: format(new Date(day._id), 'MM/dd'),
    present: day.present,
    late: day.late
  })) || [];

  const departmentPieData = dashboardData?.departmentStats?.map(dept => ({
    name: dept._id,
    value: dept.present
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
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
              onClick={() => navigate('/manager/dashboard')}
              className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/manager/attendance')}
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              <Users className="w-4 h-4 inline mr-2" />
              All Attendance
            </button>
            <button
              onClick={() => navigate('/manager/calendar')}
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Team Calendar
            </button>
            <button
              onClick={() => navigate('/manager/reports')}
              className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Reports
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Overview */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Today's Overview</h2>
          <p className="text-purple-100 mb-6">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{dashboardData.totalEmployees}</p>
              <p className="text-sm text-purple-100">Total Employees</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <CheckCircle className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{dashboardData.today.present}</p>
              <p className="text-sm text-purple-100">Present Today</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <XCircle className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{dashboardData.today.absent}</p>
              <p className="text-sm text-purple-100">Absent Today</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Clock className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{dashboardData.today.late}</p>
              <p className="text-sm text-purple-100">Late Arrivals</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Weekly Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Department-wise Attendance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Absent Employees Today */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Absent Employees Today</h3>
          {dashboardData.absentToday.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.absentToday.map((employee) => (
                <div
                  key={employee._id}
                  className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                    <span className="text-red-700 font-semibold">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.employeeId} - {employee.department}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">All employees are present today!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;