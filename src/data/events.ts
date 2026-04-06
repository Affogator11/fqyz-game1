// 本地事件库 - API失败时的兜底方案
import type { GameEvent } from '@/types/game';

export const LOCAL_EVENTS: GameEvent[] = [
  // ========== 学习类事件 ==========
  {
    id: 'learning_1',
    title: '🔥 顿悟时刻',
    description: '深夜刷题时，你突然理解了困扰已久的物理电磁感应综合题，那种豁然开朗的感觉让你信心倍增。',
    category: 'learning',
    difficulty: 'minor',
    isPositive: true,
    effects: { studyState: 15, academicBase: 2, stress: -5 },
  },
  {
    id: 'learning_2',
    title: '📖 错题本显灵',
    description: '周考正好考到了你昨天整理的一道错题，你顺利拿下这12分，周围同学纷纷投来羡慕的目光。',
    category: 'learning',
    difficulty: 'minor',
    isPositive: true,
    effects: { academicBase: 3, happy: 10, studyState: 5 },
  },
  {
    id: 'learning_3',
    title: '😵 知识过载',
    description: '连续三天每天只睡4小时，你感觉大脑像浆糊一样，看着数学题却完全无法理解题意。',
    category: 'learning',
    difficulty: 'moderate',
    isPositive: false,
    effects: { studyState: -20, health: -10, stress: 15 },
  },
  {
    id: 'learning_4',
    title: '🎯 押题成功',
    description: '你敏锐地察觉到导数题型的变化趋势，重点突破了极值点偏移问题，结果周考真的考了！',
    category: 'learning',
    difficulty: 'moderate',
    isPositive: true,
    effects: { academicBase: 5, studyState: 10, happy: 15 },
  },
  {
    id: 'learning_5',
    title: '💔 发挥失常',
    description: '考场上太紧张，明明会做的题却算错了，交卷那一刻你恨不得给自己一巴掌。',
    category: 'learning',
    difficulty: 'moderate',
    isPositive: false,
    effects: { stress: 20, happy: -15, studyState: -8 },
  },
  {
    id: 'learning_6',
    title: '🏆 单科状元',
    description: '你的理综卷子被选为年级范本，在投影上展示，那种荣誉感让你走路都带风。',
    category: 'learning',
    difficulty: 'severe',
    isPositive: true,
    effects: { academicBase: 4, happy: 25, stress: -10, studyState: 10 },
  },

  // ========== 生活类事件 ==========
  {
    id: 'life_1',
    title: '🍜 南街美食',
    description: '周末偷溜去南街吃了一碗正宗的羊肉烩面，热腾腾的汤水抚慰了你疲惫的身心。',
    category: 'life',
    difficulty: 'minor',
    isPositive: true,
    effects: { happy: 20, stress: -15, health: 5 },
  },
  {
    id: 'life_2',
    title: '😷 感冒来袭',
    description: '教室空调太冷，你不幸中招，鼻塞头痛让你在课上昏昏欲睡。',
    category: 'life',
    difficulty: 'moderate',
    isPositive: false,
    effects: { health: -20, studyState: -10, stress: 10 },
  },
  {
    id: 'life_3',
    title: '💤 深度睡眠',
    description: '难得的一个好觉，醒来时感觉浑身充满了力量，连早操都跑得格外有劲。',
    category: 'life',
    difficulty: 'minor',
    isPositive: true,
    effects: { health: 15, studyState: 8, stress: -8 },
  },
  {
    id: 'life_4',
    title: '🍱 食堂惊喜',
    description: '今天食堂阿姨手没抖，你的红烧肉盖饭里居然有五块肉！这简直是封丘一中的奇迹。',
    category: 'life',
    difficulty: 'minor',
    isPositive: true,
    effects: { happy: 15, stress: -5, health: 5 },
  },
  {
    id: 'life_5',
    title: '🏃 晨跑摔倒',
    description: '5:30跑操时踩到水坑摔了一跤，膝盖擦破了皮，一瘸一拐地完成了早操。',
    category: 'life',
    difficulty: 'minor',
    isPositive: false,
    effects: { health: -12, stress: 8, happy: -5 },
  },
  {
    id: 'life_6',
    title: '🌧️ 暴雨困校',
    description: '突降暴雨，放学时你被困在教学楼，看着雨幕中的校园，莫名有些感伤。',
    category: 'life',
    difficulty: 'minor',
    isPositive: false,
    effects: { happy: -8, stress: 5 },
  },

  // ========== 社交类事件 ==========
  {
    id: 'social_1',
    title: '💕 暗恋心事',
    description: '走廊上偶遇那个让你心动的身影，虽然只是擦肩而过，却让你心跳加速了一整节课。',
    category: 'social',
    difficulty: 'minor',
    isPositive: true,
    effects: { happy: 20, stress: -5, studyState: -5 },
  },
  {
    id: 'social_2',
    title: '👥 兄弟义气',
    description: '同桌把他的笔记借你抄，还帮你打了掩护，这份情谊让你感动不已。',
    category: 'social',
    difficulty: 'minor',
    isPositive: true,
    effects: { happy: 15, stress: -8, studyState: 3 },
  },
  {
    id: 'social_3',
    title: '😤 同学矛盾',
    description: '后排同学总踢你椅子，你忍不住回头吵了一架，心情糟透了。',
    category: 'social',
    difficulty: 'minor',
    isPositive: false,
    effects: { stress: 15, happy: -10, studyState: -5 },
  },
  {
    id: 'social_4',
    title: '🎉 班级活动',
    description: '班主任难得开恩，组织了一次班级聚餐，大家在饭桌上放下了所有压力。',
    category: 'social',
    difficulty: 'moderate',
    isPositive: true,
    effects: { happy: 25, stress: -20, studyState: -3 },
  },
  {
    id: 'social_5',
    title: '📱 手机危机',
    description: '上课玩手机被巡视老师发现，手机被没收还要叫家长，你感觉天都要塌了。',
    category: 'social',
    difficulty: 'severe',
    isPositive: false,
    effects: { stress: 35, happy: -25, studyState: -15 },
  },

  // ========== 班主任特色事件 ==========
  // 王俊玲（严师）事件
  {
    id: 'teacher1_1',
    title: '👁️ 后窗凝视',
    description: '你正走神时，感觉背后一凉——王俊玲正站在后窗冷冷地盯着你，那眼神让你如坠冰窟。',
    category: 'teacher',
    difficulty: 'moderate',
    isPositive: false,
    effects: { stress: 25, studyState: 5 },
    conditions: { teacherId: 1 },
  },
  {
    id: 'teacher1_2',
    title: '📢 当众批评',
    description: '早操队形不整齐，王俊玲当众批评了你，虽然知道她是为你好，但脸上还是火辣辣的。',
    category: 'teacher',
    difficulty: 'minor',
    isPositive: false,
    effects: { stress: 15, happy: -10 },
    conditions: { teacherId: 1 },
  },
  {
    id: 'teacher1_3',
    title: '🏅 严师出高徒',
    description: '王俊玲单独给你讲了一道压轴题，虽然过程严厉，但你真的学会了，对她的敬意又多了几分。',
    category: 'teacher',
    difficulty: 'moderate',
    isPositive: true,
    effects: { academicBase: 4, studyState: 10, stress: 5 },
    conditions: { teacherId: 1 },
  },

  // 许卫峰（良师）事件
  {
    id: 'teacher2_1',
    title: '🎵 音乐疗愈',
    description: '晚自习时，许卫峰放了一首轻音乐，说是让大家放松大脑，你感觉紧绷的神经舒缓了许多。',
    category: 'teacher',
    difficulty: 'minor',
    isPositive: true,
    effects: { stress: -20, happy: 10, studyState: 3 },
    conditions: { teacherId: 2 },
  },
  {
    id: 'teacher2_2',
    title: '🍎 关心慰问',
    description: '看到你脸色不好，许卫峰递给你一个苹果，叮嘱你注意身体，这份温暖让你眼眶一热。',
    category: 'teacher',
    difficulty: 'minor',
    isPositive: true,
    effects: { happy: 20, stress: -10, health: 5 },
    conditions: { teacherId: 2 },
  },
  {
    id: 'teacher2_3',
    title: '💬 心灵对话',
    description: '许卫峰找你谈心，没有谈成绩，只是聊你的理想和困惑，你感觉被理解了。',
    category: 'teacher',
    difficulty: 'moderate',
    isPositive: true,
    effects: { stress: -25, happy: 15, studyState: 5 },
    conditions: { teacherId: 2 },
  },

  // 周立俊（精英）事件
  {
    id: 'teacher3_1',
    title: '⚡ 精英压力',
    description: '周立俊在班会上说"低于650分就是失败"，你看着自己的分数，感到前所未有的压力。',
    category: 'teacher',
    difficulty: 'severe',
    isPositive: false,
    effects: { stress: 30, happy: -15 },
    conditions: { teacherId: 3 },
  },
  {
    id: 'teacher3_2',
    title: '🎯 压轴特训',
    description: '周立俊单独给你加餐，讲了一道竞赛难度的导数题，虽然累但收获巨大。',
    category: 'teacher',
    difficulty: 'moderate',
    isPositive: true,
    effects: { academicBase: 6, studyState: 12, stress: 10, health: -5 },
    conditions: { teacherId: 3 },
  },
  {
    id: 'teacher3_3',
    title: '🏆 精英认可',
    description: '你的解题思路得到了周立俊的表扬，这在清北班可是至高无上的荣誉！',
    category: 'teacher',
    difficulty: 'moderate',
    isPositive: true,
    effects: { happy: 25, studyState: 10, stress: -5 },
    conditions: { teacherId: 3 },
  },

  // ========== 意外事件 ==========
  {
    id: 'accident_1',
    title: '🎁 意外之喜',
    description: '在旧书堆里发现了一本绝版的真题集，这简直是上天送给你的礼物！',
    category: 'accident',
    difficulty: 'minor',
    isPositive: true,
    effects: { academicBase: 3, happy: 15 },
  },
  {
    id: 'accident_2',
    title: '💸 破财消灾',
    description: '饭卡丢了，补办花了20块钱，虽然不多但心情很糟。',
    category: 'accident',
    difficulty: 'minor',
    isPositive: false,
    effects: { happy: -10, stress: 5 },
  },
  {
    id: 'accident_3',
    title: '🔥 宿舍查寝',
    description: '宿管突击检查，你的台灯被没收了，晚上只能摸黑洗漱。',
    category: 'accident',
    difficulty: 'minor',
    isPositive: false,
    effects: { stress: 10, happy: -8 },
  },
  {
    id: 'accident_4',
    title: '🌟 逆袭时刻',
    description: '上次还不及格的你，这次居然考了班级前十，连老师都惊讶地多看了你几眼。',
    category: 'accident',
    difficulty: 'severe',
    isPositive: true,
    effects: { happy: 30, stress: -15, studyState: 15, academicBase: 5 },
  },
  {
    id: 'accident_5',
    title: '😱 滑铁卢',
    description: '上次还名列前茅的你，这次居然跌出了前三十，班主任找你谈话时你恨不得找个地缝钻进去。',
    category: 'accident',
    difficulty: 'severe',
    isPositive: false,
    effects: { stress: 35, happy: -25, studyState: -10 },
  },
];

// 根据当前状态筛选合适的事件
export function filterEventsByState(
  events: GameEvent[],
  teacherId: number,
  week: number,
  stress: number
): GameEvent[] {
  return events.filter((event) => {
    // 检查班主任条件
    if (event.conditions?.teacherId && event.conditions.teacherId !== teacherId) {
      return false;
    }
    // 检查周数条件
    if (event.conditions?.minWeek && week < event.conditions.minWeek) {
      return false;
    }
    if (event.conditions?.maxWeek && week > event.conditions.maxWeek) {
      return false;
    }
    // 检查压力条件
    if (event.conditions?.minStress && stress < event.conditions.minStress) {
      return false;
    }
    if (event.conditions?.maxStress && stress > event.conditions.maxStress) {
      return false;
    }
    return true;
  });
}

// 随机选择事件，考虑好事坏事平衡
export function selectRandomEvent(
  events: GameEvent[],
  preferredPositive: boolean = Math.random() > 0.4
): GameEvent | null {
  if (events.length === 0) return null;
  
  // 分离好事和坏事
  const positiveEvents = events.filter((e) => e.isPositive);
  const negativeEvents = events.filter((e) => !e.isPositive);
  
  // 根据偏好选择
  const pool = preferredPositive ? positiveEvents : negativeEvents;
  const fallbackPool = preferredPositive ? negativeEvents : positiveEvents;
  
  const selectedPool = pool.length > 0 ? pool : fallbackPool;
  if (selectedPool.length === 0) return null;
  
  return selectedPool[Math.floor(Math.random() * selectedPool.length)];
}
