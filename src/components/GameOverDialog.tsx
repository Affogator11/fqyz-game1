import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Frown, HeartCrack, GraduationCap } from 'lucide-react';

interface GameOverDialogProps {
  isOpen: boolean;
  onRestart: () => void;
  reason: string;
  finalScore?: number;
  rank?: string;
}

export function GameOverDialog({ 
  isOpen, 
  onRestart, 
  reason, 
  finalScore, 
  rank 
}: GameOverDialogProps) {
  const isSuccess = reason.includes('高考结束');
  const isHealth = reason.includes('积劳成疾');
  const isStress = reason.includes('精神崩溃');

  const getIcon = () => {
    if (isSuccess) return <GraduationCap className="w-12 h-12 text-amber-400" />;
    if (isHealth) return <HeartCrack className="w-12 h-12 text-red-400" />;
    if (isStress) return <Frown className="w-12 h-12 text-purple-400" />;
    return <Trophy className="w-12 h-12 text-slate-400" />;
  };

  const getTitle = () => {
    if (isSuccess) return '高考结束';
    if (isHealth) return '积劳成疾';
    if (isStress) return '精神崩溃';
    return '游戏结束';
  };

  const getBgColor = () => {
    if (isSuccess) return 'from-green-500 to-emerald-600';
    if (isHealth) return 'from-red-500 to-rose-600';
    if (isStress) return 'from-purple-500 to-violet-600';
    return 'from-slate-500 to-slate-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getBgColor()} flex items-center justify-center mb-4 shadow-lg`}>
              {getIcon()}
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {getTitle()}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reason */}
          <p className="text-center text-slate-600 leading-relaxed">
            {reason}
          </p>

          {/* Final Score */}
          {finalScore !== undefined && (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div className="text-sm text-slate-500 mb-2">最终成绩</div>
              <div className="text-5xl font-black text-slate-800 mb-2">
                {finalScore}
              </div>
              {rank && (
                <div className="text-lg font-medium text-amber-600">
                  {rank}
                </div>
              )}
            </div>
          )}

          {/* Quote */}
          <div className="text-center">
            <p className="text-sm text-slate-400 italic">
              {isSuccess 
                ? '"南街的灯火，终于照亮了你的前路"'
                : '"高考不是终点，人生还有无限可能"'
              }
            </p>
          </div>

          {/* Restart Button */}
          <Button
            onClick={onRestart}
            className="w-full py-6 rounded-xl font-bold text-base bg-slate-800 hover:bg-slate-900 text-white"
          >
            重新开始高三生活
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
