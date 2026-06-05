import { useState } from 'react';
import './App.css';
import { Home as HomeView } from './components/Home';
import { Interview } from './components/Interview';
import { Result } from './components/Result';
import { History } from './components/History';
import { Questions } from './components/Questions';
import { Settings } from './components/Settings';
import { evaluateInterview, type UserResponse, type AssessmentResult } from './services/ai';
import { ChevronLeft, Award } from 'lucide-react';

type ScreenType = 'home' | 'interview' | 'result' | 'history' | 'questions' | 'settings';

function App() {
  const [screen, setScreen] = useState<ScreenType>('home');
  const [activeDifficulty, setActiveDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Navigate to different screen states
  const handleNavigate = (targetScreen: string) => {
    setScreen(targetScreen as ScreenType);
  };

  // When mock interview completes
  const handleInterviewComplete = async (responses: UserResponse[], difficulty: 'easy' | 'normal' | 'hard') => {
    setActiveDifficulty(difficulty);
    setScreen('result');
    setAssessmentResult(null); // Clear previous

    // Load API Settings from localStorage
    let apiSettings = undefined;
    const savedConfig = localStorage.getItem('eiken3_settings');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.apiKey && config.apiKey.trim() !== '') {
          apiSettings = {
            provider: config.apiProvider || 'gemini',
            apiKey: config.apiKey
          };
        }
      } catch (e) {
        console.error('Failed to parse settings for grading', e);
      }
    }

    // Evaluate responses (triggers AI or Local engine)
    const result = await evaluateInterview(difficulty, responses, apiSettings);
    setAssessmentResult(result);
  };

  // Restart Eiken mock test
  const handleRestart = () => {
    setScreen('interview');
    setAssessmentResult(null);
  };

  // Helper to render Screen component based on state
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} />;
      case 'interview':
        return (
          <Interview 
            onBack={() => setScreen('home')} 
            onComplete={handleInterviewComplete} 
          />
        );
      case 'result':
        if (!assessmentResult) {
          // Renders intermediate loading screen while evaluation finishes
          return (
            <div className="app-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="wave-bar" style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
              <h3 style={{ color: '#1e3a8a', fontWeight: 800, marginTop: '20px' }}>採点中...</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>AIが採点と評価レポートを作成しています。</p>
            </div>
          );
        }
        return (
          <Result 
            result={assessmentResult} 
            difficulty={activeDifficulty}
            onRestart={handleRestart}
            onGoHome={() => setScreen('home')}
          />
        );
      case 'history':
        return <History onBack={() => setScreen('home')} />;
      case 'questions':
        return <Questions onBack={() => setScreen('home')} />;
      case 'settings':
        return <Settings onBack={() => setScreen('home')} />;
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  // Custom header titles
  const getHeaderTitle = () => {
    switch (screen) {
      case 'settings': return 'アプリ設定';
      case 'questions': return '頻出質問集';
      case 'history': return '学習履歴・グラフ';
      case 'interview': return 'AI模擬面接';
      case 'result': return '面接結果レポート';
      default: return '英検3級 面接対策';
    }
  };

  return (
    <div className="device-frame">
      <div className="device-notch"></div>
      <div className="device-screen">
        
        {/* Render Header except during the active interview / result to maximize screen space */}
        {screen !== 'interview' && (
          <header className="app-header">
            {screen !== 'home' ? (
              <button className="icon-btn" onClick={() => setScreen('home')}>
                <ChevronLeft size={20} />
              </button>
            ) : (
              <div style={{ width: '36px' }}></div>
            )}
            
            <h1 className="app-header-title">
              {screen === 'home' && <Award size={18} style={{ color: '#3b82f6' }} fill="currentColor" />}
              {getHeaderTitle()}
            </h1>
            
            <div style={{ width: '36px' }}></div>
          </header>
        )}

        {/* Dynamic Inner Screen View */}
        {renderScreen()}

        <div className="device-home-indicator"></div>
      </div>
    </div>
  );
}

export default App;
