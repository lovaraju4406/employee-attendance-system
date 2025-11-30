import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
export const getEmployeeDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    // This month stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });

    const stats = {
      today: {
        status: todayAttendance ? 'checked-in' : 'not-checked-in',
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null
      },
      thisMonth: {
        present: monthAttendance.filter(a => a.status === 'present').length,
        absent: endOfMonth.getDate() - monthAttendance.length,
        late: monthAttendance.filter(a => a.status === 'late').length,
        totalHours: monthAttendance.reduce((sum, a) => sum + a.totalHours, 0).toFixed(2)
      },
      recent: recentAttendance
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
export const getManagerDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({ date: today })
      .populate('userId', 'name employeeId department');

    const presentToday = todayAttendance.filter(a => a.checkInTime).length;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;
    const absentToday = totalEmployees - todayAttendance.length;

    // Weekly trend (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo, $lte: today }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: 1 },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Department-wise attendance
    const departmentStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          }
        }
      }
    ]);

    // Absent employees today
    const presentEmployeeIds = todayAttendance.map(a => a.userId._id.toString());
    const absentEmployees = await User.find({
      role: 'employee',
      _id: { $nin: presentEmployeeIds }
    }).select('name employeeId department');

    res.json({
      totalEmployees,
      today: {
        present: presentToday,
        absent: absentToday,
        late: lateToday
      },
      weeklyTrend: weeklyAttendance,
      departmentStats,
      absentToday: absentEmployees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};