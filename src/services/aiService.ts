// AI 事件生成服务 - 讯飞星火国内 API
import type { AIGeneratedEvent, GameState, TeacherConfig, SubjectScores } from '@/types/game';
import { SUBJECT_CONFIG } from '@/types/game';
import { LOCAL_EVENTS, filterEventsByState, selectRandomEvent } from '@/data/events';

// 讯飞星火国内 API 配置
const API_URL = 'https://maas-api.cn-huabei-1.xf-yun.com/v2/llm/chat-completions';
const API_KEY = '8b0c9907a0738983dbfd8a8c76ca6c33:MzkzNDZkNDRmZGM5ZDAxMjczNDM3ODJl';

// API 超时时间（毫秒）
const API_TIMEOUT = 5000;

// 弱势科目阈值
const WEAK_THRESHOLD = 45;

function buildAIPrompt(state: GameState, teacher: TeacherConfig): string {
  const score = Math.floor(Object.values(state.subjects).reduce((a, b) => a + b, 0));
  const subjectEntries = Object.entries(state.subjects) as [keyof SubjectScores, number][];
  const weakestSubject = subjectEntries.reduce((a, b) => a[1] < b[1] ? a : b);
  const weakSubjects = subjectEntries.filter(([_, score]) => score < WEAK_THRESHOLD);
  
  const subjectStatus = subjectEntries.map(([key, score]) => {
    const config = SUBJECT_CONFIG[key];
    const status = score < WEAK_THRESHOLD ? '【危险】' : score < 60 ? '【薄弱】' : score < 75 ? '【中等】' : score < 90 ? '【精通】' : '【大师】';
    return `- ${config.name}: ${Math.floor(score)}分 ${status}`;
  }).join('\n');

  const teacherStrongSubjects = teacher.strongSubjects 
    ? teacher.strongSubjects.map(s => SUBJECT_CONFIG[s].name).join('、')
    : '全科';

  return `你是一位精通《封丘一中：高三生存法则》的叙事设计师。请根据以下游戏状态，生成一个符合封丘本土化特色的校园随机事件。

## 当前游戏状态
- 周数：第 ${state.week} 周 / 共40周
- 班主任：${teacher.name}
- 当前预估分数：${score} 分
- 学习手感：${state.studyState}/100
- 心理压力：${state.stress}/100
- 身体机能：${state.health}/100
- 幸福度：${state.happy}/100

## 六科掌握程度
${subjectStatus}

## 弱势科目情况
${weakSubjects.length > 0 
  ? `有${weakSubjects.length}门科目危险：${weakSubjects.map(([k, _]) => SUBJECT_CONFIG[k].name).join('、')}`
  : '所有科目正常'}
- 最弱势科目：${SUBJECT_CONFIG[weakestSubject[0]].name}（${Math.floor(weakestSubject[1])}分）

## 班主任特色
${teacher.id === 1 ? '【王俊玲风格】严厉铁面，注重纪律和卷面。擅长：' + teacherStrongSubjects : ''}
${teacher.id === 2 ? '【许卫峰风格】温和开明，注重心态调节。擅长：' + teacherStrongSubjects : ''}
${teacher.id === 3 ? '【周立俊风格】精英主义，高压追求满分。擅长：' + teacherStrongSubjects : ''}

## 封丘本土化元素
地点：南街、二化、一中南门、操场、教学楼、食堂、宿舍
活动：5:30跑操、衡水体练字、物理周报、周考、纠错本
细节：早操口号、后窗班主任、食堂抢饭、课间十分钟睡眠

## 输出格式（严格JSON）
{
  "title": "事件标题（带emoji）",
  "description": "事件描述（100-150字）",
  "category": "learning/life/social/accident/teacher/subject",
  "relatedSubject": "关联科目（可选）",
  "effects": {
    "studyState": 整数,
    "academicBase": 数字,
    "stress": 整数,
    "happy": 整数,
    "health": 整数,
    "subjects": { "科目名": 变化值 }
  },
  "reason": "变化原因"
}`;
}

function parseAIResponse(content: string): AIGeneratedEvent | null {
  try {
    let jsonStr = content;
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1];
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    
    const data = JSON.parse(jsonStr);
    if (!data.title || !data.description || !data.effects) return null;
    
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
    console.error('解析AI响应失败:', error);
    return null;
  }
}

function getLocalEvent(state: GameState, teacher: TeacherConfig): AIGeneratedEvent {
  const filteredEvents = filterEventsByState(LOCAL_EVENTS, state.t_id, state.week, state.stress, state.subjects);
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
  
  const subjectEntries = Object.entries(state.subjects) as [keyof SubjectScores, number][];
  const weakestSubject = subjectEntries.reduce((a, b) => a[1] < b[1] ? a : b);
  
  return {
    title: '🌅 平凡的一天',
    description: '封丘的夕阳洒在操场上，你站在走廊上发呆，感受着高三生活中难得的平静时刻。',
    category: 'life',
    effects: { studyState: 3, academicBase: 0.2, stress: -5, happy: 5, health: 0 },
    reason: '平静的时刻让你的心态得到了放松',
  };
}

export async function generateEvent(state: GameState, teacher: TeacherConfig): Promise<AIGeneratedEvent> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'x1',
        messages: [
          { role: 'system', content: buildAIPrompt(state, teacher) },
          { role: 'user', content: `第${state.week}周。老师：${teacher.name}。压力：${state.stress}。请生成事件。` }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API请求失败:', response.status, errorText);
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.data?.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('API响应格式错误:', data);
      throw new Error('API响应格式错误');
    }

    const event = parseAIResponse(content);
    if (event) {
      console.log('AI事件生成成功:', event.title);
      return event;
    }
    
    throw new Error('解析AI响应失败');
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('AI请求超时，使用本地事件库');
    } else {
      console.warn('AI生成失败:', error);
    }
    return getLocalEvent(state, teacher);
  }
}