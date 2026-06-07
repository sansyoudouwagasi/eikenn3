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

// 練習用のイラストとして表示する画像タグ（生成された高品質画像を参照）
const parkIllustrationSvg = `
  <img src="/images/park.png" alt="Visiting the Park" style="width: 100%; height: 100%; max-height: 100%; object-fit: contain;" />
`;

const libraryIllustrationSvg = `
  <img src="/images/library.png" alt="Reading Books" style="width: 100%; height: 100%; max-height: 100%; object-fit: contain;" />
`;

const sportsCardIllustrationSvg = `
  <img src="/images/soccer.png" alt="Playing Soccer" style="width: 100%; height: 100%; max-height: 100%; object-fit: contain;" />
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
