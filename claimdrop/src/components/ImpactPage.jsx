"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Users, Package, ArrowRight, Share2 } from 'lucide-react';
import { getImpactStats } from '@/api/publicService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ImpactPage({ onRestart }) {
  const [stats, setStats] = useState({ totalDrops: 0, mealsSaved: 0, co2Saved: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getImpactStats();
      if (data.success) setStats(data.stats);
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <div className="h-48 w-48 mx-auto">
          <DotLottieReact src="/animations/celebration.lottie" autoplay loop />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mt-4">Small Drops, Big Change.</h1>
        <p className="text-slate-500 mt-2 font-medium">Your contribution to ClaimDrop is making a measurable difference.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Meals Provided" 
          value={stats.mealsSaved} 
          color="bg-blue-50" 
        />
        <StatCard 
          icon={<Leaf className="text-green-600" />} 
          label="CO2 Mitigated (kg)" 
          value={stats.co2Saved} 
          color="bg-green-50" 
        />
        <StatCard 
          icon={<Package className="text-orange-600" />} 
          label="Total Rescues" 
          value={stats.totalDrops} 
          color="bg-orange-50" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="mt-12 p-8 bg-slate-900 rounded-[3rem] text-white text-center flex flex-col items-center"
      >
        <h3 className="text-xl font-bold mb-4">Ready for your next mission?</h3>
        <div className="flex gap-4">
          <button onClick={onRestart} className="bg-green-600 px-8 py-4 rounded-2xl font-bold hover:bg-green-500 transition flex items-center gap-2">
            Back to Feed <ArrowRight size={18} />
          </button>
          <button className="bg-slate-800 px-8 py-4 rounded-2xl font-bold hover:bg-slate-700 transition flex items-center gap-2">
            <Share2 size={18} /> Share Impact
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center"
    >
      <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <motion.h2 
        initial={{ scale: 0.5 }} animate={{ scale: 1 }}
        className="text-4xl font-black text-slate-900"
      >
        {value}
      </motion.h2>
      <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mt-2">{label}</p>
    </motion.div>
  );
}