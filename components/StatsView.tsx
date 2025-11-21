import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrackSession } from '../types';
import { IOSCard, IOSButton, StatItem } from './UIComponents';
import { generateTripJournal } from '../services/geminiService';
import { Sparkles, Mountain, Clock, Navigation } from 'lucide-react';

interface StatsViewProps {
  currentSession: TrackSession;
  history: TrackSession[];
}

const StatsView: React.FC<StatsViewProps> = ({ currentSession }) => {
  const [journalEntry, setJournalEntry] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const hasPoints = currentSession.points.length > 0;
  
  // Prepare data for Recharts
  const chartData = currentSession.points.map((p, i) => ({
    index: i,
    alt: p.alt || 0,
    speed: p.speed || 0
  })).filter((_, i) => i % 5 === 0); // Sample data for performance

  const currentAlt = hasPoints ? currentSession.points[currentSession.points.length - 1].alt?.toFixed(0) : '-';
  const maxAlt = hasPoints 
    ? Math.max(...currentSession.points.map(p => p.alt || 0)).toFixed(0) 
    : '-';
  
  const handleGenerateJournal = async () => {
    setIsGenerating(true);
    try {
      const text = await generateTripJournal(currentSession);
      setJournalEntry(text);
    } catch (e) {
      setJournalEntry("Failed to generate journal.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pt-16 pb-24 px-4 space-y-6 h-full overflow-y-auto bg-black">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Current Trek</h1>
        <p className="text-zinc-400">Live telemetry & analysis</p>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <IOSCard>
          <div className="flex items-center gap-2 mb-2">
            <Mountain size={16} className="text-blue-400" />
            <span className="text-xs text-blue-400 font-bold">ALTITUDE</span>
          </div>
          <div className="text-3xl font-thin">{currentAlt}<span className="text-lg text-zinc-500 ml-1">m</span></div>
        </IOSCard>
        <IOSCard>
          <div className="flex items-center gap-2 mb-2">
            <Navigation size={16} className="text-green-400" />
            <span className="text-xs text-green-400 font-bold">PEAK</span>
          </div>
          <div className="text-3xl font-thin">{maxAlt}<span className="text-lg text-zinc-500 ml-1">m</span></div>
        </IOSCard>
      </div>

      {/* Altitude Chart */}
      <IOSCard className="h-64">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">ELEVATION PROFILE</h3>
        <div className="h-48 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="index" hide />
              <YAxis 
                stroke="#555" 
                tick={{fill: '#555', fontSize: 10}} 
                tickFormatter={(val) => `${val}m`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{backgroundColor: '#111', border: 'none', borderRadius: '8px'}}
                itemStyle={{color: '#fff'}}
              />
              <Area 
                type="monotone" 
                dataKey="alt" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAlt)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </IOSCard>

      {/* AI Journal Section */}
      <IOSCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <h3 className="font-semibold text-white">AI Travel Journal</h3>
          </div>
        </div>
        
        {journalEntry ? (
          <div className="prose prose-invert">
            <p className="text-zinc-300 text-sm leading-relaxed italic border-l-2 border-purple-500/50 pl-3">
              "{journalEntry}"
            </p>
            <div className="mt-4">
               <IOSButton 
                label="Regenerate" 
                variant="secondary" 
                onClick={handleGenerateJournal} 
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-zinc-500 text-sm mb-4">Generate a summary of your altitude and path using Gemini.</p>
            <IOSButton 
              label={isGenerating ? "Dreaming..." : "Create Journal Entry"} 
              onClick={handleGenerateJournal} 
              variant="primary"
            />
          </div>
        )}
      </IOSCard>
    </div>
  );
};

export default StatsView;
