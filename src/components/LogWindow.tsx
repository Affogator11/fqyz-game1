import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal } from 'lucide-react';

export interface LogEntry {
  id: string;
  week: number;
  message: string;
  type: 'normal' | 'action' | 'event' | 'exam' | 'system';
  timestamp: number;
}

interface LogWindowProps {
  logs: LogEntry[];
  currentWeek: number;
}

export function LogWindow({ logs, currentWeek }: LogWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getTypeStyles = (type: LogEntry['type']) => {
    switch (type) {
      case 'action':
        return 'bg-blue-50 border-l-4 border-blue-400';
      case 'event':
        return 'bg-amber-50 border-l-4 border-amber-400';
      case 'exam':
        return 'bg-purple-50 border-l-4 border-purple-400';
      case 'system':
        return 'bg-slate-100 border-l-4 border-slate-400 font-medium';
      default:
        return 'bg-white border-b border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white py-3 px-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <h6 className="font-bold text-slate-700">校园实录</h6>
        </div>
        <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">
          第 {currentWeek} 周 / 40
        </span>
      </div>

      {/* Log Content */}
      <ScrollArea className="h-[400px]" ref={scrollRef}>
        <div className="p-4 space-y-2">
          {logs.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">
              你的高三生活即将开始...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`
                  p-3 rounded-lg text-sm leading-relaxed
                  animate-in fade-in slide-in-from-left-2 duration-300
                  ${getTypeStyles(log.type)}
                `}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-400 font-mono shrink-0 mt-0.5">
                    W{log.week}
                  </span>
                  <div 
                    className="text-slate-700"
                    dangerouslySetInnerHTML={{ __html: log.message }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
