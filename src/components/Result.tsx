import React, { useEffect, useRef } from 'react';
import { RefreshCw, Home, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { AssessmentResult } from '../services/ai';

interface ResultProps {
  result: AssessmentResult;
  difficulty: 'easy' | 'normal' | 'hard';
  onRestart: () => void;
  onGoHome: () => void;
}

export const Result: React.FC<ResultProps> = ({ result, difficulty, onRestart, onGoHome }) => {
  const hasSaved = useRef<boolean>(false);

  useEffect(() => {
    // Prevent double saving due to React StrictMode double invocation
    if (hasSaved.current) return;
    hasSaved.current = true;

    // 1. Trigger Confetti celebration if passed (15 points out of 25 is Eiken 3 passing)
    if (result.score >= 15) {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        // confettis on random corners
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }

    // 2. Save result to localStorage history
    const stored = localStorage.getItem('eiken3_history');
    let history = [];
    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse existing history', e);
      }
    }

    const newItem = {
      id: 'res_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      date: new Date().toISOString(),
      difficulty,
      score: result.score,
      details: result.details
    };

    history.push(newItem);
    localStorage.setItem('eiken3_history', JSON.stringify(history));
  }, [result, difficulty]);

  // SVG Radar Chart Math Constants
  const cx = 90;
  const cy = 90;
  const r = 55;
  const labels = ['文法', '語彙', '発音', '流暢さ', '適切さ'];
  const keys = ['grammar', 'vocabulary', 'pronunciation', 'fluency', 'appropriateness'] as const;

  // Calculate coordinates for the radar polygons
  const getCoordinates = (scores: { grammar: number; vocabulary: number; pronunciation: number; fluency: number; appropriateness: number }) => {
    return keys.map((key, i) => {
      const val = scores[key];
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      // Map score 1-5 to radius 0-r
      const dist = (val / 5) * r;
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      return { x, y };
    });
  };

  const userPoints = getCoordinates(result.details);
  const userPath = userPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Get grid polygons for reference (rings at score 1, 2, 3, 4, 5)
  const getGridPolygon = (level: number) => {
    return keys.map((_, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const dist = (level / 5) * r;
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="app-content">
      {/* Result Card */}
      <div className="result-card">
        <span className="result-badge">
          難易度: {difficulty === 'easy' ? 'Easy' : difficulty === 'normal' ? 'Normal' : 'Hard'}
        </span>
        
        <div className="overall-score-circle">
          <div className="score-num">{result.score}</div>
          <div className="score-denom">/ 25</div>
        </div>

        <div className="pass-status" style={{ marginBottom: '8px' }}>
          {result.score >= 15 ? (
            <div className="pass-label">
              <Sparkles size={18} fill="currentColor" />
              合格ラインクリア！
            </div>
          ) : (
            <div className="pass-label fail">
              <AlertCircle size={18} />
              もう一息で合格！
            </div>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
          ※本番試験は全アティチュードを含めて6割（15点前後）が合格基準です。
        </p>
      </div>

      {/* Skills Radar Chart */}
      <h2 className="menu-section-title">評価レーダーチャート</h2>
      <div className="settings-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
        <div className="radar-chart-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <svg width="220" height="190" viewBox="0 0 180 190" style={{ overflow: 'visible' }}>
            {/* Grid Rings */}
            {[1, 2, 3, 4, 5].map((level) => (
              <polygon
                key={level}
                points={getGridPolygon(level)}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            {/* Grid Axis Lines */}
            {keys.map((_, i) => {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              );
            })}

            {/* User score polygon */}
            <polygon
              points={userPath}
              fill="rgba(59, 130, 246, 0.3)"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* User score data points */}
            {userPoints.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#1e3a8a"
              />
            ))}

            {/* Axis Labels */}
            {labels.map((lbl, i) => {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              // Push text a bit outwards from the chart edges
              const textR = r + 15;
              const x = cx + textR * Math.cos(angle);
              const y = cy + textR * Math.sin(angle);
              
              // Anchor adjust
              let textAnchor = 'middle';
              if (Math.cos(angle) > 0.1) textAnchor = 'start';
              if (Math.cos(angle) < -0.1) textAnchor = 'end';

              return (
                <text
                  key={i}
                  x={x}
                  y={y + 3}
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#475569"
                  textAnchor={textAnchor as any}
                >
                  {lbl} ({result.details[keys[i]]})
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Detailed Feedback Panel */}
      <h2 className="menu-section-title">評価分析・アドバイス</h2>
      
      <div className="feedback-box">
        <div className="feedback-title" style={{ color: '#10b981' }}>
          <Sparkles size={16} />
          良かった点 (Strengths)
        </div>
        <p className="feedback-text">{result.strengths}</p>
      </div>

      <div className="feedback-box">
        <div className="feedback-title" style={{ color: '#d97706' }}>
          <AlertCircle size={16} />
          改善点 (Areas for Improvement)
        </div>
        <p className="feedback-text">{result.improvements}</p>
      </div>

      <div className="feedback-box">
        <div className="feedback-title" style={{ color: '#3b82f6' }}>
          <BookOpen size={16} />
          推奨勉強法 (Recommended Study)
        </div>
        <p className="feedback-text">{result.recommendedStudy}</p>
      </div>

      {/* Q&A logs showing Model answers vs User answers */}
      <h2 className="menu-section-title">回答ログと模範解答</h2>
      <div className="settings-group" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {result.modelAnswers.map((qa, index) => (
            <div className="qa-log-item" key={qa.questionId}>
              <div className="qa-q">Q{index + 1}: {qa.questionText}</div>
              <div className="qa-u">
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>あなたの回答:</div>
                <div>{qa.userAnswer}</div>
              </div>
              <div className="qa-m">
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d' }}>模範解答例:</div>
                <div>{qa.modelAnswer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <button className="btn-primary" onClick={onRestart}>
          <RefreshCw size={18} />
          もう一度練習する
        </button>
        <button className="btn-secondary" onClick={onGoHome}>
          <Home size={18} />
          ホームに戻る
        </button>
      </div>
    </div>
  );
};
