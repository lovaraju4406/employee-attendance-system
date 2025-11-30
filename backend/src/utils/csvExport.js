import { Parser } from 'json2csv';

export const generateCSV = (data, fields) => {
  try {
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    return csv;
  } catch (error) {
    throw new Error('Error generating CSV: ' + error.message);
  }
};

export const attendanceCSVFields = [
  { label: 'Employee ID', value: 'employeeId' },
  { label: 'Name', value: 'name' },
  { label: 'Department', value: 'department' },
  { label: 'Date', value: 'date' },
  { label: 'Check In', value: 'checkInTime' },
  { label: 'Check Out', value: 'checkOutTime' },
  { label: 'Total Hours', value: 'totalHours' },
  { label: 'Status', value: 'status' }
];