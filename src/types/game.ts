// 游戏类型定义

// 6科目掌握程度（按高考实际分值）
export interface SubjectScores {
  chinese: number;   // 语文 0-150
  math: number;      // 数学 0-150
  english: number;   // 英语 0-150
  physics: number;   // 物理 0-110
  chemistry: number; // 化学 0-100
  biology: number;   // 生物 0-90
}

// 科目满分配置
export const SUBJECT_MAX_SCORES: Record<keyof SubjectScores, number> = {
  chinese: 150,
  math: 150,
  english: 150,
  physics: 110,
  chemistry: 100,
  biology: 90,
};

// 高考总分
export const TOTAL_MAX_SCORE = 750;

export interface GameState {
  week: number;
  ap: number; // 行动力
  academicBase: number; // 学力基础值（已废弃，保留兼容）
  studyState: number; // 学习手感 0-100
  stress: number; // 心理压力 0-100
  health: number; // 身体机能 0-100
  happy: number; // 幸福度 0-100
  subjects: SubjectScores; // 6科目掌握程度
  lastScore: number; // 上次周考总分
  teacher: string;
  t_id: number;
}

export interface TeacherConfig {
  id: number;
  name: string;
  base: number; // 初始学力（已废弃）
  sMod: number; // 每周压力变化
  bMod: number; // 每周学力增长（已废弃）
  style: string;
  // 班主任特色事件权重
  eventWeights: {
    strict: number; // 严厉事件
    caring: number; // 关怀事件
    academic: number; // 学术事件
  };
  // 班主任擅长的科目（影响AI事件生成）
  strongSubjects?: (keyof SubjectScores)[];
}

export interface ActionConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  subject: keyof SubjectScores | null; // 对应的科目，null表示不针对特定科目
  effects: ActionEffect;
  apCost: number; // 精力消耗，弱势科目可能为2
}

export interface ActionEffect {
  academicBase?: number;
  studyState?: number;
  stress?: number;
  health?: number;
  happy?: number;
  subjects?: Partial<SubjectScores>; // 科目提升
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'life' | 'social' | 'accident' | 'teacher' | 'subject';
  difficulty: 'minor' | 'moderate' | 'severe';
  isPositive: boolean;
  effects: ActionEffect;
  // 关联的科目（科目相关事件）
  relatedSubject?: keyof SubjectScores;
  conditions?: {
    minStress?: number;
    maxStress?: number;
    minWeek?: number;
    maxWeek?: number;
    teacherId?: number;
    // 科目条件
    minSubject?: keyof SubjectScores;
    maxSubject?: keyof SubjectScores;
    minSubjectScore?: number;
    maxSubjectScore?: number;
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
    subjects?: Partial<SubjectScores>;
  };
  reason: string;
  // 关联的科目
  relatedSubject?: keyof SubjectScores;
}

export interface LogEntry {
  id: string;
  week: number;
  message: string;
  type: 'normal' | 'action' | 'event' | 'exam' | 'system';
  timestamp: number;
}

// 初始科目分数（按满分比例，约40%）
export const INITIAL_SUBJECTS: SubjectScores = {
  chinese: 60,   // 语文 60/150
  math: 60,      // 数学 60/150
  english: 60,   // 英语 60/150
  physics: 45,   // 物理 45/110
  chemistry: 40, // 化学 40/100
  biology: 35,   // 生物 35/90
};

export const INITIAL_STATE: GameState = {
  week: 1,
  ap: 5,
  academicBase: 500,
  studyState: 80,
  stress: 20,
  health: 100,
  happy: 80,
  subjects: { ...INITIAL_SUBJECTS },
  lastScore: 0,
  teacher: '',
  t_id: 0,
};

// 科目配置
export const SUBJECT_CONFIG: Record<keyof SubjectScores, { name: string; icon: string; color: string; maxScore: number }> = {
  chinese: { name: '语文', icon: 'BookOpen', color: 'text-red-500', maxScore: 150 },
  math: { name: '数学', icon: 'Calculator', color: 'text-blue-500', maxScore: 150 },
  english: { name: '英语', icon: 'Languages', color: 'text-purple-500', maxScore: 150 },
  physics: { name: '物理', icon: 'Atom', color: 'text-orange-500', maxScore: 110 },
  chemistry: { name: '化学', icon: 'FlaskConical', color: 'text-green-500', maxScore: 100 },
  biology: { name: '生物', icon: 'Dna', color: 'text-cyan-500', maxScore: 90 },
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
    strongSubjects: ['physics', 'chemistry'],
  },
  2: {
    id: 2,
    name: '许卫峰 (良师)',
    base: 480,
    sMod: -2,
    bMod: 1.2,
    style: '温和、开明、注重学生心态调节和饮食营养。会在晚自习放轻音乐。',
    eventWeights: { strict: 0.1, caring: 0.6, academic: 0.3 },
    strongSubjects: ['chinese', 'biology'],
  },
  3: {
    id: 3,
    name: '周立俊 (精英)',
    base: 610,
    sMod: 12,
    bMod: 3.5,
    style: '高压精英主义、视二本线为耻辱、追求满分答卷。课间都在讲压轴题。',
    eventWeights: { strict: 0.4, caring: 0.05, academic: 0.55 },
    strongSubjects: ['math', 'physics'],
  },
};

// 总分等级（按高考实际分数线）
export const RANKS = [
  { min: 705, label: '👑 清北苗子', color: 'text-yellow-500' },
  { min: 650, label: '🥇 C9 联盟', color: 'text-purple-500' },
  { min: 620, label: '🏆 985 重本', color: 'text-blue-500' },
  { min: 580, label: '🌟 211 名校', color: 'text-green-500' },
  { min: 545, label: '📚 重点一本', color: 'text-cyan-500' },
  { min: 480, label: '⚠️ 二本线边缘', color: 'text-orange-500' },
  { min: 0, label: '🔧 务工预备役', color: 'text-gray-500' },
];

// 科目等级（按掌握百分比）
export const SUBJECT_RANKS = [
  { minPercent: 90, label: '精通', color: 'text-green-600' },
  { minPercent: 75, label: '良好', color: 'text-blue-600' },
  { minPercent: 60, label: '中等', color: 'text-yellow-600' },
  { minPercent: 45, label: '薄弱', color: 'text-orange-600' },
  { minPercent: 0, label: '危险', color: 'text-red-600' },
];

// 弱势科目阈值（掌握百分比 < 40%）
export const WEAK_SUBJECT_PERCENT_THRESHOLD = 40;
