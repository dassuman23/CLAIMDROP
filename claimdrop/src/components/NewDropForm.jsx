"use client";
import { useState } from 'react';
// Import the new service instead of direct Supabase
import { createDrop } from '@/api/publicService'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, X } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function NewDropForm({ onComplete, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    quantity: '',
    expiry_hours: '2',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We no longer calculate time or insert directly here.
      // We send the raw data to the server-side controller.
      const result = await createDrop(formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onComplete();
          onClose();
        }, 2000);
      }
    } catch (err) {
      alert(err.message || "Failed to broadcast drop.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-stone-700">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition">
          <X size={20} className="text-slate-400" />
        </button>

        {success ? (
          <div className="p-12 text-center">
            <DotLottieReact
              src="/animations/success.lottie" // Replace with a valid checkmark Lottie URL
              autoplay
              loop={false}
              className="h-32 w-32 mx-auto"
            />
            <h2 className="text-2xl font-bold mt-4 text-slate-900">Drop Live!</h2>
            <p className="text-slate-500">Nearby receivers have been notified.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="text-green-600" /> Create a Drop
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Food Item</label>
                <div className="relative mt-1">
                  <Package className="absolute left-3 top-3 text-slate-300" size={18} />
                  <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition" 
                    placeholder="e.g. 10 Assorted Pizzas" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Quantity / Weight</label>
                <input required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-3 mt-1 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition" 
                  placeholder="e.g. 5kg or 3 Boxes" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock size={14} /> Expiry (Hours)
                </label>
                <select value={formData.expiry_hours} onChange={(e) => setFormData({ ...formData, expiry_hours: e.target.value })}
                  className="w-full px-4 py-3 mt-1 border border-slate-200 rounded-2xl bg-white outline-none">
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="4">4 Hours</option>
                  <option value="8">8 Hours</option>
                </select>
              </div>
            </div>

            <button disabled={loading} className="w-full bg-green-600 text-white mt-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition disabled:opacity-50">
              {loading ? 'Publishing...' : 'Broadcast Drop'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}