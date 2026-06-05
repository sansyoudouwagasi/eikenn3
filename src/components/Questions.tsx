import React, { useState } from 'react';
import { Volume2, Mic, CheckCircle, AlertCircle } from 'lucide-react';
import { speak, startListening, stopListening } from '../services/speech';

interface QuestionsProps {
  onBack: () => void;
}

interface QuestionItem {
  id: string;
  question: string;
  answer: string;
}

interface CategoryData {
  [key: string]: QuestionItem[];
}

const questionsByCategory: CategoryData = {
  intro: [
    {
      id: 'q_intro_1',
      question: 'Please tell me about yourself.',
      answer: 'My name is Ken. I am fourteen years old, and I live in Tokyo. I like playing tennis.'
    },
    {
      id: 'q_intro_2',
      question: 'What do you like to do on weekends?',
      answer: 'I like to play soccer with my friends in the park. Sometimes, I watch movies at home.'
    }
  ],
  school: [
    {
      id: 'q_school_1',
      question: 'What is your favorite subject at school?',
      answer: 'My favorite subject is science because I like learning about animals and space.'
    },
    {
      id: 'q_school_2',
      question: 'How do you go to school every day?',
      answer: 'I go to school by bicycle. It takes about fifteen minutes from my house.'
    },
    {
      id: 'q_school_3',
      question: 'Do you enjoy school life?',
      answer: 'Yes, I do. I enjoy talking with my classmates and playing sports in physical education class.'
    }
  ],
  hobby: [
    {
      id: 'q_hobby_1',
      question: 'What are your hobbies?',
      answer: 'My hobby is listening to music. I love pop music and listen to it every day.'
    },
    {
      id: 'q_hobby_2',
      question: 'Do you prefer playing sports or playing video games?',
      answer: 'I prefer playing video games because I can play with my friends online at home.'
    }
  ],
  family: [
    {
      id: 'q_family_1',
      question: 'How many people are there in your family?',
      answer: 'There are four people in my family. My father, mother, older sister, and me.'
    },
    {
      id: 'q_family_2',
      question: 'What does your family usually do on weekends?',
      answer: 'We usually go shopping at the mall or eat dinner at a nice restaurant together.'
    }
  ],
  holiday: [
    {
      id: 'q_holiday_1',
      question: 'Where did you go on your last vacation?',
      answer: 'I went to Kyoto with my family. We visited many famous temples and took photos.'
    },
    {
      id: 'q_holiday_2',
      question: 'What are you going to do this Sunday?',
      answer: 'I am going to study English at the library, and then I will help my mother wash the dishes.'
    }
  ],
  dream: [
    {
      id: 'q_dream_1',
      question: 'What do you want to be in the future?',
      answer: 'I want to be an English teacher. I want to teach Japanese children how fun English is.'
    },
    {
      id: 'q_dream_2',
      question: 'Would you like to travel or live abroad in the future?',
      answer: 'Yes, I would. I want to travel to Canada to see the beautiful lakes and practice my English.'
    }
  ]
};

const categories = [
  { id: 'intro', name: '自己紹介' },
  { id: 'school', name: '学校生活' },
  { id: 'hobby', name: '趣味' },
  { id: 'family', name: '家族' },
  { id: 'holiday', name: '休日' },
  { id: 'dream', name: '将来の夢' }
];

export const Questions: React.FC<QuestionsProps> = () => {
  const [activeCategory, setActiveCategory] = useState<string>('intro');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<{ [key: string]: string }>({});
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [voiceRate, setVoiceRate] = useState<number>(0.85);

  React.useEffect(() => {
    // Sync settings voice rate
    const savedConfig = localStorage.getItem('eiken3_settings');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.voiceRate) setVoiceRate(config.voiceRate);
      } catch (e) {}
    }
  }, []);

  const handleSpeak = async (id: string, text: string) => {
    setPlayingId(id);
    await speak(text, 'female', voiceRate);
    setPlayingId(null);
  };

  const calculateSimilarity = (spoken: string, target: string): number => {
    const cleanSpoken = spoken.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    const cleanTarget = target.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").trim();
    if (!cleanSpoken || !cleanTarget) return 0;

    const spokenWords = cleanSpoken.split(/\s+/);
    const targetWords = cleanTarget.split(/\s+/);

    let matchCount = 0;
    spokenWords.forEach(w => {
      if (targetWords.includes(w)) {
        matchCount++;
      }
    });

    return Math.round((matchCount / Math.max(spokenWords.length, targetWords.length)) * 100);
  };

  const handleStartPractice = (id: string, targetText: string) => {
    if (recordingId === id) {
      // Toggle stop
      stopListening();
      setRecordingId(null);
      return;
    }

    setRecordingId(id);
    setTranscripts(prev => ({ ...prev, [id]: '音声を聞き取っています...' }));

    startListening(
      (text, isFinal) => {
        setTranscripts(prev => ({ ...prev, [id]: text }));
        if (isFinal) {
          const sim = calculateSimilarity(text, targetText);
          setScores(prev => ({ ...prev, [id]: sim }));
        }
      },
      (error) => {
        console.error('STT error in practice', error);
        setTranscripts(prev => ({ ...prev, [id]: `エラーが発生しました (${error})` }));
        setRecordingId(null);
      },
      () => {
        setRecordingId(null);
      }
    );
  };

  return (
    <div className="app-content">
      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat.id);
              stopListening();
              setRecordingId(null);
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="questions-list">
        {questionsByCategory[activeCategory].map((item) => {
          const isPlaying = playingId === item.id;
          const isRecording = recordingId === item.id;
          const currentTranscript = transcripts[item.id] || '';
          const currentScore = scores[item.id];

          return (
            <div className="question-item" key={item.id}>
              {/* Question */}
              <div className="question-text-row">
                <span className="q-badge">QUESTION</span>
                <span className="q-text">{item.question}</span>
                <button
                  className="icon-btn"
                  onClick={() => handleSpeak(`${item.id}_q`, item.question)}
                  style={{ padding: '4px', color: playingId === `${item.id}_q` ? '#3b82f6' : '#64748b' }}
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {/* Model Answer */}
              <div className="model-answer-box">
                <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '2px' }}>模範解答:</div>
                <div>{item.answer}</div>
              </div>

              {/* Practice Area */}
              <div className="practice-box">
                <div className="practice-actions">
                  <button
                    className="practice-btn"
                    onClick={() => handleSpeak(item.id, item.answer)}
                    disabled={isPlaying}
                  >
                    <Volume2 size={14} />
                    {isPlaying ? '再生中...' : 'お手本を聞く'}
                  </button>

                  <button
                    className={`practice-btn ${isRecording ? 'mic-active' : ''}`}
                    onClick={() => handleStartPractice(item.id, item.answer)}
                  >
                    <Mic size={14} />
                    {isRecording ? '録音中 (クリックで完了)' : '発音練習する'}
                  </button>
                </div>

                {/* Display Spoken Text */}
                {currentTranscript && (
                  <div className="practice-transcript">
                    <strong>あなたの発音: </strong>
                    <span>{currentTranscript}</span>
                  </div>
                )}

                {/* Display Similarity Score */}
                {currentScore !== undefined && !isRecording && (
                  <div className="similarity-score" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {currentScore >= 70 ? (
                      <CheckCircle size={14} style={{ color: '#10b981' }} />
                    ) : (
                      <AlertCircle size={14} style={{ color: '#f59e0b' }} />
                    )}
                    <span>模範解答との一致率: {currentScore}%</span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500 }}>
                      ({currentScore >= 80 ? '素晴らしい！合格レベル' : currentScore >= 50 ? 'あと少し！' : 'もっと大きな声でハッキリと'})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
