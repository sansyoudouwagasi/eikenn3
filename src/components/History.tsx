import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

interface HistoryItem {
  id: string;
  date: string;
  difficulty: 'easy' | 'normal' | 'hard';
  score: number;
  details: {
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    fluency: number;
    appropriateness: number;
  };
}

interface HistoryProps {
  onBack: () => void;
}

export const History: React.FC<HistoryProps> = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [weakest, setWeakest] = useState<string>('なし');
  const [strongest, setStrongest] = useState<string>('なし');
  const [avgScore, setAvgScore] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem('eiken3_history');
    if (stored) {
      try {
        const parsed: HistoryItem[] = JSON.parse(stored);
        // Sort history by date descending
        const sorted = parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(sorted);

        if (sorted.length > 0) {
          // Calculate average overall score
          const sum = sorted.reduce((acc, item) => acc + item.score, 0);
          setAvgScore(Math.round((sum / sorted.length) * 10) / 10);

          // Calculate average for each criteria
          const criteriaSums = { grammar: 0, vocabulary: 0, pronunciation: 0, fluency: 0, appropriateness: 0 };
          sorted.forEach(item => {
            criteriaSums.grammar += item.details.grammar || 0;
            criteriaSums.vocabulary += item.details.vocabulary || 0;
            criteriaSums.pronunciation += item.details.pronunciation || 0;
            criteriaSums.fluency += item.details.fluency || 0;
            criteriaSums.appropriateness += item.details.appropriateness || 0;
          });

          const len = sorted.length;
          const avgs = [
            { name: '文法 (Grammar)', key: 'grammar', score: criteriaSums.grammar / len },
            { name: '語彙 (Vocabulary)', key: 'vocabulary', score: criteriaSums.vocabulary / len },
            { name: '発音 (Pronunciation)', key: 'pronunciation', score: criteriaSums.pronunciation / len },
            { name: '流暢さ (Fluency)', key: 'fluency', score: criteriaSums.fluency / len },
            { name: '内容の適切さ (Appropriateness)', key: 'appropriateness', score: criteriaSums.appropriateness / len }
          ];

          // Sort to find strongest and weakest
          const sortedAvgs = [...avgs].sort((a, b) => a.score - b.score);
          setWeakest(`${sortedAvgs[0].name} (${Math.round(sortedAvgs[0].score * 10) / 10}点)`);
          setStrongest(`${sortedAvgs[sortedAvgs.length - 1].name} (${Math.round(sortedAvgs[sortedAvgs.length - 1].score * 10) / 10}点)`);
        }
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('これまでの学習履歴をすべて削除しますか？')) {
      localStorage.removeItem('eiken3_history');
      setHistory([]);
      setWeakest('なし');
      setStrongest('なし');
      setAvgScore(0);
    }
  };

  // Helper to format Date
  const formatDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Generate SVG Line Graph coordinates for recent 7 runs
  const renderLineGraph = () => {
    if (history.length === 0) return null;

    // Get chronological order (limit to last 7 runs)
    const recentRuns = [...history].slice(0, 7).reverse();
    const svgWidth = 330;
    const svgHeight = 130;
    const padX = 25;
    const padY = 15;
    const chartW = svgWidth - padX * 2;
    const chartH = svgHeight - padY * 2;

    const points = recentRuns.map((item, idx) => {
      const x = padX + (idx * chartW) / Math.max(1, recentRuns.length - 1);
      // y-coordinate (25 is max score)
      const y = padY + chartH - (item.score / 25) * chartH;
      return { x, y, score: item.score };
    });

    // Generate Path string
    let pathD = '';
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return (
      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible' }}>
        {/* Horizontal Grid lines */}
        {[0, 5, 10, 15, 20, 25].map((gridVal) => {
          const y = padY + chartH - (gridVal / 25) * chartH;
          return (
            <g key={gridVal}>
              <line 
                x1={padX} 
                y1={y} 
                x2={svgWidth - padX} 
                y2={y} 
                stroke="#e2e8f0" 
                strokeWidth="1" 
                strokeDasharray="3,3" 
              />
              <text 
                x={padX - 8} 
                y={y + 3} 
                fontSize="8" 
                fill="#94a3b8" 
                textAnchor="end"
              >
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Line Path */}
        {points.length > 1 && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#line-grad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}

        {/* Gradient for the line */}
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Data Circles & Value Labels */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle 
              cx={pt.x} 
              cy={pt.y} 
              r="4.5" 
              fill="#ffffff" 
              stroke="#1d4ed8" 
              strokeWidth="2.5" 
            />
            <text 
              x={pt.x} 
              y={pt.y - 8} 
              fontSize="9" 
              fontWeight="800" 
              fill="#1e3a8a" 
              textAnchor="middle"
            >
              {pt.score}
            </text>
            {/* Date Tag under points (brief index or small string) */}
            <text
              x={pt.x}
              y={svgHeight - 2}
              fontSize="7.5"
              fill="#64748b"
              textAnchor="middle"
            >
              {`#${history.length - recentRuns.length + i + 1}`}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="app-content">
      {history.length === 0 ? (
        <div className="no-data" style={{ margin: 'auto' }}>
          <AlertCircle size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
          <p>学習履歴がまだありません。</p>
          <p style={{ fontSize: '0.75rem', marginTop: '6px', color: '#94a3b8' }}>模擬面接モードを完了すると記録がここに保存されます。</p>
        </div>
      ) : (
        <>
          {/* Progress Chart */}
          <div className="graph-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <TrendingUp size={18} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>最近のスコア推移（最新7回）</span>
            </div>
            <div style={{ padding: '0 5px 10px 5px' }}>
              {renderLineGraph()}
            </div>
          </div>

          {/* Strong/Weak Analysis */}
          <h2 className="menu-section-title">スキル分析</h2>
          <div className="settings-group" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>平均スコア:</span>
              <span style={{ fontSize: '1rem', color: '#1e3a8a', fontWeight: 800 }}>{avgScore}点 / 25</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              <Sparkles size={14} style={{ color: '#10b981' }} />
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                <strong>得意分野:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>{strongest}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} style={{ color: '#f59e0b' }} />
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                <strong>要改善分野:</strong> <span style={{ color: '#d97706', fontWeight: 600 }}>{weakest}</span>
              </div>
            </div>
          </div>

          {/* History List */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 className="menu-section-title" style={{ margin: 0 }}>過去の練習履歴 ({history.length}回)</h2>
            <button 
              onClick={handleClearHistory} 
              className="icon-btn" 
              style={{ color: '#ef4444', padding: '6px' }}
              title="履歴を削除"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="history-list">
            {history.map((item) => (
              <div className="history-card" key={item.id}>
                <div>
                  <div className="history-date">{formatDateString(item.date)}</div>
                  <div className="history-title">模擬面接 練習</div>
                  <div className="history-level">
                    {item.difficulty === 'easy' ? 'Easy' : item.difficulty === 'normal' ? 'Normal' : 'Hard'}
                  </div>
                </div>
                <div>
                  <div className="history-score">{item.score} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>/ 25</span></div>
                  <div className="history-score-label">
                    {item.score >= 15 ? (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>合格ライン</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>要練習</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
