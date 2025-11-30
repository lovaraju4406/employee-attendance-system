import express from 'express';
import { getEmployeeDashboard, getManagerDashboard } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/employee', protect, authorize('employee'), getEmployeeDashboard);
router.get('/manager', protect, authorize('manager'), getManagerDashboard);

export default router;