"use client";
import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, CreditCard, Clock, BrainCircuit, X } from 'lucide-react';

interface DescoAnalyticsProps {
  accountNo?: string;
}

export default function DescoAnalytics({ accountNo = '41095956' }: DescoAnalyticsProps) {
  const [meterData, setMeterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [dailyUsage, setDailyUsage] = useState<number>(45);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);

  const fetchDescoData = async () => {
    if (!meterData) setIsLoading(true);
    setError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch(`/api/desco?accountNo=${accountNo}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to connect to proxy tunnel.`);
      }
      
      const jsonPayload = await res.json();
      
      // Target live balance payload
      const liveData = jsonPayload?.balanceData?.data || jsonPayload?.data || {};
      setMeterData(liveData);

      const fetchedBalance = Number(liveData.balance || 0);
      
      if (fetchedBalance > 0 && fetchedBalance < 100) {
        setShowLowBalanceModal(true);
      }

      const consumption = Number(liveData.currentMonthConsumption || 0);
      const readingTime = liveData.readingTime || ''; 

      if (consumption > 0 && readingTime) {
        const dateParts = readingTime.split('-');
        const currentDay = parseInt(dateParts[2], 10); 
        if (currentDay > 0) {
          setDailyUsage(consumption / currentDay);
        }
      } else {
        setDailyUsage(45); 
      }

    } catch (err: any) {
      console.error('DESCO fetch error:', err);
      if (err.name === 'AbortError') {
        setError('DESCO network timeout (10s limit exceeded). Please try again.');
      } else if (err instanceof TypeError) {
        setError('Network error - cannot reach DESCO servers. Check your connection.');
      } else {
        setError(err.message || 'DESCO network timeout or unreachable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const scheduleNextFetch = () => {
      const now = new Date();
      const target12AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 2, 0); 
      const target11AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0); 

      let nextTarget: Date;
      if (now < target12AM) nextTarget = target12AM;
      else if (now < target11AM) nextTarget = target11AM;
      else nextTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 2, 0);

      const delay = nextTarget.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        fetchDescoData(); 
        scheduleNextFetch(); 
      }, delay);
    };

    fetchDescoData();
    scheduleNextFetch();
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNo]);

  const balance = Number(meterData?.balance || 0);
  const isLowBalance = balance < 100;
  const remainingDays = dailyUsage > 0 ? Math.floor(balance / dailyUsage) : 0;

  return (
    <>
      <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl overflow-hidden relative">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" /> Grid Analytics
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mt-1">A/C: {accountNo}</p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full border border-slate-200/50">
            <div 
              className={`w-3 h-3 rounded-full animate-pulse transition-colors duration-700 ${
                isLowBalance 
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' 
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
              }`}
            ></div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isLoading ? 'Syncing' : 'Live'}
            </span>
          </div>
        </div>

        {error && !meterData ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold mb-6">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="text-sm">{error}</p>
              <p className="text-xs text-red-500 mt-1">DESCO servers may be temporarily unavailable. Data will sync when service is restored.</p>
            </div>
          </div>
        ) : isLoading && !meterData ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Initializing Live Matrix...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Cleanly Centered Balance Placeholder */}
            <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center transition-colors ${isLowBalance ? 'bg-red-50/50 border-red-100' : 'bg-blue-50/50 border-blue-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isLowBalance ? 'text-red-500' : 'text-blue-600'}`}>
                Current Balance
              </p>
              <p className="text-5xl font-black text-slate-900">৳ {balance.toFixed(2)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/50 border border-slate-100 rounded-xl flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3 text-purple-500" /> Current Run Rate
                </p>
                <p className="text-sm font-black text-purple-700 mt-1">৳ {dailyUsage.toFixed(2)} / day</p>
              </div>

              <div className={`p-4 border rounded-xl flex flex-col justify-center ${remainingDays <= 2 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${remainingDays <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  Est. Time Left
                </p>
                <p className={`text-sm font-black mt-1 flex items-center gap-1 ${remainingDays <= 2 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  <Clock className="w-4 h-4" /> 
                  {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'}
                </p>
              </div>
            </div>

            <a 
              href="https://ekpay.gov.bd/#/dedicated-biller/desco-prepaid" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              <CreditCard className="w-5 h-5" /> Recharge via EkPay
            </a>
          </div>
        )}
      </div>

      {showLowBalanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowLowBalanceModal(false)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Low Balance Warning!</h3>
            <p className="text-sm font-bold text-slate-500 mb-6">
              Your meter balance has dropped to <span className="text-red-500 font-black">৳ {balance.toFixed(2)}</span>. Please recharge immediately to avoid power interruption.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <a 
                href="https://ekpay.gov.bd/#/dedicated-biller/desco-prepaid" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => setShowLowBalanceModal(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Zap className="w-5 h-5" /> Recharge Now
              </a>
              <button 
                onClick={() => setShowLowBalanceModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
