// 游戏类型定义

export interface GameState {
  week: number;
  ap: number; // 行动力
  academicBase: number; // 学力基础值
  studyState: number; // 学习手感 0-100
  stress: number; // 心理压力 0-100
  health: number; // 身体机能 0-100
  happy: number; // 幸福度 0-100
  lastScore: number;
  teacher: string;
  t_id: number;
}

export interface TeacherConfig {
  id: number;
  name: string;
  base: number;
  sMod: number; // 每周压力变化
  bMod: number; // 每周学力增长
  style: string;
  // 班主任特色事件权重
  eventWeights: {
    strict: number; // 严厉事件
    caring: number; // 关怀事件
    academic: number; // 学术事件
  };
}

export interface ActionConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  effects: ActionEffect;
  cooldown?: number;
}

export interface ActionEffect {
  academicBase?: number;
  studyState?: number;
  stress?: number;
  health?: number;
  happy?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'life' | 'social' | 'accident' | 'teacher';
  difficulty: 'minor' | 'moderate' | 'severe';
  isPositive: boolean;
  effects: ActionEffect;
  conditions?: {
    minStress?: number;
    maxStress?: number;
    minWeek?: number;
    maxWeek?: number;
    teacherId?: number;
  };
}

export interface AIGeneratedEvent {
  title: string;
  description: string;
  category: string;
  effects: {
    studyState: number;
    academicBase: number;
    stress: number;
    happy: number;
    health?: number;
  };
  reason: string;
}

export interface LogEntry {
  id: string;
  week: number;
  message: string;
  type: 'normal' | 'action' | 'event' | 'exam' | 'system';
  timestamp: number;
}

export const INITIAL_STATE: GameState = {
  week: 1,
  ap: 5,
  academicBase: 500,
  studyState: 80,
  stress: 20,
  health: 100,
  happy: 80,
  lastScore: 0,
  teacher: '',
  t_id: 0,
};

export const TEACHERS: Record<number, TeacherConfig> = {
  1: {
    id: 1,
    name: '王俊玲 (严师)',
    base: 500,
    sMod: 8,
    bMod: 2.2,
    style: '严厉、铁面、极度看重卷面分和早操纪律。她的班级永远是最早到教室的。',
    eventWeights: { strict: 0.5, caring: 0.1, academic: 0.4 },
  },
  2: {
    id: 2,
    name: '许卫峰 (良师)',
    base: 480,
    sMod: -2,
    bMod: 1.2,
    style: '温和、开明、注重学生心态调节和饮食营养。会在晚自习放轻音乐。',
    eventWeights: { strict: 0.1, caring: 0.6, academic: 0.3 },
  },
  3: {
    id: 3,
    name: '周立俊 (精英)',
    base: 610,
    sMod: 12,
    bMod: 3.5,
    style: '高压精英主义、视二本线为耻辱、追求满分答卷。课间都在讲压轴题。',
    eventWeights: { strict: 0.4, caring: 0.05, academic: 0.55 },
  },
};

// 分数等级
export const RANKS = [
  { min: 705, label: '👑 清北苗子', color: 'text-yellow-500' },
  { min: 650, label: '🥇 C9 联盟', color: 'text-purple-500' },
  { min: 620, label: '🏆 985 重本', color: 'text-blue-500' },
  { min: 580, label: '🌟 211 名校', color: 'text-green-500' },
  { min: 545, label: '📚 重点一本', color: 'text-cyan-500' },
  { min: 480, label: '⚠️ 二本线边缘', color: 'text-orange-500' },
  { min: 0, label: '🔧 务工预备役', color: 'text-gray-500' },
];
