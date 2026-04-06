// 游戏状态管理 Hook
import { useState, useCallback, useEffect } from 'react';
import { INITIAL_STATE, TEACHERS, RANKS, SUBJECT_CONFIG, SUBJECT_MAX_SCORES, WEAK_SUBJECT_PERCENT_THRESHOLD } from '@/types/game';
import type { GameState, TeacherConfig, SubjectScores } from '@/types/game';

// 数值边界
const LIMITS = {
  studyState: { min: 0, max: 100 },
  stress: { min: 0, max: 100 },
  health: { min: 0, max: 100 },
  happy: { min: 0, max: 100 },
  academicBase: { min: 200, max: 750 },
  subject: { min: 0, max: 150 }, // 最大150分（语数英）
};

// 6科目行动配置
export const SUBJECT_ACTIONS = {
  chinese: {
    id: 'chinese',
    name: '背古诗词',
    icon: 'BookOpen',
    description: '语文++ 手感+',
    subject: 'chinese' as const,
    baseEffects: { studyState: 4, academicBase: 0.3, stress: 3 },
  },
  math: {
    id: 'math',
    name: '刷数学题',
    icon: 'Calculator',
    description: '数学++ 手感+',
    subject: 'math' as const,
    baseEffects: { studyState: 5, academicBase: 0.5, stress: 5 },
  },
  english: {
    id: 'english',
    name: '背单词',
    icon: 'Languages',
    description: '英语++ 手感+',
    subject: 'english' as const,
    baseEffects: { studyState: 4, academicBase: 0.3, stress: 3 },
  },
  physics: {
    id: 'physics',
    name: '做物理题',
    icon: 'Atom',
    description: '物理++ 手感+',
    subject: 'physics' as const,
    baseEffects: { studyState: 5, academicBase: 0.4, stress: 4 },
  },
  chemistry: {
    id: 'chemistry',
    name: '背化学式',
    icon: 'FlaskConical',
    description: '化学++ 手感+',
    subject: 'chemistry' as const,
    baseEffects: { studyState: 4, academicBase: 0.3, stress: 3 },
  },
  biology: {
    id: 'biology',
    name: '看生物书',
    icon: 'Dna',
    description: '生物++ 手感+',
    subject: 'biology' as const,
    baseEffects: { studyState: 3, academicBase: 0.2, stress: 2 },
  },
};

// 其他行动配置
export const OTHER_ACTIONS = {
  think: {
    id: 'think',
    name: '整理纠错本',
    icon: 'BookCheck',
    description: '手感++ 压力+',
    subject: null,
    baseEffects: { studyState: 12, academicBase: 0.5, stress: 2, happy: 2 },
  },
  run: {
    id: 'run',
    name: '操场喊口号',
    icon: 'Zap',
    description: '压力-- 健康+',
    subject: null,
    baseEffects: { stress: -18, health: 12, studyState: 2 },
  },
  eat: {
    id: 'eat',
    name: '食堂抢肉丝',
    icon: 'Utensils',
    description: '幸福++ 压力-',
    subject: null,
    baseEffects: { happy: 22, stress: -10, health: 5 },
  },
  sleep: {
    id: 'sleep',
    name: '深度小憩',
    icon: 'Clock',
    description: '健康++ 手感+',
    subject: null,
    baseEffects: { health: 18, studyState: 10, stress: -5 },
  },
  phone: {
    id: 'phone',
    name: '违禁手机',
    icon: 'Smartphone',
    description: '风险极高|巨额减压',
    subject: null,
    baseEffects: {},
  },
  chat: {
    id: 'chat',
    name: '走廊扯淡',
    icon: 'MessageCircleHeart',
    description: '幸福+ 手感-',
    subject: null,
    baseEffects: { happy: 18, studyState: -6, stress: -3 },
  },
};

// 合并所有行动
export const ALL_ACTIONS = { ...SUBJECT_ACTIONS, ...OTHER_ACTIONS };

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // 从本地存储加载
  useEffect(() => {
    const saved = localStorage.getItem('fqyz_v2_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 兼容旧存档：如果没有subjects，添加初始值
        if (!parsed.subjects) {
          parsed.subjects = { ...INITIAL_STATE.subjects };
        }
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

  // 计算科目平均分
  const getSubjectAverage = useCallback((subjects?: SubjectScores): number => {
    const s = subjects || state.subjects;
    const values = Object.values(s);
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [state.subjects]);

  // 判断是否为弱势科目（按掌握百分比 < 40%）
  const isWeakSubject = useCallback((subject: keyof SubjectScores): boolean => {
    const score = state.subjects[subject];
    const maxScore = SUBJECT_MAX_SCORES[subject];
    return (score / maxScore) * 100 < WEAK_SUBJECT_PERCENT_THRESHOLD;
  }, [state.subjects]);

  // 获取最弱势科目
  const getWeakestSubject = useCallback((): keyof SubjectScores => {
    const entries = Object.entries(state.subjects) as [keyof SubjectScores, number][];
    return entries.reduce((a, b) => a[1] < b[1] ? a : b)[0];
  }, [state.subjects]);

  // 计算当前总分（六科直接相加 × 效率系数）
  const calculateScore = useCallback((customState?: GameState): number => {
    const s = customState || state;
    
    // 六科原始总分
    const rawScore = Object.values(s.subjects).reduce((total, score) => {
      return total + score;
    }, 0);
    
    // 基础效率系数（受学习手感、幸福度、压力影响）
    let efficiency = (s.studyState / 100) * 0.3 + (s.happy / 100) * 0.15 - (s.stress / 100) * 0.25 + 0.8;
    
    // 健康惩罚：健康低于50时效率下降
    if (s.health < 50) {
      efficiency *= (0.6 + s.health / 100 * 0.4);
    }
    
    // 压力惩罚：压力高于80时效率大幅下降
    if (s.stress > 80) {
      efficiency *= 0.75;
    }
    
    // 幸福加成：幸福高于70时有小幅加成
    if (s.happy > 70) {
      efficiency *= 1.08;
    }
    
    // 边界限制（效率在0.5-1.2之间）
    efficiency = Math.max(0.5, Math.min(1.2, efficiency));
    
    return Math.floor(rawScore * efficiency);
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
      subjects: { ...INITIAL_SUBJECTS },
    };
    setState(newState);
    return newState;
  }, []);

  // 应用数值变化（带边界检查）
  const applyChanges = useCallback((changes: Partial<Omit<GameState, 'subjects'>> & { subjects?: Partial<SubjectScores> }): GameState => {
    setState((prev) => {
      const next = { ...prev };
      
      Object.entries(changes).forEach(([key, value]) => {
        if (value !== undefined && key in prev) {
          const k = key as keyof GameState;
          
          // 特殊处理 subjects 对象
          if (k === 'subjects' && typeof value === 'object' && !Array.isArray(value)) {
            const subjectChanges = value as Partial<SubjectScores>;
            next.subjects = { ...prev.subjects };
            // 合并科目变化
            (Object.keys(subjectChanges) as (keyof SubjectScores)[]).forEach((sk) => {
              const changeVal = subjectChanges[sk];
              if (changeVal !== undefined) {
                next.subjects[sk] = Math.max(LIMITS.subject.min, Math.min(LIMITS.subject.max, next.subjects[sk] + changeVal));
              }
            });
          } else if (typeof value === 'number') {
            const prevValue = prev[k] as number;
            let newValue = prevValue + value;
            
            // 应用边界
            if (k in LIMITS && k !== 'subjects') {
              const limit = LIMITS[k as keyof typeof LIMITS];
              if (limit && 'min' in limit && 'max' in limit) {
                newValue = Math.max(limit.min, Math.min(limit.max, newValue));
              }
            }
            
            (next[k] as number) = newValue;
          }
        }
      });
      
      return next;
    });
    
    // 构建返回值，确保 subjects 是完整的 SubjectScores
    const result = { ...state, ...changes };
    // 如果 changes 中有 subjects，需要合并而不是替换
    if (changes.subjects) {
      result.subjects = { ...state.subjects, ...changes.subjects };
    }
    return result as GameState;
  }, [state]);

  // 执行科目学习行动
  const executeSubjectAction = useCallback((subject: keyof SubjectScores): { 
    success: boolean; 
    message: string; 
    changes: Partial<Omit<GameState, 'subjects'>> & { subjects?: Partial<SubjectScores> };
    apCost: number;
  } => {
    const isWeak = isWeakSubject(subject);
    const apCost = isWeak ? 2 : 1;
    
    if (state.ap < apCost) {
      return { success: false, message: `精力不足！${isWeak ? '弱势科目需要2点精力' : ''}`, changes: {}, apCost: 0 };
    }

    const action = SUBJECT_ACTIONS[subject];
    const subjectName = SUBJECT_CONFIG[subject].name;
    const maxScore = SUBJECT_MAX_SCORES[subject];
    
    // 计算科目提升（按满分比例，弱势科目提升更多）
    // 正常：提升约 4-6% 的满分值
    // 弱势：提升约 6-9% 的满分值
    const basePercent = isWeak ? 0.07 : 0.05;
    const randomPercent = (Math.random() * 0.02); // 0-2% 随机
    const subjectGain = Math.floor(maxScore * (basePercent + randomPercent));
    
    // 弱势科目学习压力更大
    const stressGain = isWeak ? action.baseEffects.stress + 5 : action.baseEffects.stress;
    
    const changes: Partial<Omit<GameState, 'subjects'>> & { subjects?: Partial<SubjectScores> } = { 
      ap: -apCost,
      studyState: action.baseEffects.studyState,
      academicBase: action.baseEffects.academicBase,
      stress: stressGain,
      subjects: { [subject]: subjectGain },
    };

    applyChanges(changes);

    // 生成描述
    const descriptions: Record<keyof SubjectScores, string[]> = {
      chinese: [
        `你背诵了《赤壁赋》，文言文的韵律让你渐入佳境。`,
        `作文素材积累本上又多了几条好词好句。`,
        `古诗词鉴赏终于摸到了门道。`,
      ],
      math: [
        `导数压轴题的思路越来越清晰了。`,
        `立体几何的空间想象能力提升了不少。`,
        `数列求和的技巧又掌握了一种。`,
      ],
      english: [
        `3500词汇表又攻克了50个生词。`,
        `完形填空的语感慢慢找回来了。`,
        `作文模板背得滚瓜烂熟。`,
      ],
      physics: [
        `电磁感应的综合题终于有思路了。`,
        `力学分析的速度明显变快了。`,
        `实验题的答题规范掌握得更好。`,
      ],
      chemistry: [
        `元素周期表的前20号元素倒背如流。`,
        `有机反应的机理理解更深了。`,
        `化学方程式的配平速度提升。`,
      ],
      biology: [
        `细胞分裂的过程在脑海里有了画面。`,
        `遗传概率的计算更加熟练。`,
        `生态系统的知识框架搭建完成。`,
      ],
    };

    const descList = descriptions[subject];
    const desc = descList[Math.floor(Math.random() * descList.length)];
    
    const weakWarning = isWeak ? `【${subjectName}是弱势科目，学习格外吃力，消耗了2点精力】` : '';

    return {
      success: true,
      message: `${weakWarning}${desc} ${subjectName}掌握度+${subjectGain}！`,
      changes,
      apCost,
    };
  }, [state.ap, state.subjects, applyChanges]);

  // 执行其他行动
  const executeOtherAction = useCallback((actionId: string): { 
    success: boolean; 
    message: string; 
    changes: Partial<Omit<GameState, 'subjects'>>;
    apCost: number;
  } => {
    if (state.ap <= 0) {
      return { success: false, message: '精力不足！', changes: {}, apCost: 0 };
    }

    const action = OTHER_ACTIONS[actionId as keyof typeof OTHER_ACTIONS];
    if (!action) {
      return { success: false, message: '未知操作', changes: {}, apCost: 0 };
    }

    // 特殊处理：玩手机
    if (actionId === 'phone') {
      const caught = Math.random() < 0.5;
      if (caught) {
        const changes = { ap: -1, stress: 45, happy: -35, studyState: -15 };
        applyChanges(changes);
        return {
          success: true,
          message: '😱 王俊玲出现在后窗！手机当场没收，全校通报！你感觉天都要塌了。',
          changes,
          apCost: 1,
        };
      } else {
        const changes = { ap: -1, happy: 45, stress: -30 };
        applyChanges(changes);
        return {
          success: true,
          message: '刺激！在厕所隔间偷偷刷完了最新的贴吧消息，压力瞬间释放。',
          changes,
          apCost: 1,
        };
      }
    }

    // 普通操作
    const changes: Partial<Omit<GameState, 'subjects'>> = { ap: -1 };
    Object.entries(action.baseEffects).forEach(([key, value]) => {
      if (value !== undefined && key !== 'subjects') {
        (changes as Record<string, number>)[key] = value;
      }
    });

    applyChanges(changes);

    // 生成操作描述
    const descriptions: Record<string, string> = {
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
      apCost: 1,
    };
  }, [state.ap, applyChanges]);

  // 统一执行行动入口
  const executeAction = useCallback((actionId: string): { 
    success: boolean; 
    message: string; 
    changes: Partial<Omit<GameState, 'subjects'>> & { subjects?: Partial<SubjectScores> };
    apCost: number;
  } => {
    // 判断是否为科目行动
    if (actionId in SUBJECT_ACTIONS) {
      return executeSubjectAction(actionId as keyof typeof SUBJECT_ACTIONS);
    }
    return executeOtherAction(actionId) as { success: boolean; message: string; changes: Partial<Omit<GameState, 'subjects'>> & { subjects?: Partial<SubjectScores> }; apCost: number };
  }, [executeSubjectAction, executeOtherAction]);

  // 应用AI事件效果
  const applyEventEffects = useCallback((effects: {
    studyState?: number;
    academicBase?: number;
    stress?: number;
    happy?: number;
    health?: number;
    subjects?: Partial<SubjectScores>;
  }) => {
    const changes: Partial<Omit<GameState, 'subjects'>> & { subjects?: Partial<SubjectScores> } = {};
    if (effects.studyState !== undefined) changes.studyState = effects.studyState;
    if (effects.academicBase !== undefined) changes.academicBase = effects.academicBase;
    if (effects.stress !== undefined) changes.stress = effects.stress;
    if (effects.happy !== undefined) changes.happy = effects.happy;
    if (effects.health !== undefined) changes.health = effects.health;
    if (effects.subjects !== undefined) changes.subjects = effects.subjects;
    applyChanges(changes);
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
      
      // 科目每周自然衰减（轻微）
      (Object.keys(next.subjects) as (keyof SubjectScores)[]).forEach((key) => {
        next.subjects[key] = Math.max(0, next.subjects[key] - 1);
      });
      
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
    
    // 检查是否有科目掉到0
    const zeroSubjects = (Object.entries(state.subjects) as [keyof SubjectScores, number][])
      .filter(([_, score]) => score <= 0);
    if (zeroSubjects.length > 0) {
      const subjectNames = zeroSubjects.map(([key, _]) => SUBJECT_CONFIG[key].name).join('、');
      return { 
        isOver: true, 
        reason: `【严重偏科】你的${subjectNames}完全荒废，已经跟不上课程进度了。`, 
        finalScore: score 
      };
    }
    
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
  }, [state.stress, state.health, state.week, state.subjects, calculateScore]);

  // 重置游戏
  const resetGame = useCallback(() => {
    localStorage.removeItem('fqyz_v2_save');
    setState(INITIAL_STATE);
    window.location.reload();
  }, []);

  // 获取周考反馈
  const getExamFeedback = useCallback((scoreChange: number): string => {
    // 检查弱势科目（掌握百分比 < 40%）
    const weakSubjects = (Object.entries(state.subjects) as [keyof SubjectScores, number][])
      .filter(([key, score]) => {
        const maxScore = SUBJECT_MAX_SCORES[key];
        return (score / maxScore) * 100 < WEAK_SUBJECT_PERCENT_THRESHOLD;
      });
    
    if (weakSubjects.length >= 2) {
      const names = weakSubjects.map(([key, _]) => SUBJECT_CONFIG[key].name).join('、');
      return `【警告】${names}严重拖后腿！再不补上来高考就危险了！`;
    }
    
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
  }, [state.stress, state.subjects]);

  return {
    state,
    isInitialized,
    calculateScore,
    getRank,
    getTeacher,
    getSubjectAverage,
    isWeakSubject,
    getWeakestSubject,
    initGame,
    executeAction,
    applyEventEffects,
    nextWeek,
    checkGameOver,
    resetGame,
    getExamFeedback,
    SUBJECT_ACTIONS,
    OTHER_ACTIONS,
  };
}

// 初始科目分数
const INITIAL_SUBJECTS: SubjectScores = {
  chinese: 60,
  math: 60,
  english: 60,
  physics: 60,
  chemistry: 60,
  biology: 60,
};
