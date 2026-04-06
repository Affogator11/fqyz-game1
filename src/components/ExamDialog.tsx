import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';

interface ExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  change: number;
  feedback: string;
}

export function ExamDialog({ isOpen, onClose, score, change, feedback }: ExamDialogProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  const getChangeIcon = () => {
    if (isPositive) return <TrendingUp className="w-8 h-8 text-green-500" />;
    if (isNegative) return <TrendingDown className="w-8 h-8 text-red-500" />;
    return <Minus className="w-8 h-8 text-slate-400" />;
  };

  const getChangeColor = () => {
    if (isPositive) return 'text-green-600';
    if (isNegative) return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-2">
              <FileText className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-slate-800">
            📝 封丘周考成绩单
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-sm text-slate-500 mb-1">本周估分</div>
              <div className="text-4xl font-black text-slate-800">{score}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-sm text-slate-500 mb-1">分值波动</div>
              <div className={`text-4xl font-black flex items-center justify-center gap-2 ${getChangeColor()}`}>
                {getChangeIcon()}
                <span>{change > 0 ? '+' : ''}{change}</span>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div 
            className={`
              p-4 rounded-xl text-sm leading-relaxed
              ${isPositive 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : change < 0 
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-slate-50 text-slate-700 border border-slate-200'
              }
            `}
          >
            {feedback}
          </div>

          {/* Tips */}
          <div className="text-xs text-slate-400 text-center">
            周考榜单贴在南墙上，周围挤满了学生
          </div>

          {/* Button */}
          <Button
            onClick={onClose}
            className="w-full py-6 rounded-xl font-bold text-base bg-slate-800 hover:bg-slate-900 text-white"
          >
            整理行囊，进入下周
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
