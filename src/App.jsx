import React, { useState, useEffect } from 'react';
import UserOverviewDashboard from './components/UserOverviewDashboard';
import AdminDashboard from './components/AdminDashboard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export default function App() {
  // Determine view mode from URL path (/admin) or URL query parameter (?mode=admin)
  const isAdminUrl = () => {
    const path = window.location.pathname;
    const search = window.location.search;
    return path.startsWith('/admin') || search.includes('mode=admin') || search.includes('admin=true');
  };

  const [viewMode] = useState(() => (isAdminUrl() ? 'admin' : 'user'));
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Không thể lấy danh sách nhân viên:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* View Content */}
      <main className="flex-1">
        {viewMode === 'admin' ? (
          <AdminDashboard
            employees={employees}
            onEmployeeAdded={fetchEmployees}
          />
        ) : (
          <UserOverviewDashboard employees={employees} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/80 bg-[#070a12]">
        BÁO CÁO 4D ONLINE • Hệ Thống Thống Kê Số Liệu Cá Nhân
      </footer>
    </div>
  );
}
