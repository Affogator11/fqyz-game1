// Progress component not used - using custom progress bars
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Activity, Smile, RotateCcw } from 'lucide-react';

interface StatusPanelProps {
  score: number;
  rank: { label: string; color: string };
  studyState: number;
  stress: number;
  health: number;
  happy: number;
  teacher: string;
  onReset: () => void;
}

export function StatusPanel({
  score,
  rank,
  studyState,
  stress,
  health,
  happy,
  teacher,
  onReset,
}: StatusPanelProps) {
  const stats = [
    {
      id: 'studyState',
      label: '学习手感',
      value: studyState,
      icon: Brain,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      id: 'stress',
      label: '心理压力',
      value: stress,
      icon: Activity,
      color: stress > 80 ? 'bg-red-500 animate-pulse' : 'bg-red-500',
      textColor: stress > 80 ? 'text-red-600 font-bold' : 'text-red-600',
      warning: stress > 80,
    },
    {
      id: 'health',
      label: '身体机能',
      value: health,
      icon: Heart,
      color: health < 30 ? 'bg-orange-500' : 'bg-green-500',
      textColor: 'text-green-600',
      warning: health < 30,
    },
    {
      id: 'happy',
      label: '幸福度',
      value: happy,
      icon: Smile,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white p-4 text-center border-b-4 border-amber-400">
        <h5 className="font-bold text-lg">封丘考生档案</h5>
        <div className="text-sm text-amber-300 font-medium mt-1">
          班主任：{teacher}
        </div>
      </div>

      <div className="p-5">
        {/* Score Display */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 p-5 rounded-xl text-center border border-slate-700 mb-5">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">
            封丘联考预估总分
          </div>
          <div className="text-5xl font-black tracking-tight drop-shadow-lg">
            {score}
          </div>
          <Badge 
            variant="secondary" 
            className={`mt-3 ${rank.color.replace('text-', 'bg-').replace('500', '100')} ${rank.color} border-0`}
          >
            {rank.label}
          </Badge>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.id}>
              <div className={`flex justify-between items-center mb-1.5 text-sm ${stat.warning ? 'animate-pulse' : ''}`}>
                <span className={`flex items-center gap-1.5 font-medium ${stat.textColor}`}>
                  <stat.icon className="w-4 h-4" />
                  {stat.label}
                  {stat.warning && <span className="text-red-500">⚠️</span>}
                </span>
                <span className={`font-bold ${stat.warning ? 'text-red-600' : 'text-slate-600'}`}>
                  {Math.floor(stat.value)}{stat.id === 'stress' ? '/100' : '%'}
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.color} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(0, stat.value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3 h-3" />
            重新开始高三生活
          </button>
        </div>
      </div>
    </div>
  );
}
