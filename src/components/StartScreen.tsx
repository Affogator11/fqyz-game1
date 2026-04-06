import { GraduationCap, Shield, Heart, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEACHERS } from '@/types/game';

interface StartScreenProps {
  onSelect: (teacherId: number) => void;
}

export function StartScreen({ onSelect }: StartScreenProps) {
  const teachers = [
    {
      ...TEACHERS[1],
      icon: Shield,
      color: 'border-red-400 text-red-500 hover:bg-red-50',
      bgColor: 'bg-red-500',
      feature: '分值积累极快 (+2.2/周)',
      warning: '但初始压力和增幅巨大',
    },
    {
      ...TEACHERS[2],
      icon: Heart,
      color: 'border-green-400 text-green-500 hover:bg-green-50',
      bgColor: 'bg-green-500',
      feature: '压力增长缓慢 (-2/周)',
      warning: '更容易触发各种校园小确幸',
    },
    {
      ...TEACHERS[3],
      icon: Trophy,
      color: 'border-purple-400 text-purple-500 hover:bg-purple-50',
      bgColor: 'bg-purple-500',
      feature: '初始分极高 (610)',
      warning: '但错题和压力将是你最大的敌人',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            封丘一中：高三生存法则
          </h1>
          <p className="text-slate-500 italic">
            "南街的灯火，是为了照亮奋斗的人"
          </p>
        </div>

        {/* Teacher Selection */}
        <div className="space-y-3">
          <p className="text-sm text-slate-400 text-center mb-4">
            请选择你的高三起点
          </p>
          
          {teachers.map((teacher) => (
            <Button
              key={teacher.id}
              variant="outline"
              onClick={() => onSelect(teacher.id)}
              className={`w-full h-auto p-4 text-left border-2 ${teacher.color} transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className={`${teacher.bgColor} text-white p-2 rounded-lg shrink-0`}>
                  <teacher.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base mb-1">
                    【{teacher.id === 1 ? '17班' : teacher.id === 2 ? '18班' : '清北班'}】
                    {teacher.name.split(' ')[0]} - {teacher.name.split(' ')[1].replace(/[()]/g, '')}
                  </div>
                  <div className="text-xs opacity-80">
                    <span className="font-medium">{teacher.feature}</span>
                    <span className="opacity-60">，{teacher.warning}</span>
                  </div>
                  <div className="text-xs opacity-60 mt-1 line-clamp-1">
                    {teacher.style}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>40周极限挑战 · AI动态叙事 · 封丘本土化</p>
          <p className="mt-1">V2.0 状态修正平衡版</p>
        </div>
      </div>
    </div>
  );
}
