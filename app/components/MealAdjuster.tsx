"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useMessStore, calculateMeals } from '../store/useMessStore';

export default function MealAdjuster({ id, name }: { id: string, name: string }) {
  const selectedDate = useMessStore(state => state.selectedDate);
  const dailyMeals = useMessStore(state => state.dailyMeals);
  const toggleMeal = useMessStore(state => state.toggleMeal);

  const userMeals = dailyMeals[selectedDate]?.[id] ?? { noon: true, night: true, hasGuest: false, guestNoon: false, guestNight: false };
  const totalToday = calculateMeals(userMeals);
  const isEating = totalToday > 0;

  const ToggleButton = ({ label, active, field }: { label: string, active: boolean, field: any }) => (
    <button
      onClick={() => toggleMeal(id, field)}
      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border ${
        active 
          ? 'bg-blue-500 text-white border-blue-600 shadow-sm' 
          : 'bg-white/50 text-slate-500 border-white/60 hover:bg-white/80'
      }`}
    >
      {label}
    </button>
  );

  return (
    <motion.div
      layout
      className={`p-5 rounded-squircle backdrop-blur-xl border shadow-sm flex flex-col gap-4 transition-colors duration-300 ${isEating ? 'bg-white/40 border-white/50' : 'bg-white/20 border-white/30 grayscale-[0.2]'}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-extrabold text-slate-800">{name}</h3>
        <span className="text-xs font-black text-slate-600 bg-white/60 px-2 py-1 rounded-lg">
          {totalToday} {totalToday === 1 ? 'Meal' : 'Meals'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Self</p>
          <div className="flex gap-2">
            <ToggleButton label="Noon" active={userMeals.noon} field="noon" />
            <ToggleButton label="Night" active={userMeals.night} field="night" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guest</p>
            <button
              onClick={() => toggleMeal(id, 'hasGuest')}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                userMeals.hasGuest ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {userMeals.hasGuest ? '− Remove' : '+ Add'}
            </button>
          </div>

          <AnimatePresence>
            {userMeals.hasGuest && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex gap-2 overflow-hidden"
              >
                <ToggleButton label="Noon" active={userMeals.guestNoon} field="guestNoon" />
                <ToggleButton label="Night" active={userMeals.guestNight} field="guestNight" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}