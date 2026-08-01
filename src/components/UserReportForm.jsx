import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export default function UserReportForm({ employees = [], onReportSubmitted }) {
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('---');

  const getTodayIsoDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [reportDate, setReportDate] = useState(getTodayIsoDate);

  const [formData, setFormData] = useState({
    registeredCount: '',
    firstDepositCount: '',
    depositorsCount: '',
    totalDeposit: '',
    totalBet: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Update employee name when code changes
  useEffect(() => {
    if (!employeeCode.trim()) {
      setEmployeeName('---');
      return;
    }
    const emp = employees.find(
      (e) => e.code.trim().toLowerCase() === employeeCode.trim().toLowerCase()
    );
    if (emp) {
      setEmployeeName(emp.name);
    } else {
      setEmployeeName('--- (Mã không hợp lệ)');
    }
  }, [employeeCode, employees]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedCode = employeeCode.trim().toUpperCase();

    if (!trimmedCode) {
      setStatus({ type: 'error', message: 'Vui lòng chọn hoặc nhập Mã hậu đài!' });
      return;
    }

    // Validate employee code against valid employees list
    if (employees && employees.length > 0) {
      const foundEmp = employees.find(
        (emp) => emp.code.toUpperCase() === trimmedCode
      );
      if (!foundEmp) {
        setStatus({
          type: 'error',
          message: `Mã hậu đài "${trimmedCode}" không tồn tại trong hệ thống! Vui lòng kiểm tra lại.`,
        });
        return;
      }
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const selectedDate = reportDate || getTodayIsoDate();

      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: trimmedCode,
          date: selectedDate,
          registeredCount: Number(formData.registeredCount) || 0,
          firstDepositCount: Number(formData.firstDepositCount) || 0,
          depositorsCount: Number(formData.depositorsCount) || 0,
          totalDeposit: Number(formData.totalDeposit) || 0,
          totalBet: Number(formData.totalBet) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi gửi báo cáo!');
      }

      setStatus({
        type: 'success',
        message: 'Gửi báo cáo số liệu thành công!',
      });

      // Reset form
      setFormData({
        registeredCount: '',
        firstDepositCount: '',
        depositorsCount: '',
        totalDeposit: '',
        totalBet: '',
      });

      if (onReportSubmitted) {
        onReportSubmitted(trimmedCode);
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Không thể kết nối đến hệ thống server!' });
    } finally {
      setLoading(false);
    }
  };

  const handleOnlyViewDashboard = () => {
    const trimmedCode = employeeCode.trim().toUpperCase();
    if (!trimmedCode) {
      setStatus({ type: 'error', message: 'Vui lòng chọn hoặc nhập Mã hậu đài!' });
      return;
    }

    if (employees && employees.length > 0) {
      const foundEmp = employees.find(
        (emp) => emp.code.toUpperCase() === trimmedCode
      );
      if (!foundEmp) {
        setStatus({
          type: 'error',
          message: `Mã hậu đài "${trimmedCode}" không tồn tại trong hệ thống! Vui lòng kiểm tra lại.`,
        });
        return;
      }
    }

    if (onReportSubmitted) {
      onReportSubmitted(trimmedCode);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[90vh]">
      {/* Outer Container matching image popup design */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 sm:p-8 border border-slate-100 relative transition-all">

        {/* Title Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            BÁO CÁO SỐ LIỆU
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
            Báo cáo CÁ NHÂN
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-[#f0f4fb] rounded-2xl p-4 mb-6 text-sm text-slate-700 space-y-2 border border-slate-200/50">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Ngày/tháng báo cáo:</span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="font-bold text-slate-900 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer shadow-sm"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Tên nhân viên:</span>
            <span className="font-bold text-slate-900 uppercase">{employeeName}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
            <span className="text-slate-500 font-semibold">Mã hậu đài:</span>
            <input
              type="text"
              placeholder="Nhập mã hậu đài..."
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
              className="font-mono font-bold text-indigo-600 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3 py-1.5 text-xs outline-none w-48 uppercase text-right"
            />
          </div>
        </div>

        {/* Status Alerts */}
        {status.message && (
          <div
            className={`mb-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Số khách đăng ký */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Số khách đăng kí
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.registeredCount}
              onChange={(e) => handleInputChange('registeredCount', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Field 2: Số khách nạp đầu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Số khách nạp đầu (Khách mới)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.firstDepositCount}
              onChange={(e) => handleInputChange('firstDepositCount', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Field 3: Số lượng người nạp tiền */}
          <div>
            <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">
              Số lượng người nạp tiền (Trong ngày)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.depositorsCount}
              onChange={(e) => handleInputChange('depositorsCount', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/20 text-slate-800 text-sm font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Field 4: Tổng Nạp / Ngày */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tổng Nạp / Ngày (VND)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.totalDeposit}
              onChange={(e) => handleInputChange('totalDeposit', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Field 5: Tổng Cược / Ngày */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tổng Cược / Ngày (VND)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.totalBet}
              onChange={(e) => handleInputChange('totalBet', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>Gửi báo cáo</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleOnlyViewDashboard}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Vào trang số liệu cá nhân (Không gửi báo cáo)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
