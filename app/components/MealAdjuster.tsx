"use client";
import { motion } from 'framer-motion';
import { useMessStore } from '../store/useMessStore';

export default function MealAdjuster({ id, name, meals, spent }: { id: string, name: string, meals: number, spent: number }) {
  const updateMeals = useMessStore(state => state.updateMeals);
  const updateSpent = useMessStore(state => state.updateSpent);

  const increment = () => updateMeals(id, meals + 1);
  const decrement = () => updateMeals(id, Math.max(0, meals - 1));

  return (
    <motion.div
      layout
      className="p-5 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-sm flex flex-col gap-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-extrabold text-slate-800">{name}</h3>
        <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded-full text-slate-600">Roommate</span>
      </div>

      <div className="flex items-center justify-between bg-white/50 rounded-full p-1 border border-white/60">
        <motion.button whileTap={{ scale: 0.9 }} onClick={decrement} className="h-8 w-8 rounded-full bg-white shadow-sm font-bold text-slate-600 hover:bg-slate-50">-</motion.button>
        <div className="flex flex-col items-center w-16">
           <span className="text-xl font-black text-slate-800">{meals}</span>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={increment} className="h-8 w-8 rounded-full bg-white shadow-sm font-bold text-slate-600 hover:bg-slate-50">+</motion.button>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Shopped ($)</label>
        <input
          type="number"
          value={spent}
          onChange={(e) => updateSpent(id, Number(e.target.value))}
          className="w-full bg-white/60 border border-white/40 rounded-xl p-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-inner"
        />
      </div>
    </motion.div>
  );
}