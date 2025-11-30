
// backend/src/routes/attendance.routes.js
import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getAllAttendance,
  exportAttendance
} from '../controllers/attendance.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyHistory);

// Manager routes
router.get('/all', authorize('manager'), getAllAttendance);
router.get('/export', authorize('manager'), exportAttendance);

export default router;