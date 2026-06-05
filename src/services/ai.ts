
export interface AssessmentResult {
  score: number; // 25 points max
  details: {
    grammar: number; // 1-5
    vocabulary: number; // 1-5
    pronunciation: number; // 1-5 (local uses a simulated or speech confidence metric)
    fluency: number; // 1-5
    appropriateness: number; // 1-5
  };
  strengths: string;
  improvements: string;
  modelAnswers: { questionId: string; questionText: string; userAnswer: string; modelAnswer: string }[];
  recommendedStudy: string;
}

export interface UserResponse {
  questionId: string;
  step: string;
  questionText: string;
  userAnswer: string;
  modelAnswer: string;
  responseTimeMs: number; // response delay
}

// Helper to count words
const countWords = (text: string): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

// Check if userAnswer has keywords from modelAnswer
const checkKeywordOverlap = (user: string, model: string): number => {
  const userWords = new Set(user.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(/\s+/));
  const modelWords = model.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(/\s+/);
  
  // Important content words (exclude pronouns, prepositions, be-verbs)
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'for', 'of', 'in', 'on', 'at', 'it', 'they', 'he', 'she', 'you', 'i', 'we']);
  const keyModelWords = modelWords.filter(w => !stopWords.has(w) && w.length > 2);
  
  if (keyModelWords.length === 0) return 1.0;
  
  let matchCount = 0;
  keyModelWords.forEach(w => {
    if (userWords.has(w) || Array.from(userWords).some(uw => uw.includes(w) || w.includes(uw))) {
      matchCount++;
    }
  });
  
  return matchCount / keyModelWords.length;
};

// 1. LOCAL EVALUATION ENGINE (Fallback)
const evaluateLocally = (
  difficulty: 'easy' | 'normal' | 'hard',
  responses: UserResponse[]
): AssessmentResult => {
  let grammarSum = 0;
  let vocabSum = 0;
  let pronunciationSum = 0;
  let fluencySum = 0;
  let appropriatenessSum = 0;

  const validResponses = responses.filter(r => r.step !== 'greeting' && r.step !== 'reading');
  const totalQuestions = validResponses.length || 1;

  validResponses.forEach(res => {
    const userAns = res.userAnswer.trim().toLowerCase();
    const wordCount = countWords(res.userAnswer);
    const overlap = checkKeywordOverlap(res.userAnswer, res.modelAnswer);

    // --- Grammar scoring ---
    let grammar = 3;
    if (wordCount >= 3) {
      // Check for subject + verb markers (pronouns or nouns + verbs)
      const hasSubject = /\b(i|you|he|she|it|we|they|people|children|boy|girl|there)\b/.test(userAns);
      const hasVerb = /\b(is|are|was|were|do|does|did|go|goes|went|like|likes|liked|play|plays|played|read|reads|readed|visit|visits|visited|can|want|would)\b/.test(userAns);
      if (hasSubject && hasVerb) {
        grammar = 4;
        // Check for connectors / complexity
        if (/\b(because|so|but|and|if|to|about|after|before|when)\b/.test(userAns)) {
          grammar = 5;
        }
      }
    } else if (wordCount > 0 && wordCount < 3) {
      grammar = difficulty === 'easy' ? 3 : 2; // For easy, short answer is okay. For normal/hard, penalize non-sentences.
    } else {
      grammar = 1;
    }
    grammarSum += grammar;

    // --- Vocabulary scoring ---
    let vocab = 3;
    if (wordCount > 0) {
      if (overlap > 0.6) vocab = 5;
      else if (overlap > 0.3) vocab = 4;
      else if (wordCount > 4) vocab = 3.5;
      else vocab = 2;
    } else {
      vocab = 1;
    }
    vocabSum += vocab;

    // --- Pronunciation scoring (Simulated based on transcription success / word length) ---
    let pron = 3;
    if (wordCount > 0) {
      // Longer words transcribed usually means better clarity, short fragments might be misheard
      const averageWordLength = res.userAnswer.length / wordCount;
      if (averageWordLength > 4.5 && overlap > 0.4) pron = 5;
      else if (averageWordLength > 3.8) pron = 4;
      else pron = 3;
    } else {
      pron = 1;
    }
    pronunciationSum += pron;

    // --- Fluency scoring (Based on response time and word count) ---
    let fluency = 3;
    const timeSec = res.responseTimeMs / 1000;
    if (wordCount > 0) {
      if (timeSec < 4 && wordCount >= 3) fluency = 5;
      else if (timeSec < 7 && wordCount >= 2) fluency = 4;
      else if (timeSec < 12) fluency = 3;
      else fluency = 2;
    } else {
      fluency = 1;
    }
    fluencySum += fluency;

    // --- Appropriateness scoring (Checking question types) ---
    let app = 3;
    if (wordCount > 0) {
      // Q1: Why -> Expect because/to
      if (res.questionText.toLowerCase().includes('why')) {
        if (userAns.includes('because') || userAns.includes('to ') || userAns.includes('so that')) {
          app = 5;
        } else if (overlap > 0.4) {
          app = 4;
        } else {
          app = 2;
        }
      }
      // Q3: What doing -> Expect -ing verb
      else if (res.questionText.toLowerCase().includes('what is') && res.questionText.toLowerCase().includes('doing')) {
        if (userAns.includes('ing') || userAns.includes('is ') || userAns.includes('are ')) {
          app = 5;
        } else if (overlap > 0.3) {
          app = 3.5;
        } else {
          app = 2;
        }
      }
      // Q4: How many -> Expect number word or digit
      else if (res.questionText.toLowerCase().includes('how many')) {
        const hasNumber = /\b(one|two|three|four|five|six|seven|eight|nine|ten|[0-9])\b/.test(userAns);
        if (hasNumber) {
          app = 5;
        } else {
          app = 3;
        }
      }
      // Q5: Do you / Would you -> Expect Yes/No response
      else if (/^(do you|would you|are you)/i.test(res.questionText)) {
        const hasYesNo = /\b(yes|no|i do|i don't|i would|i wouldn't|sure|of course)\b/.test(userAns);
        if (hasYesNo) {
          app = 5;
          // Eiken standard: after Yes/No, they ask "Please tell me more" or "Why not?". We assume normal response contains some elaboration.
          if (wordCount < 3) {
            app = 4; // Lacks elaboration
          }
        } else {
          app = 3; // Answered directly without Yes/No
        }
      }
      // General match fallback
      else {
        if (overlap > 0.5) app = 5;
        else if (overlap > 0.2) app = 4;
        else app = 3;
      }
    } else {
      app = 1;
    }
    appropriatenessSum += app;
  });

  const roundScore = (sum: number) => Math.min(5, Math.max(1, Math.round((sum / totalQuestions) * 10) / 10));

  const finalGrammar = roundScore(grammarSum);
  const finalVocab = roundScore(vocabSum);
  const finalPron = roundScore(pronunciationSum);
  const finalFluency = roundScore(fluencySum);
  const finalApp = roundScore(appropriatenessSum);

  const totalPoints = Math.round(finalGrammar + finalVocab + finalPron + finalFluency + finalApp);

  // Generate localized general feedback based on overall score
  let strengths = '';
  let improvements = '';
  let recommendedStudy = '';

  if (totalPoints >= 22) {
    strengths = '質問に対してハキハキと、主語・動詞が揃った文章で答えることができています。発音も明瞭で、キーワードをしっかり拾えています。';
    improvements = '全体的に非常に優れています。さらに上の準2級レベルを目指すために、becauseやandだけでなく、whenやifなどの接続詞を使って、1回の発話で2文以上答える練習をしてみましょう。';
    recommendedStudy = '合格レベルに達しています！本番でも落ち着いて、面接官の目を見て笑顔で話す（アティチュード対策）を意識してください。';
  } else if (totalPoints >= 15) {
    strengths = 'Yes/No の意思表示や、パッセージに関する質問に対して単語や短いフレーズで答えることができています。聞き取りも概ね良好です。';
    improvements = '文で答える意識を高めましょう。例えば "What is the boy doing?" に対して "Reading a book" だけでなく、"He is reading a book." のように「主語＋動詞」の形にするだけで点数が大幅に上がります。';
    recommendedStudy = '日常会話の質問（Q5〜Q7）に対して、Yes/Noで答えた後に「理由をもう1文付け足す」練習（例：Yes, I do. Because it is fun.）を繰り返しましょう。';
  } else {
    strengths = '無言にならず、何かしらの単語や反応を返そうとするアティチュード（積極的な姿勢）が見られます。これは面接でとても大切です。';
    improvements = '音声認識にうまく載らなかったり、回答が途切れてしまっているようです。質問の意味を正しく捉え、焦らずに落ち着いて、大きな声で答えましょう。わからない時は "Pardon?" や "Could you say that again?" と聞き返しても減点されません。';
    recommendedStudy = '頻出質問集の模範解答を繰り返し音読し、英語の「フレーズ」をそのまま口に馴染ませる練習を毎日10分行いましょう。';
  }

  const modelAnswersList = responses.map(r => ({
    questionId: r.questionId,
    questionText: r.questionText,
    userAnswer: r.userAnswer || '(無回答 / No Answer)',
    modelAnswer: r.modelAnswer
  }));

  return {
    score: totalPoints,
    details: {
      grammar: finalGrammar,
      vocabulary: finalVocab,
      pronunciation: finalPron,
      fluency: finalFluency,
      appropriateness: finalApp
    },
    strengths,
    improvements,
    modelAnswers: modelAnswersList,
    recommendedStudy
  };
};

// 2. AI EVALUATION ENGINE (Gemini / OpenAI)
export const evaluateInterview = async (
  difficulty: 'easy' | 'normal' | 'hard',
  responses: UserResponse[],
  apiSettings?: { provider: 'gemini' | 'openai'; apiKey: string }
): Promise<AssessmentResult> => {
  
  if (!apiSettings || !apiSettings.apiKey) {
    // If no API key provided, fall back immediately to smart local engine
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(evaluateLocally(difficulty, responses));
      }, 1500); // Simulate network latency
    });
  }

  const cleanResponses = responses.filter(r => r.step !== 'greeting' && r.step !== 'reading');

  const systemPrompt = `You are an expert Eiken Grade 3 examiner. Your task is to grade the student's answers in the mock test.
The difficulty of this session was: "${difficulty}" (Easy: simple word answers allowed, Normal: standard Grade 3 Eiken, Hard: high-passing level).

Evaluate the following conversation based on 5 criteria (each max 5 points, total 25 points):
1. Grammar (Sentence structure, correct tense)
2. Vocabulary (Use of appropriate words matching the context)
3. Pronunciation (Transcribed text clarity)
4. Fluency (Response speed and smooth flow. Note that response times are provided in milliseconds)
5. Appropriateness (Does the answer directly and correctly answer the question asked?)

Provide detailed constructive feedback in Japanese.
Your output must be in STRICT JSON format with the following structure:
{
  "score": number, // Sum of the 5 criteria details (rounded to integer, max 25)
  "details": {
    "grammar": number, // 1-5 (can be decimal like 4.5)
    "vocabulary": number, // 1-5
    "pronunciation": number, // 1-5
    "fluency": number, // 1-5
    "appropriateness": number // 1-5
  },
  "strengths": "良かった点を具体的に日本語で説明。受験者を褒めて自信をつけさせる内容にしてください。",
  "improvements": "改善点や文法ミス、より良くなるアドバイスを日本語で詳しく説明。",
  "recommendedStudy": "今後の合格に向けた具体的な勉強方法を日本語で提示。"
}

DO NOT wrap the response in markdown code blocks. Return only raw JSON.`;

  const conversationText = cleanResponses.map((r, index) => {
    return `[Question ${index + 1}]
Step: ${r.step}
Question: "${r.questionText}"
Model Answer Reference: "${r.modelAnswer}"
Student's Spoken Answer: "${r.userAnswer || '(No answer/silence)'}"
Response Delay: ${r.responseTimeMs} ms`;
  }).join('\n\n');

  try {
    if (apiSettings.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiSettings.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `Here is the student's mock interview transcription:\n\n${conversationText}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
      }

      const resJson = await response.json();
      const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) throw new Error('Empty response from Gemini API');

      const parsed: any = JSON.parse(textResponse.trim());
      
      return {
        score: parsed.score || 15,
        details: {
          grammar: parsed.details?.grammar || 3,
          vocabulary: parsed.details?.vocabulary || 3,
          pronunciation: parsed.details?.pronunciation || 3,
          fluency: parsed.details?.fluency || 3,
          appropriateness: parsed.details?.appropriateness || 3
        },
        strengths: parsed.strengths || 'よく頑張りました。',
        improvements: parsed.improvements || '文で答える練習をしましょう。',
        modelAnswers: responses.map(r => ({
          questionId: r.questionId,
          questionText: r.questionText,
          userAnswer: r.userAnswer || '(無回答 / No Answer)',
          modelAnswer: r.modelAnswer
        })),
        recommendedStudy: parsed.recommendedStudy || '模範解答を音読しましょう。'
      };

    } else {
      // OpenAI API
      const url = 'https://api.openai.com/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here is the student's mock interview transcription:\n\n${conversationText}` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API returned status ${response.status}`);
      }

      const resJson = await response.json();
      const textResponse = resJson.choices?.[0]?.message?.content;
      
      if (!textResponse) throw new Error('Empty response from OpenAI API');

      const parsed: any = JSON.parse(textResponse.trim());
      
      return {
        score: parsed.score || 15,
        details: {
          grammar: parsed.details?.grammar || 3,
          vocabulary: parsed.details?.vocabulary || 3,
          pronunciation: parsed.details?.pronunciation || 3,
          fluency: parsed.details?.fluency || 3,
          appropriateness: parsed.details?.appropriateness || 3
        },
        strengths: parsed.strengths || 'よく頑張りました。',
        improvements: parsed.improvements || '文で答える練習をしましょう。',
        modelAnswers: responses.map(r => ({
          questionId: r.questionId,
          questionText: r.questionText,
          userAnswer: r.userAnswer || '(無回答 / No Answer)',
          modelAnswer: r.modelAnswer
        })),
        recommendedStudy: parsed.recommendedStudy || '模範解答を音読しましょう。'
      };
    }
  } catch (error) {
    console.error('AI Evaluation failed, falling back to local grading:', error);
    // Fallback on error (network issues, API quota, invalid response format)
    return evaluateLocally(difficulty, responses);
  }
};
