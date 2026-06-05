import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [examMode, setExamMode] = useState<'practice' | 'real'>('practice');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [voiceRate, setVoiceRate] = useState<number>(0.85);
  
  const [apiProvider, setApiProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('eiken3_settings');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.difficulty) setDifficulty(config.difficulty);
        if (config.examMode) setExamMode(config.examMode);
        if (config.voiceGender) setVoiceGender(config.voiceGender);
        if (config.voiceRate) setVoiceRate(config.voiceRate);
        if (config.apiProvider) setApiProvider(config.apiProvider);
        if (config.apiKey) setApiKey(config.apiKey);
      } catch (e) {
        console.error('Failed to parse settings config', e);
      }
    }
  }, []);

  const handleSave = () => {
    const config = {
      difficulty,
      examMode,
      voiceGender,
      voiceRate,
      apiProvider,
      apiKey
    };

    localStorage.setItem('eiken3_settings', JSON.stringify(config));
    setSaveStatus('保存しました！');
    setTimeout(() => {
      setSaveStatus('');
      onBack();
    }, 1200);
  };

  return (
    <div className="app-content">
      {/* Simulation difficulty */}
      <h2 className="menu-section-title">面接設定</h2>
      <div className="settings-group">
        <label className="settings-label">難易度レベル</label>
        <select 
          className="select-control" 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value as any)}
          style={{ marginBottom: '16px' }}
        >
          <option value="easy">Easy (単語中心・やさしい)</option>
          <option value="normal">Normal (英検3級 標準レベル)</option>
          <option value="hard">Hard (合格上位レベル)</option>
        </select>

        <label className="settings-label">面接モード</label>
        <select 
          className="select-control" 
          value={examMode} 
          onChange={(e) => setExamMode(e.target.value as any)}
        >
          <option value="practice">練習モード (文字字幕・ヒントあり)</option>
          <option value="real">本番モード (字幕なし・制限時間あり)</option>
        </select>
      </div>

      {/* Voice TTS Settings */}
      <h2 className="menu-section-title">面接官の音声設定</h2>
      <div className="settings-group">
        <label className="settings-label">面接官の性別</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button 
            type="button"
            className={`btn-secondary ${voiceGender === 'female' ? 'active-btn' : ''}`}
            onClick={() => setVoiceGender('female')}
            style={{ 
              flex: 1, 
              borderColor: voiceGender === 'female' ? '#3b82f6' : '#cbd5e1',
              background: voiceGender === 'female' ? '#eff6ff' : '#ffffff',
              color: voiceGender === 'female' ? '#1d4ed8' : '#1e3a8a'
            }}
          >
            女性 (Ms. Smith)
          </button>
          <button 
            type="button"
            className={`btn-secondary ${voiceGender === 'male' ? 'active-btn' : ''}`}
            onClick={() => setVoiceGender('male')}
            style={{ 
              flex: 1, 
              borderColor: voiceGender === 'male' ? '#3b82f6' : '#cbd5e1',
              background: voiceGender === 'male' ? '#eff6ff' : '#ffffff',
              color: voiceGender === 'male' ? '#1d4ed8' : '#1e3a8a'
            }}
          >
            男性 (Mr. Smith)
          </button>
        </div>

        <label className="settings-label">発話スピード: {voiceRate.toFixed(2)}倍速</label>
        <input 
          type="range" 
          min="0.6" 
          max="1.2" 
          step="0.05"
          value={voiceRate} 
          onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#3b82f6' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
          <span>ゆっくり</span>
          <span>標準 (0.85)</span>
          <span>はやい</span>
        </div>
      </div>

      {/* AI API Settings */}
      <h2 className="menu-section-title">AI採点設定 (オプション)</h2>
      <div className="settings-group">
        <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', marginBottom: '12px' }}>
          APIキーを設定すると、本物のAIによる精密な文法チェックや、あなただけに向けた合格アドバイスを受けられます。入力したキーはブラウザにのみ保存されます。
        </p>

        <label className="settings-label">AIサービス</label>
        <select 
          className="select-control" 
          value={apiProvider} 
          onChange={(e) => setApiProvider(e.target.value as any)}
          style={{ marginBottom: '16px' }}
        >
          <option value="gemini">Google Gemini API (推奨・一部無料枠あり)</option>
          <option value="openai">OpenAI API (GPT-4o-mini)</option>
        </select>

        <label className="settings-label">APIキー</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showKey ? "text" : "password"} 
            className="input-control" 
            placeholder={apiProvider === 'gemini' ? "AIzaSy..." : "sk-..."}
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            style={{ paddingRight: '44px' }}
          />
          <button 
            type="button"
            className="icon-btn" 
            onClick={() => setShowKey(!showKey)}
            style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '6px' }}
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} style={{ marginTop: '10px' }}>
        <Save size={20} />
        {saveStatus || '設定を保存する'}
      </button>
    </div>
  );
};
