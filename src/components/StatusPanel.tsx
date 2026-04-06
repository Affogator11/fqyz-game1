import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Activity, Smile, RotateCcw, BookOpen, Calculator, Languages, Atom, FlaskConical, Dna, TrendingDown } from 'lucide-react';
import type { SubjectScores } from '@/types/game';
import { SUBJECT_CONFIG, SUBJECT_RANKS, SUBJECT_MAX_SCORES, WEAK_SUBJECT_PERCENT_THRESHOLD } from '@/types/game';

interface StatusPanelProps {
  score: number;
  rank: { label: string; color: string };
  studyState: number;
  stress: number;
  health: number;
  happy: number;
  subjects: SubjectScores;
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
  subjects,
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

  // 科目图标映射
  const subjectIconMap: Record<keyof SubjectScores, typeof BookOpen> = {
    chinese: BookOpen,
    math: Calculator,
    english: Languages,
    physics: Atom,
    chemistry: FlaskConical,
    biology: Dna,
  };

  // 计算科目平均分（百分比）
  const subjectAvgPercent = Object.entries(subjects).reduce((total, [key, score]) => {
    const maxScore = SUBJECT_MAX_SCORES[key as keyof SubjectScores];
    return total + (score / maxScore) * 100;
  }, 0) / 6;

  // 统计弱势科目数量（掌握百分比 < 40%）
  const weakSubjectCount = Object.entries(subjects).filter(([key, score]) => {
    const maxScore = SUBJECT_MAX_SCORES[key as keyof SubjectScores];
    return (score / maxScore) * 100 < WEAK_SUBJECT_PERCENT_THRESHOLD;
  }).length;

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

        {/* 分割线 */}
        <div className="border-t border-slate-100 my-5" />

        {/* 科目掌握程度 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              科目掌握程度
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                平均: {Math.floor(subjectAvgPercent)}%
              </span>
              {weakSubjectCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {weakSubjectCount}科危险
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(subjects) as [keyof SubjectScores, number][]).map(([key, score]) => {
              const config = SUBJECT_CONFIG[key];
              const Icon = subjectIconMap[key];
              const maxScore = SUBJECT_MAX_SCORES[key];
              const percent = (score / maxScore) * 100;
              const rank = SUBJECT_RANKS.find(r => percent >= r.minPercent) || SUBJECT_RANKS[SUBJECT_RANKS.length - 1];
              const isWeak = percent < WEAK_SUBJECT_PERCENT_THRESHOLD;
              
              return (
                <div 
                  key={key} 
                  className={`
                    p-2.5 rounded-lg border transition-all
                    ${isWeak 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      <span className="text-xs font-medium text-slate-700">{config.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${rank.color}`}>
                      {rank.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeak ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isWeak ? 'text-red-600' : 'text-slate-600'}`}>
                      {Math.floor(score)}/{maxScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 弱势科目提示 */}
          {weakSubjectCount > 0 && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-[11px] text-red-600 flex items-start gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  有{weakSubjectCount}门科目掌握度低于40%，学习这些科目需要消耗2点精力！
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
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
