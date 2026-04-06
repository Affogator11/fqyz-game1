import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AIGeneratedEvent } from '@/types/game';
import { SUBJECT_CONFIG } from '@/types/game';
import { Brain, TrendingUp, Activity, Smile, Heart, AlertCircle, BookOpen } from 'lucide-react';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: AIGeneratedEvent | null;
}

export function EventDialog({ isOpen, onClose, event }: EventDialogProps) {
  if (!event) return null;

  const isPositive = 
    (event.effects.academicBase || 0) > 0 || 
    (event.effects.happy || 0) > 0 || 
    (event.effects.stress || 0) < 0 ||
    (event.effects.subjects && Object.values(event.effects.subjects).some(v => v > 0));

  // 基础效果项
  const baseEffectItems = [
    { 
      key: 'studyState', 
      label: '学习手感', 
      value: event.effects.studyState, 
      icon: Brain,
      positive: (v: number) => v > 0,
    },
    { 
      key: 'academicBase', 
      label: '学力积累', 
      value: event.effects.academicBase, 
      icon: TrendingUp,
      positive: (v: number) => v > 0,
    },
    { 
      key: 'stress', 
      label: '心理压力', 
      value: event.effects.stress, 
      icon: Activity,
      positive: (v: number) => v < 0, // 压力减少是好事
    },
    { 
      key: 'happy', 
      label: '幸福度', 
      value: event.effects.happy, 
      icon: Smile,
      positive: (v: number) => v > 0,
    },
    { 
      key: 'health', 
      label: '身体机能', 
      value: event.effects.health, 
      icon: Heart,
      positive: (v: number) => v > 0,
    },
  ].filter(item => item.value !== undefined && item.value !== 0);

  // 科目效果项
  const subjectEffectItems = event.effects.subjects 
    ? Object.entries(event.effects.subjects)
        .filter(([_, value]) => value !== undefined && value !== 0)
        .map(([key, value]) => ({
          key,
          label: SUBJECT_CONFIG[key as keyof typeof SUBJECT_CONFIG]?.name || key,
          value: value!,
          icon: BookOpen,
          positive: (v: number) => v > 0,
        }))
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          max-w-md border-4 rounded-2xl
          ${isPositive ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}
        `}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div 
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isPositive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
              `}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <DialogTitle className={`text-xl ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
              {isPositive ? '✨ 幸运时刻' : '🚨 挑战降临'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Title */}
          <h3 className="text-lg font-bold text-slate-800">
            {event.title}
          </h3>

          {/* Event Description */}
          <p className="text-slate-700 leading-relaxed text-justify">
            {event.description}
          </p>

          {/* Effects */}
          <div className="bg-white/70 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-bold">
              状态变化
            </p>
            
            {/* 基础效果 */}
            {baseEffectItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {baseEffectItems.map((item) => {
                  const isGood = item.positive(item.value!);
                  return (
                    <Badge
                      key={item.key}
                      variant="secondary"
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold
                        ${isGood 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                        }
                      `}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                      <span className={isGood ? 'text-green-800' : 'text-red-800'}>
                        {item.value! > 0 ? '+' : ''}{item.value}
                      </span>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* 科目效果 */}
            {subjectEffectItems.length > 0 && (
              <>
                <p className="text-xs text-slate-400 mb-2">科目掌握度</p>
                <div className="flex flex-wrap gap-2">
                  {subjectEffectItems.map((item) => {
                    const isGood = item.positive(item.value!);
                    return (
                      <Badge
                        key={item.key}
                        variant="secondary"
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold
                          ${isGood 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                          }
                        `}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {item.label}
                        <span className={isGood ? 'text-blue-800' : 'text-orange-800'}>
                          {item.value! > 0 ? '+' : ''}{item.value}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </>
            )}

            {event.reason && (
              <p className="text-xs text-slate-500 mt-3 italic">
                💡 {event.reason}
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <Button
            onClick={onClose}
            className={`
              w-full py-6 rounded-xl font-bold text-base
              ${isPositive 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
            `}
          >
            确认
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
