import { useState, useCallback } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { generateEvent } from '@/services/aiService';
import type { AIGeneratedEvent, LogEntry, SubjectScores } from '@/types/game';
import { SUBJECT_CONFIG, SUBJECT_MAX_SCORES } from '@/types/game';
import { StartScreen } from '@/components/StartScreen';
import { StatusPanel } from '@/components/StatusPanel';
import { ActionPanel } from '@/components/ActionPanel';
import { LogWindow } from '@/components/LogWindow';
import { EventDialog } from '@/components/EventDialog';
import { ExamDialog } from '@/components/ExamDialog';
import { GameOverDialog } from '@/components/GameOverDialog';
import { toast } from 'sonner';
import './App.css';

function App() {
  const {
    state,
    isInitialized,
    calculateScore,
    getRank,
    getTeacher,
    getSubjectAverage,
    initGame,
    executeAction,
    applyEventEffects,
    nextWeek,
    checkGameOver,
    resetGame,
    getExamFeedback,
  } = useGameState();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentEvent, setCurrentEvent] = useState<AIGeneratedEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [examResult, setExamResult] = useState<{ score: number; change: number } | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 添加日志
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'normal') => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random(),
      week: state.week,
      message,
      type,
      timestamp: Date.now(),
    };
    setLogs((prev) => [newLog, ...prev]);
  }, [state.week]);

  // 初始化游戏
  const handleInit = useCallback((teacherId: number) => {
    initGame(teacherId);
    addLog('站在一中南门，你感受到一股肃穆的气息。六科之战，正式打响。', 'system');
  }, [initGame, addLog]);

  // 处理行动
  const handleAction = useCallback(async (actionId: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const result = executeAction(actionId);
    
    if (result.success) {
      addLog(result.message, 'action');
      
      // 检查游戏结束
      const gameOver = checkGameOver();
      if (gameOver.isOver) {
        setGameOverReason(gameOver.reason);
        setShowGameOver(true);
        setIsProcessing(false);
        return;
      }

      // 随机触发事件 (48%概率)
      if (Math.random() < 0.48 && state.ap > result.apCost) {
        addLog('<i>⏳ 班主任在走廊里停下了脚步...</i>', 'normal');
        
        const teacher = getTeacher();
        if (teacher) {
          try {
            const event = await generateEvent(state, teacher);
            setCurrentEvent(event);
            setShowEventDialog(true);
          } catch (error) {
            console.error('生成事件失败:', error);
            toast.error('事件生成失败，请重试');
          }
        }
      } else if (state.ap <= result.apCost) {
        // 精力耗尽，进入下周
        const result = nextWeek();
        if (result) {
          setExamResult(result);
          setShowExamDialog(true);
        }
      }
    }
    
    setIsProcessing(false);
  }, [isProcessing, executeAction, addLog, checkGameOver, state.ap, state, getTeacher, nextWeek]);

  // 关闭事件弹窗
  const handleCloseEvent = useCallback(() => {
    if (currentEvent) {
      applyEventEffects(currentEvent.effects);
      
      // 构建日志消息
      let logMessage = `<b>${currentEvent.title}</b>：${currentEvent.description}`;
      
      // 如果有科目变化，显示在日志中
      if (currentEvent.effects.subjects) {
        const subjectChanges = Object.entries(currentEvent.effects.subjects)
          .map(([key, value]) => {
            const subjectName = SUBJECT_CONFIG[key as keyof SubjectScores].name;
            const sign = value! > 0 ? '+' : '';
            return `${subjectName}${sign}${value}`;
          })
          .join('、');
        if (subjectChanges) {
          logMessage += ` <span class="text-blue-600">[${subjectChanges}]</span>`;
        }
      }
      
      addLog(logMessage, 'event');
    }
    setShowEventDialog(false);
    setCurrentEvent(null);

    // 检查游戏结束
    const gameOver = checkGameOver();
    if (gameOver.isOver) {
      setGameOverReason(gameOver.reason);
      setShowGameOver(true);
      return;
    }

    // 检查是否进入下周
    if (state.ap <= 0) {
      const result = nextWeek();
      if (result) {
        setExamResult(result);
        setShowExamDialog(true);
      }
    }
  }, [currentEvent, applyEventEffects, addLog, checkGameOver, state.ap, nextWeek]);

  // 关闭考试弹窗
  const handleCloseExam = useCallback(() => {
    setShowExamDialog(false);
    
    // 显示科目变化总结
    const subjectAvg = getSubjectAverage();
    const weakSubjects = Object.entries(state.subjects)
      .filter(([key, score]) => {
        const maxScore = SUBJECT_MAX_SCORES[key as keyof SubjectScores];
        return (score / maxScore) * 100 < 40; // 掌握度 < 40%
      })
      .map(([key, _]) => SUBJECT_CONFIG[key as keyof SubjectScores].name);
    
    let summary = `<div class="text-blue-600 font-bold mt-2">--- 第 ${state.week + 1} 周：战斗再续 ---</div>`;
    summary += `<div class="text-xs text-slate-500 mt-1">六科平均分：${Math.floor(subjectAvg)}分</div>`;
    
    if (weakSubjects.length > 0) {
      summary += `<div class="text-xs text-red-500 mt-1">⚠️ 弱势科目：${weakSubjects.join('、')}</div>`;
    }
    
    addLog(summary, 'exam');
    
    // 检查游戏结束
    const gameOver = checkGameOver();
    if (gameOver.isOver) {
      setGameOverReason(gameOver.reason);
      setShowGameOver(true);
    }
  }, [addLog, state.week, state.subjects, getSubjectAverage]);

  // 处理游戏结束
  const handleGameOver = useCallback(() => {
    setShowGameOver(false);
    resetGame();
  }, [resetGame]);

  // 获取考试反馈
  const examFeedback = examResult ? getExamFeedback(examResult.change) : '';

  // 等待初始化
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  // 未选择班主任
  if (state.t_id === 0) {
    return <StartScreen onSelect={handleInit} />;
  }

  const score = calculateScore();
  const rank = getRank(score);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧状态面板 */}
          <div className="lg:col-span-4 xl:col-span-3">
            <StatusPanel
              score={score}
              rank={rank}
              studyState={state.studyState}
              stress={state.stress}
              health={state.health}
              happy={state.happy}
              subjects={state.subjects}
              teacher={state.teacher}
              onReset={resetGame}
            />
          </div>

          {/* 右侧操作区 */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* 操作按钮 */}
            <ActionPanel
              ap={state.ap}
              subjects={state.subjects}
              onAction={handleAction}
              disabled={isProcessing}
            />

            {/* 日志窗口 */}
            <LogWindow logs={logs} currentWeek={state.week} />
          </div>
        </div>
      </div>

      {/* 事件弹窗 */}
      <EventDialog
        isOpen={showEventDialog}
        onClose={handleCloseEvent}
        event={currentEvent}
      />

      {/* 考试弹窗 */}
      {examResult && (
        <ExamDialog
          isOpen={showExamDialog}
          onClose={handleCloseExam}
          score={examResult.score}
          change={examResult.change}
          feedback={examFeedback}
        />
      )}

      {/* 游戏结束弹窗 */}
      <GameOverDialog
        isOpen={showGameOver}
        onRestart={handleGameOver}
        reason={gameOverReason}
        finalScore={checkGameOver().finalScore}
        rank={rank?.label}
      />
    </div>
  );
}

export default App;
