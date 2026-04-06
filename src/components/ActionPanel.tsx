import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calculator, 
  Languages, 
  Atom, 
  FlaskConical, 
  Dna,
  BookCheck, 
  Zap, 
  Utensils, 
  Clock, 
  Smartphone, 
  MessageCircleHeart,
  BatteryCharging,
  AlertTriangle,
  type LucideIcon
} from 'lucide-react';
import { SUBJECT_ACTIONS, OTHER_ACTIONS } from '@/hooks/useGameState';
import type { SubjectScores } from '@/types/game';
import { SUBJECT_CONFIG, SUBJECT_MAX_SCORES, WEAK_SUBJECT_PERCENT_THRESHOLD } from '@/types/game';

interface ActionPanelProps {
  ap: number;
  subjects: SubjectScores;
  onAction: (actionId: string) => void;
  disabled: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Calculator,
  Languages,
  Atom,
  FlaskConical,
  Dna,
  BookCheck,
  Zap,
  Utensils,
  Clock,
  Smartphone,
  MessageCircleHeart,
  BatteryCharging,
};

export function ActionPanel({ ap, subjects, onAction, disabled }: ActionPanelProps) {
  const subjectActions = Object.values(SUBJECT_ACTIONS);
  const otherActions = Object.values(OTHER_ACTIONS);

  return (
    <div className="space-y-4">
      {/* 科目学习行动 */}
      <div>
        <div className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-2">
          <span>📚 科目学习</span>
          <span className="text-amber-500 text-[10px]">（掌握度&lt;40%的科目需要2点精力）</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {subjectActions.map((action) => {
            const Icon = iconMap[action.icon] || BookOpen;
            const subjectKey = action.subject!;
            const subjectScore = subjects[subjectKey];
            const maxScore = SUBJECT_MAX_SCORES[subjectKey];
            const percent = (subjectScore / maxScore) * 100;
            const isWeak = percent < WEAK_SUBJECT_PERCENT_THRESHOLD;
            const apCost = isWeak ? 2 : 1;
            const canAfford = ap >= apCost;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => onAction(action.id)}
                disabled={disabled || !canAfford}
                className={`
                  h-auto py-3 px-2 flex flex-col items-center justify-center gap-1.5
                  border transition-all duration-200 rounded-xl relative
                  ${disabled || !canAfford 
                    ? 'opacity-50 cursor-not-allowed border-slate-200' 
                    : 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
                  }
                  ${isWeak 
                    ? 'border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300'
                  }
                `}
              >
                {/* 弱势警告标记 */}
                {isWeak && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <Icon 
                  className={`w-5 h-5 ${isWeak ? 'text-red-500' : SUBJECT_CONFIG[subjectKey].color}`} 
                />
                <div className="text-center">
                  <div className={`font-bold text-xs ${isWeak ? 'text-red-600' : 'text-slate-700'}`}>
                    {action.name}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isWeak ? 'text-red-400' : 'text-slate-400'}`}>
                    {isWeak ? `⚠️ 需${apCost}精力` : action.description}
                  </div>
                </div>
                
                {/* 当前分数显示 */}
                <div className={`text-[10px] font-mono ${
                  isWeak ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {Math.floor(subjectScore)}/{maxScore}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 分割线 */}
      <div className="border-t border-slate-200" />

      {/* 其他行动 */}
      <div>
        <div className="text-xs text-slate-500 mb-2 font-medium">
          🎯 其他活动
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {otherActions.map((action) => {
            const Icon = iconMap[action.icon] || BatteryCharging;
            const isPhone = action.id === 'phone';
            
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => onAction(action.id)}
                disabled={disabled || ap <= 0}
                className={`
                  h-auto py-3 px-2 flex flex-col items-center justify-center gap-1.5
                  border transition-all duration-200 rounded-xl
                  ${disabled || ap <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-md'}
                  ${isPhone ? 'border-red-200 hover:border-red-300 hover:bg-red-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                `}
              >
                <Icon 
                  className={`w-5 h-5 ${isPhone ? 'text-red-500' : 'text-blue-500'}`} 
                />
                <div className="text-center">
                  <div className={`font-bold text-xs ${isPhone ? 'text-red-600' : 'text-slate-700'}`}>
                    {action.name}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isPhone ? 'text-red-400' : 'text-slate-400'}`}>
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}

          {/* AP Display */}
          <div className="h-auto py-3 px-2 flex flex-col items-center justify-center gap-1.5 border border-blue-200 bg-blue-50 rounded-xl">
            <BatteryCharging className="w-5 h-5 text-blue-500" />
            <div className="text-center">
              <div className="font-bold text-xs text-slate-700">
                精力: <span className="text-blue-600 text-base">{ap}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                本周剩余
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
