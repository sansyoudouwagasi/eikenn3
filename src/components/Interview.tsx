import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ShieldAlert, Clock, ChevronLeft, Play } from 'lucide-react';
import { speak, stopSpeaking, startListening, stopListening } from '../services/speech';
import { questionsData } from '../data/questionsData';
import type { InterviewCard, InterviewQuestion } from '../data/questionsData';
import type { UserResponse } from '../services/ai';

interface InterviewProps {
  onBack: () => void;
  onComplete: (responses: UserResponse[], difficulty: 'easy' | 'normal' | 'hard') => void;
}

type StepType = 
  | 'waiting_to_start'
  | 'start_greeting'
  | 'greeting_response'
  | 'silent_reading_intro'
  | 'silent_reading_timer'
  | 'aloud_reading_intro'
  | 'aloud_reading'
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7'
  | 'finishing'
  | 'evaluating';

export const Interview: React.FC<InterviewProps> = ({ onBack, onComplete }) => {
  // Config
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [examMode, setExamMode] = useState<'practice' | 'real'>('practice');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [voiceRate, setVoiceRate] = useState<number>(0.85);

  // States
  const [activeCard, setActiveCard] = useState<InterviewCard | null>(null);
  const [step, setStep] = useState<StepType>('waiting_to_start');
  const [examinerText, setExaminerText] = useState<string>('');
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState<boolean>(false);
  
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [accumulatedSpoken, setAccumulatedSpoken] = useState<string>('');
  
  // Timer for Silent reading (20s) and answering questions (30s)
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<any>(null);
  
  // Scoring responses log
  const responsesLog = useRef<UserResponse[]>([]);
  const currentResponseStartTime = useRef<number>(0);

  // Load configuration and select random card
  useEffect(() => {
    const savedConfig = localStorage.getItem('eiken3_settings');
    let loadedDifficulty: 'easy' | 'normal' | 'hard' = 'normal';
    
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.difficulty) {
          loadedDifficulty = config.difficulty;
          setDifficulty(config.difficulty);
        }
        if (config.examMode) setExamMode(config.examMode);
        if (config.voiceGender) setVoiceGender(config.voiceGender);
        if (config.voiceRate) setVoiceRate(config.voiceRate);
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }

    // Select random card matching difficulty
    const cards = questionsData[loadedDifficulty];
    const randomIndex = Math.floor(Math.random() * cards.length);
    setActiveCard(cards[randomIndex]);
  }, []);

  // Handle manual start of the interview flow
  const handleStartInterview = () => {
    if (!activeCard) return;
    setStep('start_greeting');
    runGreeting();
  };

  // Clean up speech synthesis and timers on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Auto trigger transition on timeout
      if (step === 'silent_reading_timer') {
        goToAloudReadingIntro();
      } else if (['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'].includes(step)) {
        handleTimeoutAnswer();
      }
      return;
    }

    if (!timerRef.current && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (timeLeft === 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft, step]);

  // --- Flow Actions ---

  const speakText = async (text: string) => {
    setIsExaminerSpeaking(true);
    setExaminerText(text);
    await speak(text, voiceGender, voiceRate);
    setIsExaminerSpeaking(false);
  };

  const handleSkipSpeaking = () => {
    stopSpeaking();
    setIsExaminerSpeaking(false);
  };

  // 1. Initial Greeting
  const runGreeting = async () => {
    await speakText("Hello. May I have your card, please?");
    setStep('greeting_response');
  };

  // User hand over Eiken card
  const handleHandCard = async () => {
    setStep('greeting_response');
    await speakText("Thank you. My name is " + (voiceGender === 'male' ? 'Mr. Smith' : 'Ms. Smith') + ". How are you today?");
    startAnswering();
  };

  // Transition: Start Silent Reading
  const goToSilentReading = async () => {
    // Record greeting answer if any
    saveCurrentAnswer('greeting', "How are you today?", "I'm good, thank you. / Fine, thank you.");
    
    setStep('silent_reading_intro');
    await speakText("Please read the passage silently for 20 seconds.");
    
    setStep('silent_reading_timer');
    setTimeLeft(20); // 20 seconds silent reading
  };

  // Transition: Start Aloud Reading Intro
  const goToAloudReadingIntro = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setStep('aloud_reading_intro');
    await speakText("Now, please read it aloud.");
    
    setStep('aloud_reading');
    currentResponseStartTime.current = Date.now();
  };

  // User finished Aloud reading
  const handleFinishAloudReading = async () => {
    const elapsed = Date.now() - currentResponseStartTime.current;
    
    // Save aloud reading response (transcript empty since it's reading, but elapsed is tracked)
    responsesLog.current.push({
      questionId: 'passage_reading',
      step: 'reading',
      questionText: 'Read the passage aloud.',
      userAnswer: '(User read passage)',
      modelAnswer: activeCard?.passage || '',
      responseTimeMs: elapsed
    });

    // Q1
    goToQuestion('q1');
  };

  // Q1 to Q7 logic
  const goToQuestion = async (nextStep: StepType) => {
    if (!activeCard) return;

    setStep(nextStep);
    let q: InterviewQuestion | undefined;

    if (nextStep === 'q1') {
      q = activeCard.questions.find(x => x.step === 'q1');
      await speakText("Question 1. " + q?.questionText);
    } else if (nextStep === 'q2') {
      q = activeCard.questions.find(x => x.step === 'q2');
      await speakText("Question 2. " + q?.questionText);
    } else if (nextStep === 'q3') {
      q = activeCard.questions.find(x => x.step === 'q3');
      await speakText("Please look at the picture. Question 3. " + q?.questionText);
    } else if (nextStep === 'q4') {
      q = activeCard.questions.find(x => x.step === 'q4');
      await speakText("Question 4. " + q?.questionText);
    } else if (nextStep === 'q5') {
      q = activeCard.questions.find(x => x.step === 'q5');
      await speakText("Please turn over the card and put it down. Now, Question 5. " + q?.questionText);
    } else if (nextStep === 'q6') {
      q = activeCard.questions.find(x => x.step === 'q6');
      await speakText("Question 6. " + q?.questionText);
    } else if (nextStep === 'q7') {
      q = activeCard.questions.find(x => x.step === 'q7');
      await speakText("Question 7. " + q?.questionText);
    }

    if (q) {
      startAnswering();
    }
  };

  const startAnswering = () => {
    setSpokenText('');
    setAccumulatedSpoken('');
    currentResponseStartTime.current = Date.now();
    
    // Start microphone recording
    setIsRecording(true);
    startListening(
      (text, isFinal) => {
        setSpokenText(text);
        if (isFinal) {
          setAccumulatedSpoken(prev => prev + ' ' + text);
        }
      },
      (error) => {
        console.error('Speech recognition error in interview:', error);
      },
      () => {
        // Handle normal stop
      }
    );

    // Limit answer time in Real Mode
    if (examMode === 'real') {
      setTimeLeft(30); // 30 seconds limit per question
    }
  };

  const saveCurrentAnswer = (currentStep: string, qText: string, mAns: string) => {
    stopListening();
    setIsRecording(false);
    
    const finalAns = (accumulatedSpoken + ' ' + spokenText).trim();
    const elapsed = Date.now() - currentResponseStartTime.current;

    responsesLog.current.push({
      questionId: `${activeCard?.id}_${currentStep}`,
      step: currentStep,
      questionText: qText,
      userAnswer: finalAns || '(No Answer)',
      modelAnswer: mAns,
      responseTimeMs: elapsed
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleNextStep = async () => {
    if (step === 'greeting_response') {
      goToSilentReading();
      return;
    }

    if (!activeCard) return;

    // Stop and save answer
    const currentQ = activeCard.questions.find(x => x.step === step);
    if (currentQ) {
      saveCurrentAnswer(step, currentQ.questionText, currentQ.modelAnswer);
    }

    // Go to next step
    if (step === 'q1') goToQuestion('q2');
    else if (step === 'q2') goToQuestion('q3');
    else if (step === 'q3') goToQuestion('q4');
    else if (step === 'q4') goToQuestion('q5');
    else if (step === 'q5') goToQuestion('q6');
    else if (step === 'q6') goToQuestion('q7');
    else if (step === 'q7') runFinishGreeting();
  };

  const handleTimeoutAnswer = () => {
    if (!activeCard) return;
    const currentQ = activeCard.questions.find(x => x.step === step);
    if (currentQ) {
      saveCurrentAnswer(step, currentQ.questionText, currentQ.modelAnswer);
    }
    
    // Auto jump
    if (step === 'q1') goToQuestion('q2');
    else if (step === 'q2') goToQuestion('q3');
    else if (step === 'q3') goToQuestion('q4');
    else if (step === 'q4') goToQuestion('q5');
    else if (step === 'q5') goToQuestion('q6');
    else if (step === 'q6') goToQuestion('q7');
    else if (step === 'q7') runFinishGreeting();
  };

  // Last Step: Goodbyes
  const runFinishGreeting = async () => {
    setStep('finishing');
    await speakText("That is all. May I have your card back, please?");
    
    // Simple short delay to simulate taking card back
    await new Promise(r => setTimeout(r, 1500));
    
    await speakText("Thank you. You may go now. Have a nice day! Goodbye.");
    setStep('evaluating');
    
    // Finish entire interview, pass responses up for AI evaluation
    setTimeout(() => {
      onComplete(responsesLog.current, difficulty);
    }, 2000);
  };

  // Helper for step dots
  const getStepIndex = () => {
    if (step === 'waiting_to_start') return 0;
    if (step === 'start_greeting' || step === 'greeting_response') return 0;
    if (step === 'silent_reading_intro' || step === 'silent_reading_timer') return 1;
    if (step === 'aloud_reading_intro' || step === 'aloud_reading') return 2;
    if (step === 'q1') return 3;
    if (step === 'q2') return 4;
    if (step === 'q3') return 5;
    if (step === 'q4') return 6;
    if (step === 'q5') return 7;
    if (step === 'q6') return 8;
    if (step === 'q7') return 9;
    return 10;
  };

  return (
    <div className="app-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Exit Button */}
      {step !== 'evaluating' && (
        <button 
          className="icon-btn" 
          onClick={() => {
            if (window.confirm('面接練習を中断してホームに戻りますか？')) {
              onBack();
            }
          }}
          style={{ position: 'absolute', top: '0px', left: '0px', zIndex: 110, background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
          title="面接を中断"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Timer for Silent Reading or Real Mode Limit */}
      {examMode === 'real' && timeLeft > 0 && ['silent_reading_timer', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'].includes(step) && (
        <div className="timer-container">
          <Clock size={14} />
          <span>制限時間: {timeLeft}秒</span>
        </div>
      )}

      {/* Avatar representing examiner Ms. / Mr. Smith */}
      {step !== 'waiting_to_start' && step !== 'evaluating' && (
        <div className="avatar-container">
          <div className={`avatar-wrapper ${isExaminerSpeaking ? 'speaking' : ''}`}>
            <svg className="avatar-svg" viewBox="0 0 100 100" width="100%" height="100%">
              {/* Skin */}
              <circle cx="50" cy="45" r="30" fill="#fbcfe8" />
              
              {/* Face/Eyes */}
              <circle className="eye" cx="40" cy="42" r="3" fill="#1e293b" />
              <circle className="eye" cx="60" cy="42" r="3" fill="#1e293b" />
              
              {/* Blushing */}
              <circle cx="36" cy="48" r="3" fill="#f472b6" opacity="0.4" />
              <circle cx="64" cy="48" r="3" fill="#f472b6" opacity="0.4" />

              {/* Hair */}
              {voiceGender === 'female' ? (
                // Female Hair
                <path d="M 20 40 Q 50 10 80 40 Q 82 60 76 65 Q 70 70 74 55 Q 50 22 26 55 Q 30 70 24 65 Q 18 60 20 40 Z" fill="#653b16" />
              ) : (
                // Male Hair
                <path d="M 22 35 Q 50 12 78 35 Q 80 20 74 15 Q 50 5 26 15 Q 20 20 22 35 Z" fill="#1e293b" />
              )}

              {/* Mouth */}
              <path 
                className={`mouth ${isExaminerSpeaking ? 'speaking' : ''}`}
                d="M 44 58 Q 50 62 56 58" 
                stroke="#be185d" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
              />

              {/* Clothes */}
              <path d="M 25 72 L 75 72 L 85 100 L 15 100 Z" fill="#1e3a8a" />
              <path d="M 40 72 L 50 88 L 60 72 Z" fill="#fff" />
              <path d="M 47 80 L 53 80 L 50 90 Z" fill="#ef4444" />
            </svg>
          </div>
          <div className="examiner-name">
            {voiceGender === 'male' ? 'Mr. Smith (試験官)' : 'Ms. Smith (試験官)'}
          </div>
        </div>
      )}

      {/* Examiner speech bubbles. Hide questions in real mode if asking Q1-Q7 */}
      {step !== 'waiting_to_start' && step !== 'evaluating' && (
        <div className="examiner-bubble">
          {examMode === 'real' && ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'].includes(step) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <ShieldAlert size={16} />
              <span>(本番モード：質問文は表示されません。音声をよく聞いて回答してください)</span>
            </div>
          ) : (
            examinerText || "Hello."
          )}
        </div>
      )}

      {/* STEP 2/3/4 Eiken passage & illustration card panel */}
      {activeCard && ['silent_reading_timer', 'aloud_reading', 'q1', 'q2', 'q3', 'q4'].includes(step) && (
        <div className="interview-card-panel">
          <div className="card-label">
            {['silent_reading_timer', 'aloud_reading', 'q1', 'q2'].includes(step) ? 'Passage' : 'Illustration'}
          </div>
          
          {/* Title & Passage (only for Q1 & Q2 or reading) */}
          {['silent_reading_timer', 'aloud_reading', 'q1', 'q2'].includes(step) && (
            <>
              <h3 className="card-title">{activeCard.title}</h3>
              <p className="card-passage">{activeCard.passage}</p>
            </>
          )}

          {/* Picture (only for Q3 & Q4 or reading) */}
          {['aloud_reading', 'q1', 'q2', 'q3', 'q4'].includes(step) && (
            <div 
              className="card-illustration" 
              dangerouslySetInnerHTML={{ __html: activeCard.illustrationSvgCode }} 
            />
          )}
        </div>
      )}

      {/* Waiting to start screen */}
      {step === 'waiting_to_start' && (
        <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', padding: '0 10px', textAlign: 'center' }}>
          <h3 style={{ color: '#1e3a8a', fontWeight: 800, fontSize: '1.3rem', marginBottom: '4px' }}>英検3級 模擬面接へようこそ</h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: '0 10px 10px 10px' }}>
            本番同様の形式で、面接官（AI）の質問に答える練習を行います。<br />
            面接官が英語で語りかけますので、マイクに向かって声を出して回答してください。
          </p>
          
          <div style={{ width: '100%', background: '#f1f5f9', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px' }}>💡 面接の流れとコツ：</h4>
            <ul style={{ fontSize: '0.75rem', color: '#475569', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>1. 挨拶＆受験票受け渡し</strong>: 画面のボタンを押して挨拶します。</li>
              <li><strong>2. 英文の黙読・音読</strong>: 20秒の黙読の後、声に出して読み上げます。</li>
              <li><strong>3. 5つの質問 (Q1〜Q5)</strong>: カードやイラスト、あなた自身についての質問に答えます。</li>
              <li><strong>音声が聞こえない場合</strong>: 画面に「スキップして進む」ボタンが表示されますので、そちらから進行可能です。</li>
            </ul>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleStartInterview} 
            disabled={!activeCard}
            style={{ 
              padding: '16px', 
              fontSize: '1.05rem', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' 
            }}
          >
            <Play size={20} fill="currentColor" />
            {activeCard ? '模擬面接をスタートする' : '問題カードをロード中...'}
          </button>
        </div>
      )}

      {/* Greeting response actions */}
      {step === 'greeting_response' && (
        <div style={{ marginTop: 'auto' }}>
          <button className="btn-primary" onClick={handleHandCard}>
            受験票カードを渡して挨拶する
          </button>
        </div>
      )}

      {/* Silent reading counting screen */}
      {step === 'silent_reading_timer' && (
        <div className="input-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 700 }}>
            <Clock size={20} className="spin-slow" />
            <span>黙読中: {timeLeft} 秒</span>
          </div>
          <button className="btn-secondary" onClick={goToAloudReadingIntro} style={{ width: '100%' }}>
            黙読をスキップして音読へ
          </button>
        </div>
      )}

      {/* Aloud reading action */}
      {step === 'aloud_reading' && (
        <div className="input-panel">
          <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
            カードの英文を大きな声で音読してください。
          </p>
          <button className="btn-accent" onClick={handleFinishAloudReading}>
            音読が完了しました
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Evaluating loader screen */}
      {step === 'evaluating' && (
        <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="wave-bar" style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
          <h3 style={{ color: '#1e3a8a', fontWeight: 800 }}>面接試験終了</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>AIが採点と評価レポートを作成しています。お待ちください...</p>
        </div>
      )}

      {/* Examiner speaking indicator & skip button */}
      {isExaminerSpeaking && step !== 'evaluating' && step !== 'waiting_to_start' && (
        <div className="input-panel" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a', fontWeight: 700, fontSize: '0.85rem' }}>
            <div className="wave-bar" style={{ animationDelay: '0.1s', background: '#3b82f6', height: '12px' }}></div>
            <div className="wave-bar" style={{ animationDelay: '0.3s', background: '#3b82f6', height: '12px' }}></div>
            <div className="wave-bar" style={{ animationDelay: '0.5s', background: '#3b82f6', height: '12px' }}></div>
            <span>試験官が話しています...</span>
          </div>
          <button 
            className="btn-secondary" 
            onClick={handleSkipSpeaking}
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              fontSize: '0.8rem', 
              color: '#64748b', 
              borderColor: '#e2e8f0',
              height: 'auto'
            }}
          >
            音声をスキップして次へ進む
          </button>
        </div>
      )}

      {/* User interactive speech recording area (Q1 to Q7, greeting) */}
      {isRecording && !isExaminerSpeaking && (
        <div className="input-panel">
          {/* Animated waves while speech recording */}
          <div className="audio-wave">
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>

          <div className="spoken-text">
            {spokenText || accumulatedSpoken || "声に出して回答してください..."}
          </div>

          <button className="btn-primary" onClick={handleNextStep}>
            回答を完了して次へ
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step dots at the bottom */}
      {step !== 'evaluating' && step !== 'waiting_to_start' && (
        <div className="step-indicator" style={{ marginTop: '20px', marginBottom: '10px' }}>
          {Array.from({ length: 11 }).map((_, idx) => (
            <div 
              key={idx} 
              className={`step-dot ${idx === getStepIndex() ? 'active' : idx < getStepIndex() ? 'completed' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
