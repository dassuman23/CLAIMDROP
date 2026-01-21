"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase.js';
import dynamic from 'next/dynamic';
import { verifyPickup } from '@/api/publicService';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, ShieldCheck, Map, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Dynamic Import with Error Boundary logic
const MissionMap = dynamic(
  () => import('../components/MissionMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-[2rem] flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest">Initializing Map...</span>
      </div>
    )
  }
);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

export default function ActiveMissionView({ activeDrop, onMissionComplete }) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [riderPos, setRiderPos] = useState(null);
  const [arrivalStatus, setArrivalStatus] = useState("Awaiting GPS Signal...");
  const [gpsError, setGpsError] = useState(null);

  // Safety Check: Extract Store Coordinates
  // Supports both direct properties or nested profile properties
  const storeLat = activeDrop?.profiles?.lat || activeDrop?.lat;
  const storeLng = activeDrop?.profiles?.lng || activeDrop?.lng;

  useEffect(() => {
    if (!activeDrop || !storeLat || !storeLng) {
      setArrivalStatus("Missing store location data.");
      return;
    }

    const channel = supabase.channel(`live_mission_${activeDrop.id}`);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsError(null);
        const { latitude, longitude } = position.coords;
        const currentPos = { lat: latitude, lng: longitude };
        
        setRiderPos(currentPos);

        const dist = calculateDistance(latitude, longitude, storeLat, storeLng);

        if (dist !== null) {
          if (dist < 100) {
            setArrivalStatus("You've Arrived! Ask for the handover code.");
          } else {
            const distKm = (dist / 1000).toFixed(1);
            setArrivalStatus(`${distKm} km away from store`);
          }
        }

        channel.send({
          type: 'broadcast',
          event: 'location_update',
          payload: { ...currentPos },
        });
      },
      (err) => {
        console.error("GPS Error:", err);
        setGpsError("Please enable GPS to use navigation.");
        setArrivalStatus("GPS Access Denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      supabase.removeChannel(channel);
    };
  }, [activeDrop, storeLat, storeLng]);

  const handleVerify = async () => {
    if (otp.length < 4) return;
    setIsVerifying(true);
    setError("");
    try {
      const result = await verifyPickup(activeDrop.id, otp);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => onMissionComplete(), 3500); 
      } else {
        throw new Error(result.error || "Invalid code");
      }
    } catch (err) {
      setError(err.message || "Verification failed. Try again.");
      setOtp(""); // Clear OTP on failure
    } finally {
      setIsVerifying(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
        <div className="h-64 w-64">
           <DotLottieReact src="/animations/success.lottie" autoplay loop={false} />
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <h2 className="text-3xl font-black text-slate-900">Mission Complete!</h2>
          <p className="text-slate-500 mt-2 font-medium text-lg">Your impact has been recorded. 🌱</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 pb-20">
      
      {/* Navigation Card */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              Live Mission
            </span>
            {gpsError && <span className="text-red-400 text-[10px] font-bold uppercase flex items-center gap-1"><AlertCircle size={12}/> GPS Offline</span>}
          </div>
          
          <h3 className="text-3xl font-black mb-1">{activeDrop.profiles?.business_name || activeDrop.title}</h3>
          <p className="text-slate-400 mb-8 text-sm font-medium">{activeDrop.profiles?.address || 'Proceed to the store location'}</p>
          
          {/* Map Guard: Only render if store coordinates exist */}
          {storeLat && storeLng ? (
            <MissionMap 
              riderPos={riderPos} 
              storePos={{ lat: storeLat, lng: storeLng }} 
            />
          ) : (
            <div className="h-[300px] w-full bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-500">
              Invalid Store Coordinates
            </div>
          )}

          <div className="mt-6 flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-md">
            <div className="h-10 w-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
              <Navigation size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navigation Status</p>
              <h3 className="text-sm font-bold text-white">{arrivalStatus}</h3>
            </div>
          </div>
        </div>
        <Navigation className="absolute -right-12 -bottom-12 text-white/5 w-64 h-64 rotate-12" />
      </div>

      {/* Verification Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center">
        <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-green-600" size={32} />
        </div>
        <h4 className="text-2xl font-black text-slate-900 mb-2">Security Handshake</h4>
        <p className="text-slate-500 mb-10 text-sm px-4 leading-relaxed">
          Ask the manager for the <span className="text-slate-900 font-bold">4-digit pickup code</span> to verify the collection of {activeDrop.title}.
        </p>
        
        <div className="max-w-[280px] mx-auto">
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            maxLength={4} 
            placeholder="----"
            className={`text-5xl font-black tracking-[1.2rem] text-center w-full p-8 bg-slate-50 border-2 rounded-[2rem] outline-none transition-all ${error ? 'border-red-500 bg-red-50 text-red-600 animate-shake' : 'border-slate-100 focus:border-green-500'}`}
          />
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs font-bold mt-4 flex items-center justify-center gap-1">
                <AlertCircle size={14} /> {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={handleVerify} 
          disabled={otp.length < 4 || isVerifying}
          className="w-full mt-10 bg-green-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl hover:bg-green-700 disabled:opacity-50 disabled:grayscale transition active:scale-95 flex items-center justify-center gap-2"
        >
          {isVerifying ? <><Loader2 className="animate-spin" /> Verifying...</> : "Confirm Collection"}
        </button>
      </div>
    </motion.div>
  );
}