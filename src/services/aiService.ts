// AI 事件生成服务
import type { AIGeneratedEvent, GameState, TeacherConfig } from '@/types/game';
import { LOCAL_EVENTS, filterEventsByState, selectRandomEvent } from '@/data/events';

const API_URL = 'https://fqyz.wzy20060712.workers.dev';

// 优化的 AI Prompt 模板
function buildAIPrompt(state: GameState, teacher: TeacherConfig): string {
  const score = Math.floor(
    state.academicBase * 
    ((state.studyState / 100) * 0.4 + (state.happy / 100) * 0.1 - (state.stress / 100) * 0.25 + 0.7)
  );

  return `你是一位精通《封丘一中：高三生存法则》的叙事设计师。请根据以下游戏状态，生成一个符合封丘本土化特色的校园随机事件。

## 当前游戏状态
- 周数：第 ${state.week} 周 / 共40周
- 班主任：${teacher.name} - ${teacher.style}
- 当前预估分数：${score} 分
- 学习手感：${state.studyState}/100
- 心理压力：${state.stress}/100
- 身体机能：${state.health}/100
- 幸福度：${state.happy}/100

## 班主任特色（重要！）
${teacher.id === 1 ? '【王俊玲风格】严厉铁面，注重纪律和卷面，常在后窗巡视，批评直接但教学有效。事件应体现：高压、纪律、突然检查、严厉批评、偶尔的认可、生活中的关心。' : ''}
${teacher.id === 2 ? '【许卫峰风格】温和开明，注重心态调节，会放音乐、关心学生生活。事件应体现：人文关怀、心理疏导、轻松氛围、温暖鼓励，偶尔播放电影。' : ''}
${teacher.id === 3 ? '【周立俊风格】精英主义，高压追求满分，课间都在讲压轴题。事件应体现：极致要求、竞赛难度、精英竞争、对低分的鄙视。' : ''}

## 封丘本土化元素（必须融入）
地点：振兴路、一中南门、操场、教学楼、食堂、宿舍、群英楼
活动：5:30跑操、衡水体练字、物理周报、周考、纠错本、理综卷、五三、月考、第10周1模考试、第20周2模考试、第30周3模考试
细节：早操口号、后窗班主任、食堂抢饭、课间十分钟睡眠、晚上抢水龙头、给家长打电话

## 事件设计规则
1. 事件必须贴合高三学生的真实生活，有代入感
2. 根据当前压力值调整事件倾向：
   - 压力>80时：更容易触发崩溃、失误类事件
   - 压力<30时：更容易触发轻松、幸运类事件
3. 事件效果必须合理，符合逻辑：
   - 学习类事件：主要影响 studyState 和 academicBase
   - 生活类事件：主要影响 health 和 happy
   - 社交类事件：主要影响 happy 和 stress
   - 班主任事件：体现班主任特色
4. 数值变化范围：
   - 轻微事件：±4-8
   - 中等事件：±8-16
   - 严重事件：±12-24

## 输出格式（严格JSON，不要markdown代码块）
{
  "title": "事件标题（带emoji）",
  "description": "事件描述（100-150字，要有画面感和情感共鸣）",
  "category": "事件类别：learning/life/social/accident/teacher",
  "effects": {
    "studyState": 整数（学习手感变化，-20到+20）,
    "academicBase": 数字（学力基础变化，-3到+5，可为小数）,
    "stress": 整数（压力变化，-25到+35）,
    "happy": 整数（幸福度变化，-25到+30）,
    "health": 整数（健康变化，-15到+15，可选，默认0）
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
    
    return {
      title: data.title,
      description: data.description,
      category: data.category || 'accident',
      effects: {
        studyState: data.effects.studyState || 0,
        academicBase: data.effects.academicBase || 0,
        stress: data.effects.stress || 0,
        happy: data.effects.happy || 0,
        health: data.effects.health || 0,
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
          { role: 'user', content: '请生成一个符合当前状态的校园事件。' },
        ],
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
      state.stress
    );
    
    // 根据压力值决定好事坏事倾向
    const preferPositive = state.stress > 70 ? false : state.stress < 40 ? true : Math.random() > 0.4;
    const localEvent = selectRandomEvent(filteredEvents, preferPositive);
    
    if (localEvent) {
      return {
        title: localEvent.title,
        description: localEvent.description,
        category: localEvent.category,
        effects: {
          studyState: localEvent.effects.studyState || 0,
          academicBase: localEvent.effects.academicBase || 0,
          stress: localEvent.effects.stress || 0,
          happy: localEvent.effects.happy || 0,
          health: localEvent.effects.health || 0,
        },
        reason: '这是一个本地预设事件',
      };
    }
    
    // 最后的兜底
    return {
      title: '🌅 平凡的一天',
      description: '封丘的夕阳洒在操场上，你站在走廊上发呆，感受着高三生活中难得的平静时刻。',
      category: 'life',
      effects: { studyState: 3, academicBase: 0.2, stress: -5, happy: 5, health: 0 },
      reason: '平静的时刻让你的心态得到了放松',
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
