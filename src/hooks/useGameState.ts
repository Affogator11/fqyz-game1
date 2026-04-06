// 游戏状态管理 Hook
import { useState, useCallback, useEffect } from 'react';
import { INITIAL_STATE, TEACHERS, RANKS } from '@/types/game';
import type { GameState, TeacherConfig } from '@/types/game';

// 数值边界
const LIMITS = {
  studyState: { min: 0, max: 100 },
  stress: { min: 0, max: 100 },
  health: { min: 0, max: 100 },
  happy: { min: 0, max: 100 },
  academicBase: { min: 200, max: 750 },
};

// 操作配置
export const ACTIONS = {
  study: {
    id: 'study',
    name: '刷理综卷子',
    icon: 'Pencil',
    description: '分值++ 压力++',
    effects: { academicBase: 2, studyState: 6, stress: 10, health: -2 },
  },
  think: {
    id: 'think',
    name: '整理纠错本',
    icon: 'BookCheck',
    description: '手感++ 压力+',
    effects: { studyState: 15, academicBase: 0.8, stress: 3, happy: 2 },
  },
  run: {
    id: 'run',
    name: '操场喊口号',
    icon: 'Zap',
    description: '压力-- 健康+',
    effects: { stress: -18, health: 12, studyState: 2 },
  },
  eat: {
    id: 'eat',
    name: '食堂抢肉丝',
    icon: 'Utensils',
    description: '幸福++ 压力-',
    effects: { happy: 22, stress: -10, health: 5 },
  },
  sleep: {
    id: 'sleep',
    name: '深度小憩',
    icon: 'Clock',
    description: '健康++ 手感+',
    effects: { health: 18, studyState: 10, stress: -5 },
  },
  phone: {
    id: 'phone',
    name: '违禁手机',
    icon: 'Smartphone',
    description: '风险极高|巨额减压',
    effects: {}, // 特殊处理
  },
  chat: {
    id: 'chat',
    name: '走廊扯淡',
    icon: 'MessageCircleHeart',
    description: '幸福+ 手感-',
    effects: { happy: 18, studyState: -6, stress: -3 },
  },
};

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // 从本地存储加载
  useEffect(() => {
    const saved = localStorage.getItem('fqyz_v2_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error('加载存档失败:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('fqyz_v2_save', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // 计算当前分数（考虑状态联动）
  const calculateScore = useCallback((customState?: GameState): number => {
    const s = customState || state;
    
    // 基础效率系数
    let efficiency = (s.studyState / 100) * 0.4 + (s.happy / 100) * 0.15 - (s.stress / 100) * 0.3 + 0.75;
    
    // 健康惩罚：健康低于50时效率下降
    if (s.health < 50) {
      efficiency *= (0.5 + s.health / 100);
    }
    
    // 压力惩罚：压力高于80时效率大幅下降
    if (s.stress > 80) {
      efficiency *= 0.7;
    }
    
    // 幸福加成：幸福高于70时有小幅加成
    if (s.happy > 70) {
      efficiency *= 1.05;
    }
    
    // 边界限制
    efficiency = Math.max(0.3, Math.min(1.1, efficiency));
    
    return Math.floor(s.academicBase * efficiency);
  }, [state]);

  // 获取当前等级
  const getRank = useCallback((score?: number) => {
    const s = score || calculateScore();
    return RANKS.find((r) => s >= r.min) || RANKS[RANKS.length - 1];
  }, [calculateScore]);

  // 获取班主任配置
  const getTeacher = useCallback((): TeacherConfig | null => {
    return state.t_id ? TEACHERS[state.t_id] : null;
  }, [state.t_id]);

  // 初始化游戏
  const initGame = useCallback((teacherId: number) => {
    const teacher = TEACHERS[teacherId];
    const newState: GameState = {
      ...INITIAL_STATE,
      t_id: teacherId,
      teacher: teacher.name,
      academicBase: teacher.base,
    };
    setState(newState);
    return newState;
  }, []);

  // 应用数值变化（带边界检查）
  const applyChanges = useCallback((changes: Partial<GameState>): GameState => {
    setState((prev) => {
      const next = { ...prev };
      
      Object.entries(changes).forEach(([key, value]) => {
        if (value !== undefined && key in prev) {
          const k = key as keyof GameState;
          const prevValue = prev[k] as number;
          const changeValue = value as number;
          let newValue = prevValue + changeValue;
          
          // 应用边界
          if (k in LIMITS) {
            const limit = LIMITS[k as keyof typeof LIMITS];
            newValue = Math.max(limit.min, Math.min(limit.max, newValue));
          }
          
          (next[k] as number) = newValue;
        }
      });
      
      return next;
    });
    
    return { ...state, ...changes };
  }, [state]);

  // 执行操作
  const executeAction = useCallback((actionId: string): { success: boolean; message: string; changes: Partial<GameState> } => {
    if (state.ap <= 0) {
      return { success: false, message: '精力不足！', changes: {} };
    }

    const action = ACTIONS[actionId as keyof typeof ACTIONS];
    if (!action) {
      return { success: false, message: '未知操作', changes: {} };
    }

    // 特殊处理：玩手机
    if (actionId === 'phone') {
      const caught = Math.random() < 0.5; // 50%被抓概率
      if (caught) {
        const changes = { ap: -1, stress: 45, happy: -35, studyState: -15 };
        applyChanges(changes);
        return {
          success: true,
          message: '😱 王俊玲出现在后窗！手机当场没收，全校通报！你感觉天都要塌了。',
          changes,
        };
      } else {
        const changes = { ap: -1, happy: 45, stress: -30 };
        applyChanges(changes);
        return {
          success: true,
          message: '刺激！在厕所隔间偷偷刷完了最新的贴吧消息，压力瞬间释放。',
          changes,
        };
      }
    }

    // 普通操作
    const changes: Partial<GameState> = { ap: -1 };
    Object.entries(action.effects).forEach(([key, value]) => {
      if (value !== undefined) {
        (changes as Record<string, number>)[key] = value;
      }
    });

    applyChanges(changes);

    // 生成操作描述
    const descriptions: Record<string, string> = {
      study: '你刷完了本周的物理加试卷，复杂的电磁感应题让你的大脑高速运转。',
      think: '纠错本上的红蓝标注，是你对抗高考的防线，每一道错题都是进步的阶梯。',
      run: '清晨白气中，18班的口号声让你短暂忘记了分数，只感受到奔跑的力量。',
      eat: '抢到了一份带肉丝的白菜和热馒头，封丘一中的食堂今天格外温柔。',
      sleep: '课间十分钟深度睡眠，梦里你考上了理想的大学，醒来时嘴角还带着笑。',
      chat: '你和同桌吐槽班主任的黑框眼镜，笑得很开心，暂时忘记了周考的焦虑。',
    };

    return {
      success: true,
      message: descriptions[actionId] || '你度过了一段充实的时光。',
      changes,
    };
  }, [state.ap, applyChanges]);

  // 应用AI事件效果
  const applyEventEffects = useCallback((effects: {
    studyState?: number;
    academicBase?: number;
    stress?: number;
    happy?: number;
    health?: number;
  }) => {
    applyChanges(effects);
  }, [applyChanges]);

  // 进入下一周
  const nextWeek = useCallback(() => {
    const teacher = getTeacher();
    if (!teacher) return null;

    const currentScore = calculateScore();
    const scoreChange = currentScore - state.lastScore;

    setState((prev) => {
      const next = { ...prev };
      next.week += 1;
      next.ap = 5;
      next.academicBase += teacher.bMod;
      next.stress += teacher.sMod;
      next.studyState -= 5; // 每周自然衰减
      
      // 边界检查
      next.academicBase = Math.min(LIMITS.academicBase.max, Math.max(LIMITS.academicBase.min, next.academicBase));
      next.stress = Math.min(LIMITS.stress.max, Math.max(LIMITS.stress.min, next.stress));
      next.studyState = Math.min(LIMITS.studyState.max, Math.max(LIMITS.studyState.min, next.studyState));
      
      return next;
    });

    return {
      score: currentScore,
      change: scoreChange,
    };
  }, [getTeacher, calculateScore, state.lastScore]);

  // 检查游戏结束条件
  const checkGameOver = useCallback((): { isOver: boolean; reason: string; finalScore?: number } => {
    const score = calculateScore();
    
    if (state.stress >= 100) {
      return { isOver: true, reason: '【精神崩溃】你受不了一中的高压，在走廊上崩溃大哭，被家长接回了家。', finalScore: score };
    }
    
    if (state.health <= 0) {
      return { isOver: true, reason: '【积劳成疾】你住进了封丘五院，医生说你必须休学调养。', finalScore: score };
    }
    
    if (state.week > 40) {
      return { isOver: true, reason: `【高考结束】最终成绩：${score}分。去南街好好吃一顿吧！`, finalScore: score };
    }
    
    return { isOver: false, reason: '' };
  }, [state.stress, state.health, state.week, calculateScore]);

  // 重置游戏
  const resetGame = useCallback(() => {
    localStorage.removeItem('fqyz_v2_save');
    setState(INITIAL_STATE);
    window.location.reload();
  }, []);

  // 获取周考反馈
  const getExamFeedback = useCallback((scoreChange: number): string => {
    if (state.stress > 85) {
      return '【警告】你因为压力太大导致考试时手抖，填涂卡都差点涂错。必须减压了！';
    }
    if (scoreChange > 20) {
      return '【大捷】班主任在班会上点名表扬了你，周围投来羡慕的目光，你成了班级的焦点。';
    }
    if (scoreChange > 10) {
      return '【进步】成绩稳步上升，你的努力终于有了回报，继续保持！';
    }
    if (scoreChange < -20) {
      return '【滑铁卢】成绩大幅下滑，班主任找你谈话时你恨不得找个地缝钻进去。';
    }
    if (scoreChange < -10) {
      return '【退步】这次没考好，但你告诉自己：高考前的每一次失败都是宝贵的经验。';
    }
    if (Math.abs(scoreChange) <= 5) {
      return '【平稳】成绩保持稳定，在高三这个阶段，稳定就是胜利。';
    }
    return '周考榜单贴在南墙上，周围挤满了学生，你在人群中寻找自己的名字。';
  }, [state.stress]);

  return {
    state,
    isInitialized,
    calculateScore,
    getRank,
    getTeacher,
    initGame,
    executeAction,
    applyEventEffects,
    nextWeek,
    checkGameOver,
    resetGame,
    getExamFeedback,
  };
}
