import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, CheckCircle2, History } from 'lucide-react';
import NewDropForm from './NewDropForm';

export default function DonorView({ profile }) {
  const [drops, setDrops] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMyDrops();
  }, []);

  async function fetchMyDrops() {
    const { data } = await supabase
      .from('drops')
      .select('*, pickup_code')
      .eq('donor_id', profile.id)
      .order('created_at', { ascending: false });
    setDrops(data || []);
  }

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Sidebar Stats */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 className="text-green-600" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Meals Saved</p>
          <h4 className="text-3xl font-black text-slate-900">{drops.length * 4}</h4>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="w-full bg-slate-900 text-white p-6 rounded-3xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-green-600 transition group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform" /> 
          New Food Drop
        </button>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid size={18} /> Active Listings
            </h2>
          </div>
          
          <div className="divide-y divide-slate-100">
            <AnimatePresence mode='popLayout'>
              {drops.map((drop, index) => (
                <motion.div 
                  key={drop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 flex justify-between items-center hover:bg-slate-50 transition cursor-default"
                >
                  <div className="flex gap-4 items-center">
                    <div className={`h-3 w-3 rounded-full ${drop.status === 'AVAILABLE' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div>
                      <h3 className="font-bold text-slate-900">{drop.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">{drop.quantity} • Created {new Date(drop.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  {drop.status === 'AVAILABLE' && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Code</p>
                      <p className="text-2xl font-black text-slate-900 tracking-widest flex items-center justify-center">{drop.pickup_code}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${drop.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                      {drop.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {drops.length === 0 && (
              <div className="p-20 text-center text-slate-400 italic">No food drops recorded. Click "+" to start.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showForm && (
          <NewDropForm 
            donorId={profile.id} 
            onClose={() => setShowForm(false)} 
            onComplete={fetchMyDrops}
          />
        )}
      </AnimatePresence>
    </div>
  );
}