import React, { useEffect, useState } from 'react';
import { Play, BookOpen, BarChart3, Settings, Award, Calendar } from 'lucide-react';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [practiceCount, setPracticeCount] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  useEffect(() => {
    // Load stats from localStorage
    const storedHistory = localStorage.getItem('eiken3_history');
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        setPracticeCount(history.length);
        
        const scores = history.map((item: any) => item.score || 0);
        if (scores.length > 0) {
          setHighScore(Math.max(...scores));
        }
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  return (
    <div className="app-content">
      {/* Hero Card */}
      <div className="dashboard-hero">
        <div className="hero-tag">EIKEN 3rd Grade</div>
        <h1 className="hero-title">AI二次試験対策</h1>
        <p className="hero-subtitle">本番そっくりの模擬面接と、AIによる発音・文法チェックで合格を目指そう！</p>
        
        <button 
          className="btn-primary" 
          onClick={() => onNavigate('interview')}
          style={{ background: '#ffffff', color: '#1e3a8a', boxShadow: '0 4px 12px rgba(255,255,255,0.15)' }}
        >
          <Play size={20} fill="currentColor" />
          模擬面接を開始する
        </button>
      </div>

      {/* Quick Stats */}
      <h2 className="menu-section-title">現在の学習状況</h2>
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-val">{practiceCount}回</div>
            <div className="stat-lbl">練習回数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">
            <Award size={20} />
          </div>
          <div>
            <div className="stat-val">{highScore}点<span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/25</span></div>
            <div className="stat-lbl">自己ベスト</div>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <h2 className="menu-section-title">メニュー</h2>
      <div className="menu-list">
        <div className="menu-item" onClick={() => onNavigate('questions')}>
          <div className="menu-item-left">
            <div className="menu-item-icon bg-indigo">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="menu-item-title">頻出質問集</div>
              <div className="menu-item-desc">自己紹介や学校生活の発音・発話練習</div>
            </div>
          </div>
          <Play size={14} fill="currentColor" style={{ transform: 'rotate(0deg)', color: '#cbd5e1' }} />
        </div>

        <div className="menu-item" onClick={() => onNavigate('history')}>
          <div className="menu-item-left">
            <div className="menu-item-icon bg-teal">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="menu-item-title">学習履歴・進捗</div>
              <div className="menu-item-desc">これまでのスコア推移と苦手分野の分析</div>
            </div>
          </div>
          <Play size={14} fill="currentColor" style={{ color: '#cbd5e1' }} />
        </div>

        <div className="menu-item" onClick={() => onNavigate('settings')}>
          <div className="menu-item-left">
            <div className="menu-item-icon bg-purple">
              <Settings size={22} />
            </div>
            <div>
              <div className="menu-item-title">アプリ設定</div>
              <div className="menu-item-desc">APIキーの登録・面接官の声・難易度設定</div>
            </div>
          </div>
          <Play size={14} fill="currentColor" style={{ color: '#cbd5e1' }} />
        </div>
      </div>
    </div>
  );
};
