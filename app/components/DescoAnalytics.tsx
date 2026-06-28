"use client";
import { useState, useEffect } from 'react';
import { Zap, BatteryMedium, RefreshCw, AlertTriangle } from 'lucide-react';

interface DescoAnalyticsProps {
  accountNo?: string;
}

export default function DescoAnalytics({ accountNo = '41095956' }: DescoAnalyticsProps) {
  const [meterData, setMeterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDescoData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Calls our Next.js backend proxy to bypass CORS
      const res = await fetch(`/api/desco?accountNo=${accountNo}`);
      if (!res.ok) throw new Error('Failed to connect to proxy tunnel.');
      
      const data = await res.json();
      setMeterData(data);
    } catch (err) {
      setError('DESCO network timeout or unreachable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDescoData();
  }, [accountNo]);

  // ⚠️ ARCHITECTURAL NOTE:
  // Since we don't have the exact API schema documentation, you must `console.log(meterData)`
  // once the app runs and adjust these object keys to match DESCO's exact JSON structure.
  const balance = meterData?.data?.balance || meterData?.balance || '0.00';
  const accountName = meterData?.data?.customerName || meterData?.customerName || 'DESCO Prepaid Account';
  const tariff = meterData?.data?.tariff || 'Residential';

  const isLowBalance = Number(balance) < 200;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl overflow-hidden relative">
      
      {/* Structural Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" /> Grid Analytics
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mt-1">A/C: {accountNo}</p>
        </div>
        <button 
          onClick={fetchDescoData} 
          disabled={isLoading}
          className="p-3 bg-white/80 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 text-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Conditional State Handling */}
      {error ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Syncing with DESCO...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Main Balance Hero */}
          <div className={`p-6 rounded-2xl border flex justify-between items-center transition-colors ${isLowBalance ? 'bg-red-50/50 border-red-100' : 'bg-blue-50/50 border-blue-100'}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isLowBalance ? 'text-red-500' : 'text-blue-600'}`}>
                Current Balance
              </p>
              <p className="text-4xl font-black text-slate-900">৳{Number(balance).toFixed(2)}</p>
            </div>
            <BatteryMedium className={`w-10 h-10 ${isLowBalance ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
          </div>

          {/* Contextual Grid Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-white/50 border border-slate-100 rounded-xl">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Holder</p>
               <p className="text-sm font-bold text-slate-700 truncate mt-1">{accountName}</p>
             </div>
             <div className="p-4 bg-white/50 border border-slate-100 rounded-xl">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tariff Plan</p>
               <p className="text-sm font-bold text-slate-700 truncate mt-1">{tariff}</p>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}