# Employee Attendance System

A complete, modern, real-time employee attendance tracking system built with React, Redux Toolkit, Node.js, Express, MongoDB, and Socket.IO.

## Features

### Employee Features
- ✅ Register and Login
- ✅ Mark Daily Attendance (Check In/Check Out)
- ✅ View Attendance History with Calendar View
- ✅ View Monthly Summary (Present/Absent/Late/Half-day)
- ✅ Real-time Dashboard with Statistics
- ✅ Profile Management

### Manager Features
- ✅ Login and Dashboard
- ✅ View All Employees Attendance
- ✅ Advanced Filtering (by date, employee, status, department)
- ✅ View Team Attendance Summary
- ✅ Export Attendance Reports (CSV)
- ✅ Real-time Team Status Updates
- ✅ Visual Analytics (Charts & Graphs)

## Tech Stack

### Frontend
- **React 18** - UI Framework
- **Redux Toolkit** - State Management
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Data Visualization
- **Socket.IO Client** - Real-time Updates
- **Axios** - HTTP Client
- **React Hot Toast** - Notifications
- **date-fns** - Date Utilities
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Hashing
- **Socket.IO** - Real-time Communication
- **json2csv** - CSV Export

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start MongoDB:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### Creating Test Accounts

1. **Register an Employee:**
   - Go to `http://localhost:5173/register`
   - Fill in details:
     - Name: John Doe
     - Email: employee@test.com
     - Password: password123
     - Department: Engineering
     - Role: Employee

2. **Register a Manager:**
   - Go to `http://localhost:5173/register`
   - Fill in details:
     - Name: Jane Manager
     - Email: manager@test.com
     - Password: password123
     - Department: Management
     - Role: Manager

### Employee Workflow

1. **Login** - Use employee credentials
2. **Check In** - Mark attendance at the start of the day
3. **View Dashboard** - See today's status and monthly statistics
4. **Check Out** - Mark checkout at end of day
5. **View History** - Check attendance calendar and table view
6. **View Profile** - See personal information

### Manager Workflow

1. **Login** - Use manager credentials
2. **Dashboard** - View team overview and analytics
3. **All Attendance** - See detailed attendance records with filters
4. **Team Calendar** - View who's present/absent today
5. **Reports** - Export attendance data as CSV

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - Get attendance history
- `GET /api/attendance/my-summary` - Get monthly summary
- `GET /api/attendance/today` - Get today's status

### Attendance (Manager)
- `GET /api/attendance/all` - Get all attendance
- `GET /api/attendance/employee/:id` - Get specific employee attendance
- `GET /api/attendance/summary` - Get team summary
- `GET /api/attendance/export` - Export to CSV
- `GET /api/attendance/today-status` - Get today's team status

### Dashboard
- `GET /api/dashboard/employee` - Employee dashboard data
- `GET /api/dashboard/manager` - Manager dashboard data

## Real-time Features

The system uses Socket.IO for real-time updates:
- Attendance check-in/check-out notifications
- Live team status updates
- Real-time dashboard refresh

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee/manager),
  employeeId: String (unique, auto-generated),
  department: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Attendance Schema
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: String (present/absent/late/half-day),
  totalHours: Number,
  notes: String,
  createdAt: Date
}
```

## Business Logic

### Attendance Rules
- Work hours: 9:00 AM - 6:00 PM
- Late arrival: After 9:15 AM
- Half-day: Less than 4 hours worked
- Auto-calculated total hours on checkout

### Status Determination
- **Present**: Checked in on time (before 9:15 AM)
- **Late**: Checked in after 9:15 AM
- **Half-day**: Total hours < 4
- **Absent**: No check-in record

## Project Structure

```
attendance-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with role-based access
- Token expiration (30 days)
- Input validation
- CORS protection

## Future Enhancements

- Leave management system
- Overtime tracking
- Email notifications
- Mobile app (React Native)
- Biometric integration
- Advanced analytics
- Multi-language support
- Dark mode

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Restart MongoDB
brew services restart mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Clear Browser Storage
If you encounter login issues:
1. Open browser DevTools (F12)
2. Go to Application/Storage
3. Clear Local Storage
4. Refresh the page

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please open an issue on GitHub.

---

