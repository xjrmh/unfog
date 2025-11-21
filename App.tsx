import React, { useState, useEffect, useRef } from 'react';
import { Map, BarChart3, CirclePlay, Info, User, PauseCircle } from 'lucide-react';
import MapView from './components/MapView';
import StatsView from './components/StatsView';
import { LocationPoint, TrackSession, AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAP);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [session, setSession] = useState<TrackSession>({
    id: 'current',
    startTime: Date.now(),
    points: []
  });
  
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTracking) {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPoint: LocationPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            alt: position.coords.altitude,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };

          setCurrentLocation(newPoint);
          setSession(prev => ({
            ...prev,
            points: [...prev.points, newPoint]
          }));
        },
        (error) => {
          console.error("Error getting location", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden font-sans select-none">
      {/* Main Content Area */}
      <main className="flex-1 relative h-full">
        {currentView === AppView.MAP && (
          <div className="absolute inset-0 animate-fade-in">
            <MapView path={session.points} currentLocation={currentLocation} />
          </div>
        )}
        
        {currentView === AppView.STATS && (
          <div className="absolute inset-0 animate-fade-in bg-black">
             <StatsView currentSession={session} history={[]} />
          </div>
        )}

        {currentView === AppView.JOURNAL && (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black">
             <div className="space-y-4">
               <Info size={48} className="mx-auto text-zinc-700" />
               <h2 className="text-xl font-bold text-zinc-500">Journal & History</h2>
               <p className="text-zinc-600">History features would go here in a full production app.</p>
             </div>
          </div>
        )}
      </main>

      {/* iOS-style Floating Action Button for Tracking */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50">
         <button 
           onClick={toggleTracking}
           className={`
             flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl shadow-2xl border border-white/10 transition-all duration-300
             ${isTracking ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}
           `}
         >
           {isTracking ? <PauseCircle size={24} /> : <CirclePlay size={24} />}
           <span className="font-semibold tracking-wide text-sm">{isTracking ? 'PAUSE TRACKING' : 'START TRACKING'}</span>
         </button>
      </div>

      {/* iOS Glassmorphism Tab Bar */}
      <nav className="relative z-50 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 pb-safe-area-bottom">
        <div className="flex justify-around items-center h-20 pb-2">
          <button 
            onClick={() => setCurrentView(AppView.MAP)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === AppView.MAP ? 'text-blue-400' : 'text-zinc-500'}`}
          >
            <Map size={24} strokeWidth={currentView === AppView.MAP ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Map</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.STATS)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === AppView.STATS ? 'text-blue-400' : 'text-zinc-500'}`}
          >
            <BarChart3 size={24} strokeWidth={currentView === AppView.STATS ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Stats</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.JOURNAL)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${currentView === AppView.JOURNAL ? 'text-blue-400' : 'text-zinc-500'}`}
          >
            <User size={24} strokeWidth={currentView === AppView.JOURNAL ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
