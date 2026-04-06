// AI 事件生成服务
import type { AIGeneratedEvent, GameState, TeacherConfig, SubjectScores } from '@/types/game';
import { SUBJECT_CONFIG } from '@/types/game';
import { LOCAL_EVENTS, filterEventsByState, selectRandomEvent } from '@/data/events';

const API_URL = 'https://fqyz.wzy20060712.workers.dev';

// 弱势科目阈值
const WEAK_THRESHOLD = 45;

// 优化的 AI Prompt 模板
function buildAIPrompt(state: GameState, teacher: TeacherConfig): string {
  const score = Math.floor(
    state.academicBase * 
    ((state.studyState / 100) * 0.4 + (state.happy / 100) * 0.1 - (state.stress / 100) * 0.25 + 0.7)
  );

  // 找出最弱势的科目
  const subjectEntries = Object.entries(state.subjects) as [keyof SubjectScores, number][];
  const weakestSubject = subjectEntries.reduce((a, b) => a[1] < b[1] ? a : b);
  const weakSubjects = subjectEntries.filter(([_, score]) => score < WEAK_THRESHOLD);

  // 生成科目状态描述
  const subjectStatus = subjectEntries.map(([key, score]) => {
    const config = SUBJECT_CONFIG[key];
    const status = score < WEAK_THRESHOLD ? '【危险】' : score < 60 ? '【薄弱】' : score < 75 ? '【中等】' : score < 90 ? '【良好】' : '【精通】';
    return `- ${config.name}: ${Math.floor(score)}分 ${status}`;
  }).join('\n');

  // 班主任擅长科目
  const teacherStrongSubjects = teacher.strongSubjects 
    ? teacher.strongSubjects.map(s => SUBJECT_CONFIG[s].name).join('、')
    : '全科';

  return `你是一位精通《封丘一中：高三生存法则》的叙事设计师。请根据以下游戏状态，生成一个符合封丘本土化特色的校园随机事件。

## 当前游戏状态
- 周数：第 ${state.week} 周 / 共40周
- 班主任：${teacher.name} - ${teacher.style}
- 当前预估分数：${score} 分
- 学习手感：${state.studyState}/100
- 心理压力：${state.stress}/100
- 身体机能：${state.health}/100
- 幸福度：${state.happy}/100

## 六科掌握程度（重要！）
${subjectStatus}

## 弱势科目情况
${weakSubjects.length > 0 
  ? `有${weakSubjects.length}门科目低于45分（危险）：${weakSubjects.map(([k, _]) => SUBJECT_CONFIG[k].name).join('、')}`
  : '所有科目都在45分以上，暂时没有危险科目'}
- 最弱势科目：${SUBJECT_CONFIG[weakestSubject[0]].name}（${Math.floor(weakestSubject[1])}分）

## 班主任特色（重要！）
${teacher.id === 1 ? '【王俊玲风格】严厉铁面，注重纪律和卷面，常在后窗巡视，批评直接但教学有效。擅长科目：' + teacherStrongSubjects + '。事件应体现：高压、纪律、突然检查、严厉批评、偶尔的认可。' : ''}
${teacher.id === 2 ? '【许卫峰风格】温和开明，注重心态调节，会放音乐、关心学生生活。擅长科目：' + teacherStrongSubjects + '。事件应体现：人文关怀、心理疏导、轻松氛围、温暖鼓励。' : ''}
${teacher.id === 3 ? '【周立俊风格】精英主义，高压追求满分，课间都在讲压轴题。擅长科目：' + teacherStrongSubjects + '。事件应体现：极致要求、竞赛难度、精英竞争、对低分的鄙视。' : ''}

## 封丘本土化元素（必须融入）
地点：南街、二化、一中南门、操场、教学楼、食堂、宿舍
活动：5:30跑操、衡水体练字、物理周报、周考、纠错本、理综卷
细节：早操口号、后窗班主任、食堂抢饭、课间十分钟睡眠

## 事件设计规则
1. 事件必须贴合高三学生的真实生活，有代入感
2. 根据当前压力值调整事件倾向：
   - 压力>80时：更容易触发崩溃、失误类事件
   - 压力<30时：更容易触发轻松、幸运类事件
3. 【重要】根据科目掌握程度设计事件：
   - 弱势科目（<45分）：触发相关科目的挫折事件（考试失利、听不懂课、被点名批评等）
   - 强势科目（>75分）：触发相关科目的成功事件（被表扬、解题突破、帮助同学等）
   - 班主任擅长科目：更容易触发该科目的教学事件
4. 事件效果必须合理，符合逻辑：
   - 学习类事件：主要影响 studyState 和 academicBase，以及特定科目
   - 生活类事件：主要影响 health 和 happy
   - 社交类事件：主要影响 happy 和 stress
   - 科目相关事件：必须影响特定科目的掌握程度（±5-15分）
5. 数值变化范围：
   - 轻微事件：±5-10
   - 中等事件：±10-20
   - 严重事件：±20-35
   - 科目变化：±5-15（单独列出）

## 输出格式（严格JSON，不要markdown代码块）
{
  "title": "事件标题（带emoji）",
  "description": "事件描述（100-150字，要有画面感和情感共鸣）",
  "category": "事件类别：learning/life/social/accident/teacher/subject",
  "relatedSubject": "关联科目（可选）：chinese/math/english/physics/chemistry/biology，不相关则留空",
  "effects": {
    "studyState": 整数（学习手感变化，-20到+20）,
    "academicBase": 数字（学力基础变化，-3到+5，可为小数）,
    "stress": 整数（压力变化，-25到+35）,
    "happy": 整数（幸福度变化，-25到+30）,
    "health": 整数（健康变化，-15到+15，可选，默认0）,
    "subjects": {
      "科目名": 变化值（如 "math": 10 表示数学+10分，可选）
    }
  },
  "reason": "数值变化的原因解释（一句话说明为什么这些数值会变化）"
}`;
}

// 解析 AI 响应
function parseAIResponse(content: string): AIGeneratedEvent | null {
  try {
    // 尝试直接解析
    let jsonStr = content;
    
    // 如果包含代码块，提取其中的JSON
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }
    
    // 尝试找到JSON对象
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const data = JSON.parse(jsonStr);
    
    // 验证必要字段
    if (!data.title || !data.description || !data.effects) {
      console.error('AI响应缺少必要字段:', data);
      return null;
    }
    
    // 解析科目变化
    const subjects: Partial<SubjectScores> = {};
    if (data.effects.subjects) {
      (Object.keys(data.effects.subjects) as (keyof SubjectScores)[]).forEach((key) => {
        subjects[key] = data.effects.subjects[key];
      });
    }
    
    return {
      title: data.title,
      description: data.description,
      category: data.category || 'accident',
      relatedSubject: data.relatedSubject || undefined,
      effects: {
        studyState: data.effects.studyState || 0,
        academicBase: data.effects.academicBase || 0,
        stress: data.effects.stress || 0,
        happy: data.effects.happy || 0,
        health: data.effects.health || 0,
        subjects: Object.keys(subjects).length > 0 ? subjects : undefined,
      },
      reason: data.reason || '事件影响了你的状态',
    };
  } catch (error) {
    console.error('解析AI响应失败:', error, content);
    return null;
  }
}

// 主函数：生成事件
export async function generateEvent(
  state: GameState,
  teacher: TeacherConfig
): Promise<AIGeneratedEvent> {
  try {
    // 调用 AI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'lite',
        messages: [
          { role: 'system', content: buildAIPrompt(state, teacher) },
          { role: 'user', content: `第${state.week}周。老师：${teacher.name}。压力：${state.stress}。请生成事件。` }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('API响应格式错误');
    }

    const event = parseAIResponse(content);
    if (event) {
      return event;
    }
    
    throw new Error('解析AI响应失败');
  } catch (error) {
    console.warn('AI生成失败，使用本地事件库:', error);
    
    // 使用本地事件库作为兜底
    const filteredEvents = filterEventsByState(
      LOCAL_EVENTS,
      state.t_id,
      state.week,
      state.stress,
      state.subjects
    );
    
    // 根据压力值决定好事坏事倾向
    const preferPositive = state.stress > 70 ? false : state.stress < 40 ? true : Math.random() > 0.4;
    const localEvent = selectRandomEvent(filteredEvents, preferPositive);
    
    if (localEvent) {
      return {
        title: localEvent.title,
        description: localEvent.description,
        category: localEvent.category,
        relatedSubject: localEvent.relatedSubject,
        effects: {
          studyState: localEvent.effects.studyState || 0,
          academicBase: localEvent.effects.academicBase || 0,
          stress: localEvent.effects.stress || 0,
          happy: localEvent.effects.happy || 0,
          health: localEvent.effects.health || 0,
          subjects: localEvent.effects.subjects,
        },
        reason: '这是一个本地预设事件',
      };
    }
    
    // 最后的兜底：根据弱势科目生成一个简单事件
    const subjectEntries = Object.entries(state.subjects) as [keyof SubjectScores, number][];
    const weakestSubject = subjectEntries.reduce((a, b) => a[1] < b[1] ? a : b);
    const subjectName = SUBJECT_CONFIG[weakestSubject[0]].name;
    
    return {
      title: '📚 平凡的学习日',
      description: `封丘的夕阳洒在操场上，你在教室里做着${subjectName}练习题，感受着高三生活中平凡但充实的一刻。`,
      category: 'subject',
      relatedSubject: weakestSubject[0],
      effects: { 
        studyState: 3, 
        academicBase: 0.2, 
        stress: -3, 
        happy: 3,
        subjects: { [weakestSubject[0]]: 2 } as Partial<SubjectScores>
      },
      reason: '专注于弱势科目的学习让你的心态得到了放松',
    };
  }
}

// 批量预生成事件（用于缓存）
export async function prefetchEvents(
  state: GameState,
  teacher: TeacherConfig,
  count: number = 3
): Promise<AIGeneratedEvent[]> {
  const events: AIGeneratedEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const event = await generateEvent(state, teacher);
      events.push(event);
    } catch (error) {
      console.warn('预生成事件失败:', error);
    }
  }
  
  return events;
}
