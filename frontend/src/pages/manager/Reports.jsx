import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, LogOut, Home, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { attendanceAPI } from '../../services/api';
import { logout } from '../../store/slices/authSlice';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exporting, setExporting] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleExport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setExporting(true);
    try {
      const response = await attendanceAPI.exportAttendance(dateRange);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
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
            <button onClick={() => navigate('/manager/calendar')} className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium">
              <Calendar className="w-4 h-4 inline mr-2" />Team Calendar
            </button>
            <button onClick={() => navigate('/manager/reports')} className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium">
              <FileText className="w-4 h-4 inline mr-2" />Reports
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Attendance Report</h2>
            <p className="text-gray-600">Download attendance data as CSV file</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {exporting ? 'Exporting...' : 'Export to CSV'}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Report Information</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• The report includes all employee attendance for the selected date range</li>
              <li>• CSV format can be opened in Excel, Google Sheets, or any spreadsheet software</li>
              <li>• Report includes: Employee ID, Name, Department, Date, Times, Hours, Status</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;