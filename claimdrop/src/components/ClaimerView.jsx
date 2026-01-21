"use client";
import { useState, useEffect } from 'react';
import { getAvailableDrops } from '@/api/publicService';
import ReceiverDashboard from './ReceiverDashboard'; // Discovery view
import ActiveMissionView from './ActiveMissionView'; // Mission view
import ImpactPage from './ImpactPage';
export default function ClaimerView({ profile }) {
  const [activeClaim, setActiveClaim] = useState(null); // The "Switch"
  const [viewState, setViewState] = useState('DISCOVERY'); 
  const [activeDrop, setActiveDrop] = useState(null);

  // This function is passed to ReceiverDashboard
  const onClaimSuccess = (claimedDrop) => {
    setActiveClaim(claimedDrop); // This triggers the switch to ActiveMissionView
  };

  // This function is passed to ActiveMissionView
  const onMissionComplete = () => {
    setActiveClaim(null); // This triggers the switch back to ReceiverDashboard
  };

  return (
    <div>
      {viewState === 'DISCOVERY' && (
        <ReceiverDashboard 
          onClaimSuccess={(drop) => { 
            setActiveDrop(drop); 
            setViewState('MISSION'); 
          }} 
        />
      )}

      {viewState === 'MISSION' && (
        <ActiveMissionView 
          activeDrop={activeDrop} 
          onMissionComplete={() => setViewState('IMPACT')} // Transition to Impact
        />
      )}

      {viewState === 'IMPACT' && (
        <ImpactPage 
          onRestart={() => setViewState('DISCOVERY')} // Loop back to start
        />
      )}
    </div>
  );
}