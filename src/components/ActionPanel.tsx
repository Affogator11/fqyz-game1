import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  BookCheck, 
  Zap, 
  Utensils, 
  Clock, 
  Smartphone, 
  MessageCircleHeart,
  BatteryCharging,
  type LucideIcon
} from 'lucide-react';
import { ACTIONS } from '@/hooks/useGameState';

interface ActionPanelProps {
  ap: number;
  onAction: (actionId: string) => void;
  disabled: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Pencil,
  BookCheck,
  Zap,
  Utensils,
  Clock,
  Smartphone,
  MessageCircleHeart,
  BatteryCharging,
};

export function ActionPanel({ ap, onAction, disabled }: ActionPanelProps) {
  const actions = Object.values(ACTIONS);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = iconMap[action.icon] || BatteryCharging;
        const isPhone = action.id === 'phone';
        
        return (
          <Button
            key={action.id}
            variant="outline"
            onClick={() => onAction(action.id)}
            disabled={disabled || ap <= 0}
            className={`
              h-auto py-4 px-3 flex flex-col items-center justify-center gap-2
              border border-slate-200 bg-white hover:bg-slate-50
              transition-all duration-200 rounded-xl
              ${disabled || ap <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-md'}
              ${isPhone ? 'border-red-200 hover:border-red-300 hover:bg-red-50' : 'hover:border-blue-300'}
            `}
          >
            <Icon 
              className={`w-6 h-6 ${isPhone ? 'text-red-500' : 'text-blue-500'}`} 
            />
            <div className="text-center">
              <div className={`font-bold text-sm ${isPhone ? 'text-red-600' : 'text-slate-700'}`}>
                {action.name}
              </div>
              <div className={`text-xs mt-0.5 ${isPhone ? 'text-red-400' : 'text-slate-400'}`}>
                {action.description}
              </div>
            </div>
          </Button>
        );
      })}

      {/* AP Display */}
      <div className="h-auto py-4 px-3 flex flex-col items-center justify-center gap-2 border border-blue-200 bg-blue-50 rounded-xl">
        <BatteryCharging className="w-6 h-6 text-blue-500" />
        <div className="text-center">
          <div className="font-bold text-sm text-slate-700">
            精力: <span className="text-blue-600 text-lg">{ap}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            本周剩余行动力
          </div>
        </div>
      </div>
    </div>
  );
}
