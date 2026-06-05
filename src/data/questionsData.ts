export interface InterviewQuestion {
  id: string;
  step: 'greeting' | 'reading' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7';
  questionText: string;
  modelAnswer: string;
}

export interface InterviewCard {
  id: string;
  title: string;
  passage: string;
  illustrationSvgCode: string;
  questions: InterviewQuestion[];
}

export interface DifficultyData {
  easy: InterviewCard[];
  normal: InterviewCard[];
  hard: InterviewCard[];
}

// 練習用のイラストとして表示するSVG
const parkIllustrationSvg = `
<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background-color: #e3faf2; border-radius: 8px;">
  <!-- Background Grass & Sky -->
  <rect x="0" y="150" width="400" height="150" fill="#a3e635" />
  <circle cx="200" cy="180" r="120" fill="#86efac" opacity="0.5" />
  <circle cx="320" cy="150" r="80" fill="#86efac" opacity="0.5" />
  <rect x="0" y="0" width="400" height="150" fill="#bae6fd" />
  <circle cx="50" cy="50" r="30" fill="#fff" opacity="0.8" />
  <circle cx="70" cy="55" r="25" fill="#fff" opacity="0.8" />
  <circle cx="340" cy="40" r="20" fill="#fef08a" />
  
  <!-- Trees -->
  <g transform="translate(40, 90)">
    <rect x="15" y="40" width="10" height="30" fill="#b45309" />
    <ellipse cx="20" cy="30" rx="30" ry="25" fill="#15803d" />
  </g>
  <g transform="translate(320, 100)">
    <rect x="10" y="30" width="8" height="30" fill="#b45309" />
    <circle cx="14" cy="20" r="22" fill="#166534" />
  </g>

  <!-- Bench -->
  <g transform="translate(220, 170)">
    <rect x="0" y="15" width="70" height="5" fill="#78350f" />
    <rect x="5" y="20" width="5" height="15" fill="#451a03" />
    <rect x="60" y="20" width="5" height="15" fill="#451a03" />
    <rect x="0" y="0" width="70" height="12" fill="#92400e" />
  </g>

  <!-- Character 1: Girl sitting on the bench reading a book -->
  <g transform="translate(240, 150)">
    <!-- Body -->
    <ellipse cx="15" cy="22" rx="8" ry="10" fill="#fb7185" />
    <!-- Head -->
    <circle cx="15" cy="10" r="6" fill="#fbcfe8" />
    <rect x="11" cy="4" width="8" height="4" fill="#172554" />
    <!-- Book -->
    <path d="M 8,24 Q 13,20 18,24" stroke="#1d4ed8" stroke-width="3" fill="none" />
  </g>

  <!-- Character 2: Boy running with a dog -->
  <g transform="translate(90, 160)">
    <!-- Boy -->
    <ellipse cx="15" cy="20" rx="6" ry="10" fill="#60a5fa" />
    <circle cx="17" cy="8" r="6" fill="#fed7aa" />
    <path d="M 12,24 L 8,32 M 17,24 L 20,32" stroke="#1e3a8a" stroke-width="3" />
    <!-- Dog -->
    <ellipse cx="42" cy="25" rx="10" ry="7" fill="#fbbf24" />
    <circle cx="48" cy="19" r="5" fill="#fbbf24" />
    <rect x="36" y="24" width="4" height="10" fill="#fbbf24" />
    <rect x="44" y="24" width="4" height="10" fill="#fbbf24" />
    <path d="M 33,21 Q 30,18 28,22" stroke="#d97706" stroke-width="2" fill="none" />
  </g>

  <!-- Bag under the tree -->
  <g transform="translate(60, 155)">
    <rect x="0" y="0" width="14" height="10" rx="2" fill="#ea580c" />
    <path d="M 3,0 Q 7,-4 11,0" stroke="#9a3412" stroke-width="1.5" fill="none" />
  </g>

  <!-- Cat on the bench side -->
  <g transform="translate(300, 175)">
    <ellipse cx="8" cy="8" rx="6" ry="4" fill="#6b7280" />
    <circle cx="12" cy="5" r="3" fill="#6b7280" />
    <path d="M 3,8 Q 0,12 2,14" stroke="#4b5563" stroke-width="1.5" fill="none" />
  </g>
</svg>
`;

const libraryIllustrationSvg = `
<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background-color: #fef3c7; border-radius: 8px;">
  <!-- Floor and Walls -->
  <rect x="0" y="0" width="400" height="230" fill="#fde68a" opacity="0.3" />
  <rect x="0" y="230" width="400" height="70" fill="#d97706" opacity="0.8" />
  <line x1="0" y1="230" x2="400" y2="230" stroke="#92400e" stroke-width="3" />

  <!-- Bookshelves -->
  <g transform="translate(30, 40)">
    <rect x="0" y="0" width="100" height="190" fill="#b45309" rx="4" />
    <!-- Shelves -->
    <rect x="5" y="45" width="90" height="6" fill="#78350f" />
    <rect x="5" y="95" width="90" height="6" fill="#78350f" />
    <rect x="5" y="145" width="90" height="6" fill="#78350f" />
    <!-- Books -->
    <rect x="10" y="15" width="8" height="30" fill="#f87171" />
    <rect x="20" y="10" width="10" height="35" fill="#60a5fa" />
    <rect x="32" y="20" width="8" height="25" fill="#34d399" />
    <rect x="45" y="12" width="9" height="33" fill="#fbbf24" />
    
    <rect x="15" y="65" width="12" height="30" fill="#a78bfa" />
    <rect x="30" y="60" width="8" height="35" fill="#f472b6" />
    <rect x="50" y="68" width="10" height="27" fill="#fb923c" />

    <rect x="12" y="115" width="9" height="30" fill="#38bdf8" />
    <rect x="24" y="110" width="11" height="35" fill="#4ade80" />
    <rect x="40" y="120" width="7" height="25" fill="#ec4899" />
    <rect x="52" y="112" width="10" height="33" fill="#818cf8" />
  </g>

  <!-- Table and Chairs -->
  <g transform="translate(180, 190)">
    <rect x="10" y="15" width="80" height="6" fill="#78350f" rx="1" />
    <rect x="20" y="21" width="6" height="25" fill="#78350f" />
    <rect x="74" y="21" width="6" height="25" fill="#78350f" />
  </g>

  <!-- Character 1: Girl sitting reading -->
  <g transform="translate(195, 160)">
    <!-- Chair Left -->
    <rect x="0" y="20" width="12" height="4" fill="#b45309" />
    <rect x="2" y="24" width="3" height="20" fill="#b45309" />
    <rect x="8" y="24" width="3" height="20" fill="#b45309" />
    <rect x="0" y="5" width="3" height="15" fill="#b45309" />
    <!-- Person -->
    <ellipse cx="15" cy="15" rx="7" ry="10" fill="#ec4899" />
    <circle cx="15" cy="5" r="5" fill="#fed7aa" />
    <!-- Book -->
    <path d="M 20,16 L 26,12 L 26,20 L 20,24 Z" fill="#60a5fa" />
  </g>

  <!-- Character 2: Boy standing and holding a book -->
  <g transform="translate(145, 140)">
    <ellipse cx="10" cy="30" rx="7" ry="13" fill="#3b82f6" />
    <circle cx="10" cy="14" r="6" fill="#ffedd5" />
    <path d="M 7,43 L 5,55 M 13,43 L 15,55" stroke="#1d4ed8" stroke-width="3" />
    <!-- Book in hand -->
    <rect x="15" y="26" width="8" height="12" fill="#ef4444" />
  </g>

  <!-- Clock on the wall -->
  <g transform="translate(240, 40)">
    <circle cx="20" cy="20" r="18" fill="#fff" stroke="#94a3b8" stroke-width="2" />
    <line x1="20" y1="20" x2="20" y2="10" stroke="#000" stroke-width="2" />
    <line x1="20" y1="20" x2="28" y2="20" stroke="#000" stroke-width="1.5" />
  </g>

  <!-- Cup on the table -->
  <g transform="translate(255, 195)">
    <rect x="0" y="0" width="6" height="8" fill="#06b6d4" rx="1" />
    <path d="M 6,2 C 8,2 8,6 6,6" stroke="#06b6d4" stroke-width="1.5" fill="none" />
  </g>
</svg>
`;

const sportsCardIllustrationSvg = `
<svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background-color: #dbeafe; border-radius: 8px;">
  <!-- Sky & Ground -->
  <rect x="0" y="0" width="400" height="160" fill="#93c5fd" opacity="0.4" />
  <rect x="0" y="160" width="400" height="140" fill="#65a30d" />
  <path d="M 0,160 Q 150,130 400,160" fill="#65a30d" />

  <!-- Goal Post -->
  <g transform="translate(290, 100)">
    <path d="M 0,80 L 0,0 L 70,0 L 70,80" fill="none" stroke="#fff" stroke-width="4" />
    <path d="M 0,0 L 20,10 L 50,10 L 70,0" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="3,3" />
  </g>

  <!-- Soccer Ball -->
  <circle cx="210" cy="230" r="8" fill="#fff" stroke="#000" stroke-width="1" />
  <path d="M 207,226 L 213,226 L 215,231 L 210,235 L 205,231 Z" fill="#000" />

  <!-- Boy kicking the ball -->
  <g transform="translate(150, 150)">
    <!-- Head -->
    <circle cx="15" cy="12" r="7" fill="#fed7aa" />
    <rect x="10" y="3" width="10" height="4" fill="#78350f" />
    <!-- T-shirt -->
    <path d="M 5,20 L 25,20 L 22,38 L 8,38 Z" fill="#ef4444" />
    <!-- Legs (Kicking pose) -->
    <path d="M 10,38 L 5,54 M 20,38 L 32,48" stroke="#1e3a8a" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- Girl cheerleading / watching -->
  <g transform="translate(60, 160)">
    <circle cx="15" cy="10" r="6" fill="#fbcfe8" />
    <path d="M 7,16 L 23,16 L 20,34 L 10,34 Z" fill="#8b5cf6" />
    <path d="M 5,16 Q 0,10 5,6 M 25,16 Q 30,10 25,6" stroke="#fbbf24" stroke-width="3.5" fill="none" />
    <path d="M 10,34 L 10,48 M 20,34 L 20,48" stroke="#1e1b4b" stroke-width="3" />
  </g>

  <!-- Water bottle on the grass -->
  <g transform="translate(120, 245)">
    <rect x="0" y="3" width="6" height="12" fill="#0284c7" rx="1" />
    <rect x="1.5" y="0" width="3" height="3" fill="#e0f2fe" />
  </g>
</svg>
`;

export const questionsData: DifficultyData = {
  easy: [
    {
      id: 'e1',
      title: 'Visiting the Park',
      passage: 'Many people like to visit the park on weekends. They go there to enjoy the fresh air and walk their dogs. Children love to run on the green grass. It is a good place to relax after a busy week.',
      illustrationSvgCode: parkIllustrationSvg,
      questions: [
        {
          id: 'e1_q1',
          step: 'q1',
          questionText: 'Why do people visit the park on weekends?',
          modelAnswer: 'To enjoy the fresh air and walk their dogs.'
        },
        {
          id: 'e1_q2',
          step: 'q2',
          questionText: 'What do children love to do in the park?',
          modelAnswer: 'They love to run on the green grass.'
        },
        {
          id: 'e1_q3',
          step: 'q3',
          questionText: 'Please look at the girl on the bench. What is she doing?',
          modelAnswer: 'She is reading a book.'
        },
        {
          id: 'e1_q4',
          step: 'q4',
          questionText: 'How many people are in the park?',
          modelAnswer: 'There are two people.'
        },
        {
          id: 'e1_q5',
          step: 'q5',
          questionText: 'Do you like going to parks?',
          modelAnswer: 'Yes, I do. / No, I do not.'
        },
        {
          id: 'e1_q6',
          step: 'q6',
          questionText: 'What do you usually do on Sundays?',
          modelAnswer: 'I usually play video games at home.'
        },
        {
          id: 'e1_q7',
          step: 'q7',
          questionText: 'Would you like to travel to another country in the future?',
          modelAnswer: 'Yes, I would. I want to visit America.'
        }
      ]
    },
    {
      id: 'e2',
      title: 'Reading Books',
      passage: 'Reading books is a very popular hobby. People can learn many new things from books. Some people go to libraries to find quiet places to read. Today, many people also enjoy reading electronic books on computers.',
      illustrationSvgCode: libraryIllustrationSvg,
      questions: [
        {
          id: 'e2_q1',
          step: 'q1',
          questionText: 'What can people learn from books?',
          modelAnswer: 'They can learn many new things.'
        },
        {
          id: 'e2_q2',
          step: 'q2',
          questionText: 'Why do some people go to libraries?',
          modelAnswer: 'To find quiet places to read.'
        },
        {
          id: 'e2_q3',
          step: 'q3',
          questionText: 'Please look at the boy standing. What is he doing?',
          modelAnswer: 'He is holding a book.'
        },
        {
          id: 'e2_q4',
          step: 'q4',
          questionText: 'How many books are on the top shelf?',
          modelAnswer: 'There are four books.'
        },
        {
          id: 'e2_q5',
          step: 'q5',
          questionText: 'Do you like reading books?',
          modelAnswer: 'Yes, I do. I like comic books. / No, I do not.'
        },
        {
          id: 'e2_q6',
          step: 'q6',
          questionText: 'What do you usually do after school?',
          modelAnswer: 'I usually study English and watch TV.'
        },
        {
          id: 'e2_q7',
          step: 'q7',
          questionText: 'Do you want to study English in the future?',
          modelAnswer: 'Yes, I do. English is fun.'
        }
      ]
    }
  ],
  normal: [
    {
      id: 'n1',
      title: 'Playing Soccer',
      passage: 'Soccer is one of the most exciting sports in Japan. Many students join soccer clubs at school and practice very hard every day. Playing soccer helps them stay healthy. It is also a great way to make good friends.',
      illustrationSvgCode: sportsCardIllustrationSvg,
      questions: [
        {
          id: 'n1_q1',
          step: 'q1',
          questionText: 'According to the passage, how does playing soccer help students?',
          modelAnswer: 'It helps them stay healthy and make good friends.'
        },
        {
          id: 'n1_q2',
          step: 'q2',
          questionText: 'What do many students do at school to play soccer?',
          modelAnswer: 'They join soccer clubs and practice very hard every day.'
        },
        {
          id: 'n1_q3',
          step: 'q3',
          questionText: 'Please look at the boy. What is he about to do?',
          modelAnswer: 'He is about to kick a soccer ball.'
        },
        {
          id: 'n1_q4',
          step: 'q4',
          questionText: 'What is on the grass next to the player?',
          modelAnswer: 'There is a water bottle.'
        },
        {
          id: 'n1_q5',
          step: 'q5',
          questionText: 'Do you like playing sports?',
          modelAnswer: 'Yes, I do. I play basketball with my friends. / No, I do not. I prefer indoor activities.'
        },
        {
          id: 'n1_q6',
          step: 'q6',
          questionText: 'What kind of sports do you like to watch on TV?',
          modelAnswer: 'I like to watch baseball games on TV with my family.'
        },
        {
          id: 'n1_q7',
          step: 'q7',
          questionText: 'Would you like to try a new sport in the future?',
          modelAnswer: 'Yes, I would. I want to try snowboarding next winter.'
        }
      ]
    },
    {
      id: 'n2',
      title: 'Cooking at Home',
      passage: 'Many families enjoy cooking together on weekends. Children learn how to prepare healthy food from their parents. Cooking at home is cheaper than eating out at restaurants. It is also a good opportunity for family communication.',
      illustrationSvgCode: libraryIllustrationSvg, // プレースホルダーで流用
      questions: [
        {
          id: 'n2_q1',
          step: 'q1',
          questionText: 'According to the passage, why is cooking at home good for family budget?',
          modelAnswer: 'Because it is cheaper than eating out at restaurants.'
        },
        {
          id: 'n2_q2',
          step: 'q2',
          questionText: 'What do children learn from their parents while cooking?',
          modelAnswer: 'They learn how to prepare healthy food.'
        },
        {
          id: 'n2_q3',
          step: 'q3',
          questionText: 'Please look at the table. What is on the table?',
          modelAnswer: 'There is a cup on the table.'
        },
        {
          id: 'n2_q4',
          step: 'q4',
          questionText: 'What is the girl on the left doing?',
          modelAnswer: 'She is reading a book.'
        },
        {
          id: 'n2_q5',
          step: 'q5',
          questionText: 'Do you often help your parents at home?',
          modelAnswer: 'Yes, I do. I clean my room and wash the dishes. / No, I rarely help them because I am busy.'
        },
        {
          id: 'n2_q6',
          step: 'q6',
          questionText: 'What is your favorite food to eat for dinner?',
          modelAnswer: 'My favorite dinner is curry rice made by my mother.'
        },
        {
          id: 'n2_q7',
          step: 'q7',
          questionText: 'Do you want to learn how to cook more dishes in the future?',
          modelAnswer: 'Yes, I do. I want to cook Italian pasta by myself.'
        }
      ]
    }
  ],
  hard: [
    {
      id: 'h1',
      title: 'Protecting Environment',
      passage: 'These days, protecting the environment is becoming very important. Many people carry reusable bags when they go shopping to reduce plastic waste. Schools are also teaching students the value of recycling. Small actions can make a big difference for our future.',
      illustrationSvgCode: parkIllustrationSvg, // プレースホルダーで流用
      questions: [
        {
          id: 'h1_q1',
          step: 'q1',
          questionText: 'According to the passage, why do many people carry reusable bags when shopping?',
          modelAnswer: 'To reduce plastic waste and protect the environment.'
        },
        {
          id: 'h1_q2',
          step: 'q2',
          questionText: 'What are schools teaching their students to do?',
          modelAnswer: 'They are teaching students the value of recycling.'
        },
        {
          id: 'h1_q3',
          step: 'q3',
          questionText: 'Please look at the orange bag. Where is it located?',
          modelAnswer: 'It is located under the tree on the left.'
        },
        {
          id: 'h1_q4',
          step: 'q4',
          questionText: 'What is the boy doing with the dog?',
          modelAnswer: 'He is running or playing with the dog in the park.'
        },
        {
          id: 'h1_q5',
          step: 'q5',
          questionText: 'Do you try to save electricity or water in your daily life?',
          modelAnswer: 'Yes, I do. I always turn off the lights when I leave a room.'
        },
        {
          id: 'h1_q6',
          step: 'q6',
          questionText: 'What environmental issues are you most interested in?',
          modelAnswer: 'I am interested in global warming because it changes our weather patterns.'
        },
        {
          id: 'h1_q7',
          step: 'q7',
          questionText: 'Do you think young people should do volunteer work to clean local areas?',
          modelAnswer: 'Yes, I think so. It makes our neighborhood beautiful and teaches us responsibility.'
        }
      ]
    },
    {
      id: 'h2',
      title: 'Online Shopping',
      passage: 'Shopping online is growing rapidly around the world. People can buy clothes, electronics, and even fresh food without leaving their homes. Delivery companies work day and night to bring packages to customers. However, this has created a problem of too much packaging materials.',
      illustrationSvgCode: libraryIllustrationSvg,
      questions: [
        {
          id: 'h2_q1',
          step: 'q1',
          questionText: 'According to the passage, what is the problem caused by online shopping?',
          modelAnswer: 'It has created a problem of having too much packaging materials.'
        },
        {
          id: 'h2_q2',
          step: 'q2',
          questionText: 'What can people buy online without leaving their homes?',
          modelAnswer: 'They can buy clothes, electronics, and even fresh food.'
        },
        {
          id: 'h2_q3',
          step: 'q3',
          questionText: 'Please look at the clock on the wall. What time is it showing?',
          modelAnswer: 'It is showing three o\'clock.'
        },
        {
          id: 'h2_q4',
          step: 'q4',
          questionText: 'What color is the book held by the standing boy?',
          modelAnswer: 'It is red.'
        },
        {
          id: 'h2_q5',
          step: 'q5',
          questionText: 'Do you prefer buying things online or in actual stores?',
          modelAnswer: 'I prefer buying things in actual stores because I can see and touch the items before purchasing.'
        },
        {
          id: 'h2_q6',
          step: 'q6',
          questionText: 'What was the last item you bought online or in a store?',
          modelAnswer: 'The last item I bought was an English dictionary for school.'
        },
        {
          id: 'h2_q7',
          step: 'q7',
          questionText: 'Do you think virtual stores will completely replace real physical shops in the future?',
          modelAnswer: 'No, I don\'t think so. Going shopping in physical stores is a fun social activity for friends and families.'
        }
      ]
    }
  ]
};
