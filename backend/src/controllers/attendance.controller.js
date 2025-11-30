// backend/src/controllers/attendance.controller.js
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Check In
export const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId,
      date: { $gte: today }
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ 
        message: 'Already checked in today',
        attendance: existingAttendance 
      });
    }

    const checkInTime = new Date();
    const workStartTime = new Date(checkInTime);
    workStartTime.setHours(9, 0, 0, 0); // 9:00 AM

    const isLate = checkInTime > workStartTime;

    // Create or update attendance
    let attendance;
    if (existingAttendance) {
      attendance = existingAttendance;
      attendance.checkInTime = checkInTime;
      attendance.status = isLate ? 'late' : 'present';
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        userId,
        date: today,
        checkInTime,
        status: isLate ? 'late' : 'present'
      });
    }

    // Populate user details
    await attendance.populate('userId', 'name email department');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('attendance:checkin', {
        userId: attendance.userId._id,
        userName: attendance.userId.name,
        department: attendance.userId.department,
        checkInTime: attendance.checkInTime,
        status: attendance.status
      });
    }

    res.status(200).json({
      message: `Checked in successfully${isLate ? ' (Late)' : ''}`,
      attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      message: 'Error checking in', 
      error: error.message 
    });
  }
};

// Check Out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today }
    }).populate('userId', 'name email department');

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ 
        message: 'No check-in found for today' 
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ 
        message: 'Already checked out today',
        attendance 
      });
    }

    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;

    // Calculate work hours
    const diffMs = checkOutTime - attendance.checkInTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    attendance.workHours = parseFloat(diffHrs.toFixed(2));

    // Update status for half day
    if (attendance.workHours < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('attendance:checkout', {
        userId: attendance.userId._id,
        userName: attendance.userId.name,
        department: attendance.userId.department,
        checkOutTime: attendance.checkOutTime,
        workHours: attendance.workHours,
        status: attendance.status
      });
    }

    res.status(200).json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ 
      message: 'Error checking out', 
      error: error.message 
    });
  }
};

// Get today's status
export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today }
    }).populate('userId', 'name email department');

    res.status(200).json({
      attendance: attendance || null,
      hasCheckedIn: attendance ? !!attendance.checkInTime : false,
      hasCheckedOut: attendance ? !!attendance.checkOutTime : false
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ 
      message: 'Error fetching today\'s status', 
      error: error.message 
    });
  }
};

// Get my attendance history
export const getMyHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year, page = 1, limit = 10 } = req.query;

    let query = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (page - 1) * limit;

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email department');

    const total = await Attendance.countDocuments(query);

    // Get monthly stats
    const stats = await Attendance.aggregate([
      { $match: { userId: userId, ...query } },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          },
          lateDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
            }
          },
          halfDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0]
            }
          },
          totalWorkHours: { $sum: '$workHours' }
        }
      }
    ]);

    res.status(200).json({
      attendance,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        halfDays: 0,
        totalWorkHours: 0
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      message: 'Error fetching history', 
      error: error.message 
    });
  }
};

// Get all attendance (Manager only)
export const getAllAttendance = async (req, res) => {
  try {
    const { 
      department, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    let query = {};

    // Build query
    if (department && department !== 'all') {
      const users = await User.find({ department }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;

    let attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email department');

    // Apply search filter after population
    if (search) {
      attendance = attendance.filter(record => 
        record.userId.name.toLowerCase().includes(search.toLowerCase()) ||
        record.userId.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      attendance,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ 
      message: 'Error fetching attendance', 
      error: error.message 
    });
  }
};

// Export attendance as CSV
export const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (department && department !== 'all') {
      const users = await User.find({ department }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name email department');

    // Format data for CSV
    const csvData = attendance.map(record => ({
      Date: new Date(record.date).toLocaleDateString(),
      Name: record.userId.name,
      Email: record.userId.email,
      Department: record.userId.department,
      'Check In': record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
      'Check Out': record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
      'Work Hours': record.workHours || 0,
      Status: record.status
    }));

    res.status(200).json({
      data: csvData,
      filename: `attendance_${startDate}_${endDate}.csv`
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      message: 'Error exporting data', 
      error: error.message 
    });
  }
};