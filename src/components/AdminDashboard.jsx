import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  TrendingUp,
  CreditCard,
  DollarSign,
  LogOut,
  BarChart3,
  Calendar,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Send,
  Clock,
  Bot,
  Link,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function AdminDashboard({ employees, onEmployeeAdded }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'employees' | 'reports' | 'telegram'

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [statsData, setStatsData] = useState({
    summary: {
      totalRegistered: 0,
      totalFirstDeposit: 0,
      grandTotalDeposit: 0,
      grandTotalBet: 0,
      totalReports: 0,
    },
    dailyStats: [],
    employeeStats: [],
  });

  const [reportsList, setReportsList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', code: '' });
  const [empStatus, setEmpStatus] = useState({ type: '', message: '' });
  const [empLoading, setEmpLoading] = useState(false);

  // Telegram Config State
  const [teleConfig, setTeleConfig] = useState({
    botToken: '',
    chatId: '',
    scheduleTime: '13:00',
    feUrl: 'https://baocao4d.online',
    enabled: true,
    messageText: '',
    unreportedEnabled: true,
    unreportedScheduleTime: '18:00',
    unreportedMessageText: '',
  });
  const [teleStatus, setTeleStatus] = useState({ type: '', message: '' });
  const [teleLoading, setTeleLoading] = useState(false);
  const [telePreviewMode, setTelePreviewMode] = useState('general'); // 'general' | 'unreported'
  const [unreportedStatus, setUnreportedStatus] = useState({
    missingEmployees: [],
    totalEmployeesCount: 0,
    todayFormatted: '',
  });

  // Change Password State
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passStatus, setPassStatus] = useState({ type: '', message: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchTeleConfig();
      fetchUnreportedStatus();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [resStats, resReports] = await Promise.all([
        fetch(`${API_BASE}/reports/stats`),
        fetch(`${API_BASE}/reports`),
      ]);

      if (resStats.ok) {
        const sData = await resStats.json();
        setStatsData(sData);
      }
      if (resReports.ok) {
        const rData = await resReports.json();
        setReportsList(rData);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTeleConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/config`);
      if (res.ok) {
        const data = await res.json();
        setTeleConfig(data);
      }
    } catch (err) {
      console.error('Lỗi lấy cấu hình Telegram:', err);
    }
  };

  const fetchUnreportedStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/unreported-status`);
      if (res.ok) {
        const data = await res.json();
        setUnreportedStatus(data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách chưa báo cáo:', err);
    }
  };

  const handleSaveTeleConfig = async (e) => {
    if (e) e.preventDefault();
    setTeleLoading(true);
    setTeleStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/telegram/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teleConfig),
      });

      if (!res.ok) throw new Error('Lỗi lưu cấu hình Telegram');
      setTeleStatus({ type: 'success', message: 'Đã lưu toàn bộ cấu hình Bot Telegram thành công!' });
    } catch (err) {
      setTeleStatus({ type: 'error', message: err.message });
    } finally {
      setTeleLoading(false);
    }
  };

  const handleTestSendTelegram = async () => {
    setTeleLoading(true);
    setTeleStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/telegram/send-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teleConfig),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi tin nhắn Telegram');

      setTeleStatus({ type: 'success', message: '🚀 Đã gửi tin nhắn nhắc báo cáo chung Telegram thành công vào nhóm!' });
    } catch (err) {
      setTeleStatus({ type: 'error', message: err.message });
    } finally {
      setTeleLoading(false);
    }
  };

  const handleTestSendUnreportedTelegram = async () => {
    setTeleLoading(true);
    setTeleStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/telegram/send-unreported-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teleConfig),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi tin nhắn Telegram');

      setTeleStatus({
        type: 'success',
        message: `🚀 Đã gửi tin nhắn nhắc nhở nhân viên chưa báo cáo vào ${data.count} nhóm! (Còn ${data.missingCount} nhân viên chưa báo cáo hôm nay)`,
      });
      fetchUnreportedStatus();
    } catch (err) {
      setTeleStatus({ type: 'error', message: err.message });
    } finally {
      setTeleLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('adminToken', data.accessToken);
      setToken(data.accessToken);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('adminToken');
    setToken('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.oldPassword || !passForm.newPassword) {
      setPassStatus({ type: 'error', message: 'Vui lòng nhập đầy đủ Mật khẩu hiện tại và Mật khẩu mới!' });
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassStatus({ type: 'error', message: 'Mật khẩu mới và Nhập lại mật khẩu không trùng khớp!' });
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassStatus({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }
    setPassLoading(true);
    setPassStatus({ type: '', message: '' });
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passForm.oldPassword,
          newPassword: passForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại!');
      }
      setPassStatus({ type: 'success', message: data.message || 'Đổi mật khẩu Admin thành công!' });
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassStatus({ type: 'error', message: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.code) {
      setEmpStatus({ type: 'error', message: 'Vui lòng điền đủ Tên và Mã hậu đài!' });
      return;
    }

    setEmpLoading(true);
    setEmpStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi thêm nhân viên');
      }

      setEmpStatus({ type: 'success', message: `Đã thêm nhân viên ${data.name} (${data.code})!` });
      setNewEmp({ name: '', code: '' });
      if (onEmployeeAdded) onEmployeeAdded();
      setTimeout(() => {
        setShowAddEmpModal(false);
        setEmpStatus({ type: '', message: '' });
      }, 1200);
    } catch (err) {
      setEmpStatus({ type: 'error', message: err.message });
    } finally {
      setEmpLoading(false);
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${emp.name} (${emp.code}) không?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/employees/${emp.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Không thể xóa nhân viên');
      }
      if (onEmployeeAdded) onEmployeeAdded();
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const [selectedAdminEmpCode, setSelectedAdminEmpCode] = useState('ALL');

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  // Active selected employee details
  const activeAdminEmp = employees.find(
    (e) => e.code.toLowerCase() === selectedAdminEmpCode.toLowerCase()
  );

  const adminMatchingCodes = new Set(
    selectedAdminEmpCode === 'ALL'
      ? []
      : [
          selectedAdminEmpCode.trim().toLowerCase(),
          (activeAdminEmp?.code || '').trim().toLowerCase(),
          (activeAdminEmp?.name || '').trim().toLowerCase(),
        ].filter(Boolean)
  );

  // Filter raw reports list for selected employee (or keep all if ALL)
  const filteredReportsList = selectedAdminEmpCode === 'ALL'
    ? reportsList
    : reportsList.filter((r) => {
        const empCode = (r.employeeCode || '').trim().toLowerCase();
        const empName = (r.employeeName || '').trim().toLowerCase();
        return adminMatchingCodes.has(empCode) || adminMatchingCodes.has(empName);
      });

  // Dynamic summary metrics for selected employee or ALL
  const displaySummary = selectedAdminEmpCode === 'ALL'
    ? {
        totalRegistered: statsData.summary?.totalRegistered || 0,
        totalFirstDeposit: statsData.summary?.totalFirstDeposit || 0,
        totalDepositors: statsData.summary?.totalDepositors || filteredReportsList.reduce((sum, r) => sum + (Number(r.depositorsCount) || 0), 0),
        grandTotalDeposit: statsData.summary?.grandTotalDeposit || 0,
        grandTotalBet: statsData.summary?.grandTotalBet || 0,
        turnoverRatio: (statsData.summary?.grandTotalDeposit || 0) > 0
          ? Math.round((statsData.summary?.grandTotalBet || 0) / (statsData.summary?.grandTotalDeposit || 1))
          : 0,
        totalReports: statsData.summary?.totalReports || filteredReportsList.length,
      }
    : {
        totalRegistered: filteredReportsList.reduce((sum, r) => sum + (Number(r.registeredCount) || 0), 0),
        totalFirstDeposit: filteredReportsList.reduce((sum, r) => sum + (Number(r.firstDepositCount) || 0), 0),
        totalDepositors: filteredReportsList.reduce((sum, r) => sum + (Number(r.depositorsCount) || 0), 0),
        grandTotalDeposit: filteredReportsList.reduce((sum, r) => sum + (Number(r.totalDeposit) || 0), 0),
        grandTotalBet: filteredReportsList.reduce((sum, r) => sum + (Number(r.totalBet) || 0), 0),
        turnoverRatio: filteredReportsList.reduce((sum, r) => sum + (Number(r.totalDeposit) || 0), 0) > 0
          ? Math.round(
              filteredReportsList.reduce((sum, r) => sum + (Number(r.totalBet) || 0), 0) /
              filteredReportsList.reduce((sum, r) => sum + (Number(r.totalDeposit) || 0), 0)
            )
          : 0,
        totalReports: filteredReportsList.length,
      };

  // Dynamic chart data calculation
  const generateAdminChartData = () => {
    const dailyMap = new Map();

    filteredReportsList.forEach((r) => {
      if (!r.date) return;
      const dateKey = r.date;
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { dateKey, registered: 0, firstDeposit: 0, totalDeposit: 0, totalBet: 0 });
      }
      const cur = dailyMap.get(dateKey);
      cur.registered += Number(r.registeredCount) || 0;
      cur.firstDeposit += Number(r.firstDepositCount) || 0;
      cur.totalDeposit += Number(r.totalDeposit) || 0;
      cur.totalBet += Number(r.totalBet) || 0;
    });

    if (dailyMap.size === 0 && selectedAdminEmpCode === 'ALL' && statsData.dailyStats && statsData.dailyStats.length > 0) {
      statsData.dailyStats.forEach((item) => {
        if (!item.date) return;
        dailyMap.set(item.date, {
          dateKey: item.date,
          registered: item.registered || 0,
          firstDeposit: item.firstDeposit || 0,
          totalDeposit: item.totalDeposit || 0,
          totalBet: item.totalBet || 0,
        });
      });
    }

    // Sort chronologically by ISO date (YYYY-MM-DD)
    const sortedList = Array.from(dailyMap.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    return sortedList.map((item) => {
      const parts = item.dateKey.split('-');
      const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.dateKey;
      return {
        dateFormatted: formatted,
        dateKey: item.dateKey,
        registered: item.registered,
        firstDeposit: item.firstDeposit,
        totalDepositK: Math.round(item.totalDeposit / 1000),
        totalBetK: Math.round(item.totalBet / 1000),
      };
    });
  };

  const chartData = generateAdminChartData();

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-8 text-white">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Đăng nhập Admin</h2>
            <p className="text-slate-400 text-sm mt-1">Truy cập Bảng điều khiển quản trị số liệu</p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-medium border border-rose-500/20 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Tài khoản</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="Tên tài khoản"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="Mật khẩu"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all mt-2"
            >
              {loginLoading ? 'Đang xác thực...' : 'Đăng nhập Admin'}
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#070a12] text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-[#0b0f19] rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800/80 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <span>QUẢN TRỊ & THỐNG KÊ SỐ LIỆU</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Bảng tổng hợp báo cáo doanh số & nhân viên</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo Nhân Viên</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Biểu Đồ & Thống Kê</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'telegram'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Bot Telegram Tự Động</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'employees'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Nhân Viên ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Lịch Sử Báo Cáo ({reportsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'password'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Đổi Mật Khẩu Admin</span>
        </button>
      </div>

      {/* TELEGRAM BOT TAB */}
      {activeTab === 'telegram' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Config */}
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-indigo-400" />
                <span>Cấu Hình Telegram Bot Nhắc Báo Cáo</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Cấu hình Bot tự động nhắc nhở chung và nhắc danh sách nhân viên chưa báo cáo</p>
            </div>

            {teleStatus.message && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  teleStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {teleStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{teleStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveTeleConfig} className="space-y-6">
              {/* SHARED CONFIG (TOKEN, CHAT ID, WEB URL) */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">1. Thông Tin Dùng Chung (Bot Token & Nhóm)</h4>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Telegram Bot Token (Từ @BotFather)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 123456789:ABCdefGhIJKlmNoPQrsTUVwxyZ"
                    value={teleConfig.botToken || ''}
                    onChange={(e) => setTeleConfig({ ...teleConfig, botToken: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Chat ID Nhóm Telegram
                  </label>
                  <input
                    type="text"
                    placeholder="VD: -1001234567890"
                    value={teleConfig.chatId || ''}
                    onChange={(e) => setTeleConfig({ ...teleConfig, chatId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Link Web Báo Cáo (Cho nút bấm)
                  </label>
                  <div className="relative">
                    <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="https://baocao6f.online"
                      value={teleConfig.feUrl || ''}
                      onChange={(e) => setTeleConfig({ ...teleConfig, feUrl: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* BOT TYPE 1: GENERAL DAILY REMINDER */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">2. Bot Nhắc Báo Cáo Chung (Hằng Ngày)</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(teleConfig.enabled)}
                      onChange={(e) => setTeleConfig({ ...teleConfig, enabled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-300">Kích hoạt</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Khung giờ tự động gửi:</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="13:00"
                        value={teleConfig.scheduleTime || '13:00'}
                        onChange={(e) => setTeleConfig({ ...teleConfig, scheduleTime: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nội dung tin nhắn nhắc chung:</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập nội dung tin nhắn Telegram..."
                    value={teleConfig.messageText || ''}
                    onChange={(e) => setTeleConfig({ ...teleConfig, messageText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestSendTelegram}
                  disabled={teleLoading}
                  className="w-full py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Test Gửi Nhắc Báo Cáo Chung</span>
                </button>
              </div>

              {/* BOT TYPE 2: UNREPORTED EMPLOYEES REMINDER */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider">3. Bot Nhắc Nhân Viên Chưa Báo Cáo</h4>
                    <p className="text-[11px] text-slate-400">Tự động check danh sách ai chưa nộp báo cáo trong ngày</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(teleConfig.unreportedEnabled)}
                      onChange={(e) => setTeleConfig({ ...teleConfig, unreportedEnabled: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-300">Kích hoạt</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Khung giờ tự động gửi:</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="18:00"
                        value={teleConfig.unreportedScheduleTime || '18:00'}
                        onChange={(e) => setTeleConfig({ ...teleConfig, unreportedScheduleTime: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-400 bg-slate-800 px-3 py-2 rounded-xl w-full">
                      Chưa báo cáo hôm nay: <b className="text-amber-400">{unreportedStatus.missingEmployees?.length || 0}</b> / {unreportedStatus.totalEmployeesCount || employees.length} nhân viên
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-400">Mẫu tin nhắn nhắc chưa báo cáo:</label>
                    <span className="text-[10px] text-indigo-400 font-mono">Dùng {`{LIST}`} để tự động chèn danh sách</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Mẫu tin nhắn nhắc nhân viên chưa báo cáo..."
                    value={teleConfig.unreportedMessageText || ''}
                    onChange={(e) => setTeleConfig({ ...teleConfig, unreportedMessageText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono leading-relaxed outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Các biến tự động: <code className="text-amber-300 font-bold">{`{LIST}`}</code> (danh sách tên + mã), <code className="text-amber-300 font-bold">{`{DATE}`}</code> (ngày), <code className="text-amber-300 font-bold">{`{COUNT}`}</code> (số người chưa nộp).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestSendUnreportedTelegram}
                  disabled={teleLoading}
                  className="w-full py-2 bg-amber-600/80 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Test Gửi Nhắc Nhân Viên Chưa Báo Cáo</span>
                </button>
              </div>

              {/* SAVE ALL BUTTON */}
              <button
                type="submit"
                disabled={teleLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20"
              >
                {teleLoading ? 'Đang lưu...' : 'Lưu Tất Cả Cấu Hình Bot Telegram'}
              </button>
            </form>
          </div>

          {/* TELEGRAM MESSAGE LIVE PREVIEW */}
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-4 h-fit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Xem Trước Tin Nhắn Telegram</span>
              </h3>

              {/* Toggle preview mode */}
              <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTelePreviewMode('general')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    telePreviewMode === 'general'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🤖 Nhắc Chung
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTelePreviewMode('unreported');
                    fetchUnreportedStatus();
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    telePreviewMode === 'unreported'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚠️ Nhắc Chưa Báo Cáo ({unreportedStatus.missingEmployees?.length || 0})
                </button>
              </div>
            </div>

            {/* Telegram Message Box Card */}
            <div className="bg-[#182533] rounded-2xl p-4 text-slate-100 space-y-3 border border-slate-700/50 shadow-inner font-sans">
              <div className="text-xs text-blue-400 font-bold flex items-center justify-between border-b border-slate-700/50 pb-2">
                <span>
                  {telePreviewMode === 'general'
                    ? '🤖📊 BOT BÁO CÁO HẰNG NGÀY 📊🤖'
                    : '⚠️ BOT NHẮC CHƯA BÁO CÁO ⚠️'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {telePreviewMode === 'general'
                    ? `Giờ gửi: ${teleConfig.scheduleTime || '13:00'}`
                    : `Giờ gửi: ${teleConfig.unreportedScheduleTime || '18:00'}`}
                </span>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {telePreviewMode === 'general' ? (
                  teleConfig.messageText || (
                    <>
                      Tới giờ báo cáo số liệu hôm nay rồi nha anh em ✨<br /><br />
                      Mọi người chỉ cần bấm nút bên dưới và nhập CODE cá nhân là có thể báo cáo ngay 🚀<br /><br />
                      📝 Nếu nhập sai số liệu vẫn có thể vào chỉnh sửa lại sau đó nha~<br /><br />
                      ⚠️ Mọi người nhớ báo cáo đầy đủ và đúng giờ quy định.<br /><br />
                      Đúng {teleConfig.scheduleTime || '13:00'} ngày mai em sẽ tổng hợp lại danh sách các trường hợp:<br />
                      • Chưa báo cáo<br />
                      • Báo cáo thiếu<br />
                      • Báo sai số liệu<br /><br />
                      và gửi anh NICE (@N_I_C_E_838) để xử lý theo quy định của team 😈
                    </>
                  )
                ) : (
                  (() => {
                    const template = teleConfig.unreportedMessageText || `⚠️ DANH SÁCH NHÂN VIÊN CHƯA BÁO CÁO HÔM NAY ({DATE}) ⚠️\n\nHôm nay vẫn còn {COUNT} nhân viên chưa gửi báo cáo:\n{LIST}\n\n📢 Mọi người khẩn trương bấm nút bên dưới nộp báo cáo đúng giờ nhé! 🚀`;
                    const missingEmps = unreportedStatus.missingEmployees || [];
                    const dateStr = unreportedStatus.todayFormatted || new Date().toLocaleDateString('vi-VN');

                    if (missingEmps.length > 0) {
                      const listText = missingEmps
                        .map((emp, i) => `${i + 1}. ${emp.name} (Mã: ${emp.code})`)
                        .join('\n');

                      if (template.includes('{LIST}')) {
                        return template
                          .replace(/{LIST}/g, listText)
                          .replace(/{DATE}/g, dateStr)
                          .replace(/{COUNT}/g, String(missingEmps.length));
                      }
                      return `${template}\n\nDanh sách chưa báo cáo:\n${listText}`;
                    }

                    return `🎉 TẤT CẢ NHÂN VIÊN ĐÃ BÁO CÁO ĐẦY ĐỦ NGÀY ${dateStr} 🎉\n\nCảm ơn toàn thể anh em team đã nộp báo cáo số liệu đúng giờ! ❤️`;
                  })()
                )}
              </div>

              {/* Telegram Inline Buttons */}
              <div className="pt-2 space-y-2">
                <a
                  href={teleConfig.feUrl || 'http://localhost:5173/'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#2b5278] hover:bg-[#34608c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-blue-400/20 shadow-sm transition-all"
                >
                  <span>📝 Báo Cáo Ngay</span>
                </a>

                <a
                  href={`${teleConfig.feUrl || 'http://localhost:5173/'}?mode=admin`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#2b5278] hover:bg-[#34608c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-blue-400/20 shadow-sm transition-all"
                >
                  <span>🔗 Dashboard</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Employee Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b0f19] p-4.5 rounded-2xl border border-slate-800/90 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Xem Số Liệu Nhân Viên</span>
                  {selectedAdminEmpCode !== 'ALL' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30 uppercase">
                      {activeAdminEmp?.name || selectedAdminEmpCode}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">Chọn tên nhân viên để xem toàn bộ biểu đồ & doanh số chi tiết</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nhân viên:</span>
              <select
                value={selectedAdminEmpCode}
                onChange={(e) => setSelectedAdminEmpCode(e.target.value)}
                className="bg-transparent font-bold text-sm text-indigo-400 outline-none cursor-pointer uppercase font-mono w-full sm:w-64"
              >
                <option value="ALL" className="bg-slate-900 text-white">🌐 TẤT CẢ NHÂN VIÊN (TỔNG HỢP)</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.code} className="bg-slate-900 text-white">
                    👤 {emp.name} ({emp.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6 KPI Cards: ĐĂNG KÝ | KHÁCH MỚI | SỐ NGƯỜI NẠP | NẠP CƯỢC | TỔNG CƯỢC | VÒNG CƯỢC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-[#0b0f19] p-4.5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đăng Ký</p>
                <h3 className="text-xl font-black text-white">{displaySummary.totalRegistered}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-4.5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khách Mới</p>
                <h3 className="text-xl font-black text-white">{displaySummary.totalFirstDeposit}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-4.5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số Người Nạp</p>
                <h3 className="text-xl font-black text-cyan-400">{displaySummary.totalDepositors}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-4.5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nạp Cược</p>
                <h3 className="text-base font-black text-amber-400">{formatVND(displaySummary.grandTotalDeposit)}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-4.5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Cược</p>
                <h3 className="text-base font-black text-purple-400">{formatVND(displaySummary.grandTotalBet)}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-4.5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                x
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vòng Cược</p>
                <h3 className="text-xl font-black text-indigo-400">{displaySummary.turnoverRatio} vòng</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  Tổng Nạp & Tổng Cược
                </h3>
                <div className="flex items-center gap-5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                    <span className="text-slate-300">Tổng Nạp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50"></span>
                    <span className="text-slate-300">Tổng Cược</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminGlowDeposit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="adminGlowBet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}K`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="totalBetK" name="Tổng cược" stroke="#c084fc" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowBet)" />
                    <Area type="monotone" dataKey="totalDepositK" name="Tổng nạp" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowDeposit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  Đăng Ký & Khách Mới (Nạp Lần Đầu)
                </h3>
                <div className="flex items-center gap-5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></span>
                    <span className="text-slate-300">Đăng ký</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                    <span className="text-slate-300">Khách mới (Nạp đầu)</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminGlowReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="adminGlowFirst" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="firstDeposit" name="Khách mới" stroke="#34d399" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowFirst)" />
                    <Area type="monotone" dataKey="registered" name="Đăng ký" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowReg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Thống Kê Doanh Số Theo Nhân Viên (Bấm để xem chi tiết)</span>
              </h3>
              {selectedAdminEmpCode !== 'ALL' && (
                <button
                  onClick={() => setSelectedAdminEmpCode('ALL')}
                  className="text-xs font-bold text-indigo-400 hover:underline"
                >
                  ↺ Quay lại tất cả nhân viên
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                  <tr>
                    <th className="p-3">Mã Hậu Đài</th>
                    <th className="p-3">Tên Nhân Viên</th>
                    <th className="p-3 text-center">Số Lượt Báo Cáo</th>
                    <th className="p-3 text-center">Đăng Ký</th>
                    <th className="p-3 text-center">Khách Mới</th>
                    <th className="p-3 text-center">Số Người Nạp</th>
                    <th className="p-3 text-right">Nạp Cược</th>
                    <th className="p-3 text-right">Tổng Cược</th>
                    <th className="p-3 text-center">Vòng Cược</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {statsData.employeeStats.map((emp) => {
                    const isSelected = selectedAdminEmpCode.toLowerCase() === emp.employeeCode.toLowerCase();
                    const empVongCuoc = emp.totalDeposit > 0 ? Math.round(emp.totalBet / emp.totalDeposit) : 0;
                    return (
                      <tr
                        key={emp.employeeCode}
                        onClick={() => setSelectedAdminEmpCode(emp.employeeCode)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'bg-indigo-600/20 border-l-4 border-indigo-500' : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-indigo-400">{emp.employeeCode}</td>
                        <td className="p-3 font-medium text-white">{emp.employeeName}</td>
                        <td className="p-3 text-center font-bold text-slate-300">{emp.reportCount}</td>
                        <td className="p-3 text-center font-semibold text-blue-400">{emp.registered}</td>
                        <td className="p-3 text-center font-semibold text-emerald-400">{emp.firstDeposit}</td>
                        <td className="p-3 text-center font-bold text-cyan-400">{emp.depositors || 0}</td>
                        <td className="p-3 text-right font-bold text-amber-400">{formatVND(emp.totalDeposit)}</td>
                        <td className="p-3 text-right font-bold text-purple-400">{formatVND(emp.totalBet)}</td>
                        <td className="p-3 text-center font-bold text-indigo-400">{empVongCuoc} vòng</td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDeleteEmployee({ id: emp.employeeCode, code: emp.employeeCode, name: emp.employeeName })}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-all"
                            title="Xóa nhân viên & toàn bộ số liệu thống kê"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Danh Sách Nhân Viên</h3>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Nhân Viên Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Tên Nhân Viên</th>
                  <th className="p-3">Mã Hậu Đài</th>
                  <th className="p-3">Ngày Tạo</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-slate-900/60 transition-all">
                    <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-white uppercase">{emp.name}</td>
                    <td className="p-3 font-mono font-bold text-indigo-400">{emp.code}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(emp.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all"
                        title="Xóa nhân viên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS HISTORY TAB */}
      {activeTab === 'reports' && (
        <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Lịch Sử Chi Tiết Các Báo Cáo Đã Gửi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                <tr>
                  <th className="p-3">Thời Gian Gửi</th>
                  <th className="p-3">Ngày Báo Cáo</th>
                  <th className="p-3">Mã Hậu Đài</th>
                  <th className="p-3">Tên Nhân Viên</th>
                  <th className="p-3 text-center">Khách ĐK</th>
                  <th className="p-3 text-center">Khách Nạp Đầu</th>
                  <th className="p-3 text-center">Số Người Nạp</th>
                  <th className="p-3 text-right">Tổng Nạp</th>
                  <th className="p-3 text-right">Tổng Cược</th>
                  <th className="p-3 text-center">Vòng Cược</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportsList.map((r) => {
                  const repVongCuoc = (Number(r.totalDeposit) || 0) > 0
                    ? Math.round((Number(r.totalBet) || 0) / Number(r.totalDeposit))
                    : 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-900/60 transition-all">
                      <td className="p-3 text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{r.date}</td>
                      <td className="p-3 font-mono font-bold text-indigo-400">{r.employeeCode}</td>
                      <td className="p-3 font-medium text-white">{r.employeeName}</td>
                      <td className="p-3 text-center font-bold text-blue-400">{r.registeredCount}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{r.firstDepositCount}</td>
                      <td className="p-3 text-center font-bold text-cyan-400">{r.depositorsCount || 0}</td>
                      <td className="p-3 text-right font-bold text-amber-400">{formatVND(r.totalDeposit)}</td>
                      <td className="p-3 text-right font-bold text-purple-400">{formatVND(r.totalBet)}</td>
                      <td className="p-3 text-center font-bold text-indigo-400">{repVongCuoc} vòng</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD TAB */}
      {activeTab === 'password' && (
        <div className="max-w-md mx-auto bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-400" />
              <span>Đổi Mật Khẩu Admin</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Cập nhật mật khẩu quản trị hệ thống</p>
          </div>

          {passStatus.message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                passStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {passStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              )}
              <span>{passStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passForm.oldPassword}
                onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {passLoading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Cập Nhật Mật Khẩu</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-white">
            <h3 className="text-xl font-bold text-white mb-1">Tạo Nhân Viên Mới</h3>
            <p className="text-xs text-slate-400 mb-4">Thêm mã hậu đài để nhân viên báo cáo số liệu</p>

            {empStatus.message && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  empStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {empStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{empStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Tên Nhân Viên</label>
                <input
                  type="text"
                  placeholder="Ví dụ: GHE BIFRONS"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Mã Hậu Đài</label>
                <input
                  type="text"
                  placeholder="Ví dụ: GG88F4D04"
                  value={newEmp.code}
                  onChange={(e) => setNewEmp({ ...newEmp, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase font-mono font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all border border-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={empLoading}
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {empLoading ? 'Đang tạo...' : 'Xác Nhận Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
