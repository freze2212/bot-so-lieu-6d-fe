import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  TrendingUp,
  CreditCard,
  DollarSign,
  PlusCircle,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import UserReportForm from './UserReportForm';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function UserOverviewDashboard({ employees = [] }) {
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState(() => localStorage.getItem('authorizedEmpCode') || '');
  const [granularity, setGranularity] = useState('day');
  const [showReportModal, setShowReportModal] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(() => Boolean(localStorage.getItem('authorizedEmpCode')));

  const [allReports, setAllReports] = useState([]);
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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [selectedEmployeeCode, granularity]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [resStats, resReports] = await Promise.all([
        fetch(`${API_BASE}/reports/stats?employeeCode=${encodeURIComponent(selectedEmployeeCode)}`),
        fetch(`${API_BASE}/reports`),
      ]);

      if (resStats.ok) {
        const data = await resStats.json();
        setStatsData(data);
      }
      if (resReports.ok) {
        const rData = await resReports.json();
        setAllReports(Array.isArray(rData) ? rData : []);
      }
    } catch (err) {
      console.error('Lỗi tải thống kê user:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentEmp = employees.find(
    (e) => e.code.toLowerCase() === selectedEmployeeCode.toLowerCase()
  ) || { name: '', code: selectedEmployeeCode || '' };

  // Strict matching set for selected employee
  const matchingCodes = new Set([
    selectedEmployeeCode.trim().toLowerCase(),
    (currentEmp.code || '').trim().toLowerCase(),
    (currentEmp.name || '').trim().toLowerCase(),
  ].filter(Boolean));

  // Filter raw reports strictly for current employee
  const employeeReports = allReports.filter((r) => {
    const empCode = (r.employeeCode || '').trim().toLowerCase();
    const empName = (r.employeeName || '').trim().toLowerCase();
    return matchingCodes.has(empCode) || matchingCodes.has(empName);
  });

  // KPI & Summary calculation for selected employee
  const empStat = {
    registered: employeeReports.length > 0
      ? employeeReports.reduce((sum, r) => sum + (Number(r.registeredCount) || 0), 0)
      : (statsData.summary?.totalRegistered || 0),
    firstDeposit: employeeReports.length > 0
      ? employeeReports.reduce((sum, r) => sum + (Number(r.firstDepositCount) || 0), 0)
      : (statsData.summary?.totalFirstDeposit || 0),
    depositors: employeeReports.length > 0
      ? employeeReports.reduce((sum, r) => sum + (Number(r.depositorsCount) || 0), 0)
      : (statsData.summary?.totalDepositors || 0),
    totalDeposit: employeeReports.length > 0
      ? employeeReports.reduce((sum, r) => sum + (Number(r.totalDeposit) || 0), 0)
      : (statsData.summary?.grandTotalDeposit || 0),
    totalBet: employeeReports.length > 0
      ? employeeReports.reduce((sum, r) => sum + (Number(r.totalBet) || 0), 0)
      : (statsData.summary?.grandTotalBet || 0),
    turnoverRatio: 0,
    reportCount: employeeReports.length > 0 ? employeeReports.length : (statsData.summary?.totalReports || 0),
  };
  empStat.turnoverRatio = empStat.totalDeposit > 0
    ? Math.round(empStat.totalBet / empStat.totalDeposit)
    : 0;

  // Build per-day aggregated map for this employee
  const empDailyMap = new Map();
  employeeReports.forEach((r) => {
    const dateKey = r.date;
    if (!empDailyMap.has(dateKey)) {
      empDailyMap.set(dateKey, {
        registered: 0,
        firstDeposit: 0,
        depositors: 0,
        totalDeposit: 0,
        totalBet: 0,
      });
    }
    const cur = empDailyMap.get(dateKey);
    cur.registered += Number(r.registeredCount) || 0;
    cur.firstDeposit += Number(r.firstDepositCount) || 0;
    cur.depositors += Number(r.depositorsCount) || 0;
    cur.totalDeposit += Number(r.totalDeposit) || 0;
    cur.totalBet += Number(r.totalBet) || 0;
  });

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  // Prepare chart data with exact date formatting (DD/MM) & chronological sorting
  const generateExactChartData = () => {
    const dateMap = new Map();

    // Overlay filtered employee daily data
    if (empDailyMap.size > 0) {
      empDailyMap.forEach((val, dateKey) => {
        if (!dateKey) return;
        dateMap.set(dateKey, {
          dateKey,
          registered: val.registered || 0,
          firstDeposit: val.firstDeposit || 0,
          totalDeposit: val.totalDeposit || 0,
          totalBet: val.totalBet || 0,
        });
      });
    } else if (statsData.dailyStats && statsData.dailyStats.length > 0) {
      statsData.dailyStats.forEach((item) => {
        const itemCode = (item.employeeCode || '').trim().toLowerCase();
        if ((!itemCode || matchingCodes.has(itemCode)) && item.date) {
          dateMap.set(item.date, {
            dateKey: item.date,
            registered: item.registered || 0,
            firstDeposit: item.firstDeposit || 0,
            totalDeposit: item.totalDeposit || 0,
            totalBet: item.totalBet || 0,
          });
        }
      });
    }

    // Sort chronologically by ISO date YYYY-MM-DD
    const sortedList = Array.from(dateMap.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    return sortedList.map((item) => {
      const parts = item.dateKey.split('-');
      const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.dateKey;
      return {
        dateFormatted: formatted,
        dateKey: item.dateKey,
        registered: item.registered,
        firstDeposit: item.firstDeposit,
        totalDeposit: Math.round((item.totalDeposit || 0) / 1000), // convert to K
        totalBet: Math.round((item.totalBet || 0) / 1000), // convert to K
      };
    });
  };

  const chartData = generateExactChartData();

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header / App Bar */}
      <header className="bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Title & Employee Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/25">
                📊
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>BÁO CÁO</span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">v1.2.0</span>
                </h1>
                <p className="text-xs text-slate-400">Trang Tổng Quan Cá Nhân & Số Liệu</p>
              </div>
            </div>

            {/* Employee Selector Pill */}
            <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Nhân viên:</span>
              <select
                value={selectedEmployeeCode}
                onChange={(e) => setSelectedEmployeeCode(e.target.value)}
                className="bg-transparent font-bold text-sm text-indigo-400 outline-none cursor-pointer uppercase font-mono"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.code} className="bg-slate-900 text-white">
                    {emp.name} ({emp.code})
                  </option>
                ))}
                {employees.length === 0 && <option value="" className="bg-slate-900 text-white">Chưa có nhân viên</option>}
              </select>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Granularity Dropdown */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs font-bold">
              <button
                onClick={() => setGranularity('day')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  granularity === 'day' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Theo ngày
              </button>
              <button
                onClick={() => setGranularity('week')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  granularity === 'week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Theo tuần
              </button>
              <button
                onClick={() => setGranularity('month')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  granularity === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Theo tháng
              </button>
            </div>

            {/* Open User Report Form Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>Gửi Báo Cáo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* 6 KPI Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Đăng Ký */}
          <div className="bg-[#0b0f19] rounded-2xl p-4 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đăng Ký</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-white">{empStat.registered}</h3>
            </div>
          </div>

          {/* Card 2: Nạp Lần Đầu */}
          <div className="bg-[#0b0f19] rounded-2xl p-4 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nạp Lần Đầu</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-white">{empStat.firstDeposit}</h3>
            </div>
          </div>

          {/* Card 3: Số Người Nạp */}
          <div className="bg-[#0b0f19] rounded-2xl p-4 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số Người Nạp</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-cyan-400">{empStat.depositors}</h3>
            </div>
          </div>

          {/* Card 4: Tổng Nạp */}
          <div className="bg-[#0b0f19] rounded-2xl p-4 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Nạp</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-black text-amber-400">{formatVND(empStat.totalDeposit)}</h3>
            </div>
          </div>

          {/* Card 5: Tổng Cược */}
          <div className="bg-[#0b0f19] rounded-2xl p-4 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Cược</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-black text-purple-400">{formatVND(empStat.totalBet)}</h3>
            </div>
          </div>

          {/* Card 6: Vòng Cược */}
          <div className="bg-[#0b0f19] rounded-2xl p-4 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vòng Cược</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                x
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-indigo-400">{empStat.turnoverRatio} vòng</h3>
            </div>
          </div>
        </div>

        {/* 2 CHARTS MATCHING EXACT IMAGE DESIGN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CHART 1: Tổng Nạp & Tổng Cược (Match Image 1) */}
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl relative overflow-hidden">
            {/* Header & Legends */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                Tổng Nạp & Tổng Cược
              </h3>

              {/* Legend Dots matching Image 1 */}
              <div className="flex items-center gap-5 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                  <span className="text-slate-300">Tổng nạp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50"></span>
                  <span className="text-slate-300">Tổng cược</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart with Gradient Glowing Curves */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowDeposit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="glowBet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

                  <XAxis
                    dataKey="dateFormatted"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}K` : val)}
                  />

                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(val) => [`${val}K`, '']}
                  />

                  <Area
                    type="monotone"
                    dataKey="totalBet"
                    name="Tổng cược"
                    stroke="#c084fc"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#glowBet)"
                  />

                  <Area
                    type="monotone"
                    dataKey="totalDeposit"
                    name="Tổng nạp"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#glowDeposit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: Đăng Ký & Nạp Lần Đầu (Match Image 2) */}
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl relative overflow-hidden">
            {/* Header & Legends */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                Đăng Ký & Nạp Lần Đầu
              </h3>

              {/* Legend Dots matching Image 2 */}
              <div className="flex items-center gap-5 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></span>
                  <span className="text-slate-300">Đăng ký</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                  <span className="text-slate-300">Nạp lần đầu</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart with Gradient Glowing Curves */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="glowFirst" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

                  <XAxis
                    dataKey="dateFormatted"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />

                  <Area
                    type="monotone"
                    dataKey="firstDeposit"
                    name="Nạp lần đầu"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#glowFirst)"
                  />

                  <Area
                    type="monotone"
                    dataKey="registered"
                    name="Đăng ký"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#glowReg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Detailed Breakdown Table */}
        <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Thống Kê Chi Tiết Số Liệu</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                <tr>
                  <th className="p-3">Mã Hậu Đài</th>
                  <th className="p-3">Tên Nhân Viên</th>
                  <th className="p-3 text-center">Số Lượt Báo Cáo</th>
                  <th className="p-3 text-center">Đăng Ký</th>
                  <th className="p-3 text-center">Nạp Lần Đầu</th>
                  <th className="p-3 text-center">Số Người Nạp</th>
                  <th className="p-3 text-right">Tổng Nạp</th>
                  <th className="p-3 text-right">Tổng Cược</th>
                  <th className="p-3 text-center">Vòng Cược</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-900/60 transition-all">
                  <td className="p-3 font-mono font-bold text-indigo-400">{currentEmp.code}</td>
                  <td className="p-3 font-bold text-white uppercase">{currentEmp.name}</td>
                  <td className="p-3 text-center font-bold text-slate-300">{empStat.reportCount}</td>
                  <td className="p-3 text-center font-bold text-blue-400">{empStat.registered}</td>
                  <td className="p-3 text-center font-bold text-emerald-400">{empStat.firstDeposit}</td>
                  <td className="p-3 text-center font-bold text-cyan-400">{empStat.depositors}</td>
                  <td className="p-3 text-right font-bold text-amber-400">{formatVND(empStat.totalDeposit)}</td>
                  <td className="p-3 text-right font-bold text-purple-400">{formatVND(empStat.totalBet)}</td>
                  <td className="p-3 text-center font-bold text-indigo-400">{empStat.turnoverRatio} vòng</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Report Popup Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in-0 duration-200">
          <div className="relative w-full max-w-md my-8">
            {isAuthorized && (
              <button
                onClick={() => setShowReportModal(false)}
                className="absolute -top-3 -right-3 w-9 h-9 bg-slate-800 text-slate-300 hover:text-white rounded-full shadow-lg flex items-center justify-center font-bold text-lg z-50 border border-slate-700"
              >
                ✕
              </button>
            )}

            <UserReportForm
              employees={employees}
              onReportSubmitted={(validCode) => {
                const codeToUse = validCode || selectedEmployeeCode;
                localStorage.setItem('authorizedEmpCode', codeToUse);
                setSelectedEmployeeCode(codeToUse);
                setIsAuthorized(true);
                fetchStats();
                setTimeout(() => setShowReportModal(false), 500);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
