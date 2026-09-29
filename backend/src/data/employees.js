import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let rawEmployees = [];
try {
  const jsonPath = path.resolve(__dirname, '../../../data/employees.json');
  if (fs.existsSync(jsonPath)) {
    const data = fs.readFileSync(jsonPath, 'utf8');
    rawEmployees = JSON.parse(data);
  }
} catch (e) {
  console.warn('[Data] Notice reading employees.json, using built-in defaults:', e.message);
}

// Built-in defaults if file not present
if (!rawEmployees || rawEmployees.length === 0) {
  rawEmployees = [
    { employeeId: 'E1024', name: 'Arjun Rao', department: 'Finance', jobTitle: 'Analyst', device: 'Dell Latitude 5440', operatingSystem: 'Windows 11' },
    { employeeId: 'E1025', name: 'Sarah Chen', department: 'Design', jobTitle: 'Product Designer', device: 'MacBook Pro 16', operatingSystem: 'macOS Sonoma' },
    { employeeId: 'E1026', name: 'Michael Smith', department: 'Sales', jobTitle: 'Account Executive', device: 'Lenovo ThinkPad T14', operatingSystem: 'Windows 11' },
    { employeeId: 'E1027', name: 'Emma Johnson', department: 'Human Resources', jobTitle: 'HR Generalist', device: 'Microsoft Surface Pro 9', operatingSystem: 'Windows 11' },
    { employeeId: 'E1028', name: 'David Lee', department: 'Finance', jobTitle: 'Senior Controller', device: 'HP EliteBook 840 G9', operatingSystem: 'Windows 10' },
    { employeeId: 'E1029', name: 'Olivia Davis', department: 'Marketing', jobTitle: 'Content Strategist', device: 'MacBook Air M2', operatingSystem: 'macOS Ventura' },
    { employeeId: 'E1030', name: 'James Wilson', department: 'Engineering', jobTitle: 'Staff Software Engineer', device: 'Dell XPS 15 9530', operatingSystem: 'Windows 11' },
    { employeeId: 'E1031', name: 'Sophia Taylor', department: 'Operations', jobTitle: 'Logistics Coordinator', device: 'Lenovo ThinkPad X1 Carbon', operatingSystem: 'Windows 11' },
    { employeeId: 'E1032', name: 'William Brown', department: 'Product', jobTitle: 'Product Manager', device: 'MacBook Pro 14', operatingSystem: 'macOS Sonoma' },
    { employeeId: 'E1033', name: 'Isabella Miller', department: 'Legal', jobTitle: 'Legal Counsel', device: 'Microsoft Surface Laptop 5', operatingSystem: 'Windows 11' }
  ];
}

export const employees = rawEmployees.map(emp => ({
  id: emp.employeeId || emp.id,
  employeeId: emp.employeeId || emp.id,
  name: emp.name,
  department: emp.department,
  jobTitle: emp.jobTitle,
  device: emp.device,
  os: emp.operatingSystem || emp.os,
  operatingSystem: emp.operatingSystem || emp.os
}));

export function getEmployeeById(id) {
  return employees.find(e => e.id === id || e.employeeId === id);
}
