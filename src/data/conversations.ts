import type { Conversation } from '../types/progress';

export const CONVERSATIONS: Conversation[] = [
  {
    week: 1,
    title: '自我介紹 — Self Introduction',
    lines: [
      {
        speaker: 'A',
        chinese: '你好，我叫小明。',
        pinyin: 'Nǐ hǎo, wǒ jiào Xiǎomíng.',
        english: 'Hello, my name is Xiaoming.',
      },
      {
        speaker: 'B',
        chinese: '你好，我是王美。很高興認識你。',
        pinyin: 'Nǐ hǎo, wǒ shì Wáng Měi. Hěn gāoxìng rènshi nǐ.',
        english: 'Hello, I am Wang Mei. Nice to meet you.',
      },
      {
        speaker: 'A',
        chinese: '你是哪國人？',
        pinyin: 'Nǐ shì nǎ guó rén?',
        english: 'What country are you from?',
      },
      {
        speaker: 'B',
        chinese: '我是台灣人。你呢？',
        pinyin: 'Wǒ shì Táiwān rén. Nǐ ne?',
        english: 'I am Taiwanese. And you?',
      },
    ],
  },
  {
    week: 2,
    title: '在家裡 — At Home',
    lines: [
      {
        speaker: 'A',
        chinese: '你家有幾口人？',
        pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?',
        english: 'How many people are in your family?',
      },
      {
        speaker: 'B',
        chinese: '我家有四口人：爸爸、媽媽、姐姐和我。',
        pinyin: 'Wǒ jiā yǒu sì kǒu rén: bàba, māma, jiějie hé wǒ.',
        english: 'There are four people in my family: dad, mom, older sister, and me.',
      },
      {
        speaker: 'A',
        chinese: '你姐姐多大了？',
        pinyin: 'Nǐ jiějie duō dà le?',
        english: 'How old is your older sister?',
      },
      {
        speaker: 'B',
        chinese: '她二十五歲，在工作。',
        pinyin: 'Tā èrshíwǔ suì, zài gōngzuò.',
        english: 'She is twenty-five and working.',
      },
    ],
  },
  {
    week: 3,
    title: '在餐廳 — At a Restaurant',
    lines: [
      {
        speaker: 'A',
        chinese: '你們好，請問幾位？',
        pinyin: 'Nǐmen hǎo, qǐngwèn jǐ wèi?',
        english: 'Hello, how many people in your party?',
      },
      {
        speaker: 'B',
        chinese: '兩位，謝謝。',
        pinyin: 'Liǎng wèi, xièxie.',
        english: 'Two people, thank you.',
      },
      {
        speaker: 'A',
        chinese: '你們要喝什麼？',
        pinyin: 'Nǐmen yào hē shénme?',
        english: 'What would you like to drink?',
      },
      {
        speaker: 'B',
        chinese: '一杯水和一杯茶，謝謝。',
        pinyin: 'Yī bēi shuǐ hé yī bēi chá, xièxie.',
        english: 'One glass of water and one cup of tea, please.',
      },
    ],
  },
  {
    week: 4,
    title: '問路 — Asking Directions',
    lines: [
      {
        speaker: 'A',
        chinese: '請問，捷運站在哪裡？',
        pinyin: 'Qǐngwèn, jiéyùn zhàn zài nǎlǐ?',
        english: 'Excuse me, where is the MRT station?',
      },
      {
        speaker: 'B',
        chinese: '往前走，然後向右轉。',
        pinyin: 'Wǎng qián zǒu, ránhòu xiàng yòu zhuǎn.',
        english: 'Go straight ahead, then turn right.',
      },
      {
        speaker: 'A',
        chinese: '走路要多久？',
        pinyin: 'Zǒulù yào duō jiǔ?',
        english: 'How long does it take to walk?',
      },
      {
        speaker: 'B',
        chinese: '大概五分鐘。',
        pinyin: 'Dàgài wǔ fēnzhōng.',
        english: 'About five minutes.',
      },
    ],
  },
  {
    week: 5,
    title: '找工作 — Job Hunting',
    lines: [
      {
        speaker: 'A',
        chinese: '你現在做什麼工作？',
        pinyin: 'Nǐ xiànzài zuò shénme gōngzuò?',
        english: 'What work do you do now?',
      },
      {
        speaker: 'B',
        chinese: '我在一家科技公司工作，擔任工程師。',
        pinyin: 'Wǒ zài yī jiā kējì gōngsī gōngzuò, dānrèn gōngchéngshī.',
        english: 'I work at a tech company as an engineer.',
      },
      {
        speaker: 'A',
        chinese: '你們公司有沒有在招人？',
        pinyin: 'Nǐmen gōngsī yǒu méiyǒu zài zhāo rén?',
        english: 'Is your company hiring?',
      },
      {
        speaker: 'B',
        chinese: '有，你可以上網投履歷。',
        pinyin: 'Yǒu, nǐ kěyǐ shàngwǎng tóu lǚlì.',
        english: 'Yes, you can submit your resume online.',
      },
    ],
  },
  {
    week: 6,
    title: '天氣 — Weather',
    lines: [
      {
        speaker: 'A',
        chinese: '今天天氣真好！',
        pinyin: 'Jīntiān tiānqì zhēn hǎo!',
        english: 'The weather is really nice today!',
      },
      {
        speaker: 'B',
        chinese: '是啊，陽光很充足。不過明天好像會下雨。',
        pinyin: 'Shì a, yángguāng hěn chōngzú. Bùguò míngtiān hǎoxiàng huì xià yǔ.',
        english: 'Yes, the sunshine is great. But it looks like it will rain tomorrow.',
      },
      {
        speaker: 'A',
        chinese: '台灣的夏天很熱吧？',
        pinyin: 'Táiwān de xiàtiān hěn rè ba?',
        english: "Taiwan's summer is very hot, right?",
      },
      {
        speaker: 'B',
        chinese: '對，又熱又濕。冬天比較涼爽。',
        pinyin: 'Duì, yòu rè yòu shī. Dōngtiān bǐjiào liángshuǎng.',
        english: "Yes, hot and humid. Winter is relatively cool.",
      },
    ],
  },
  {
    week: 7,
    title: '看醫生 — Seeing a Doctor',
    lines: [
      {
        speaker: 'A',
        chinese: '請問你有什麼不舒服？',
        pinyin: 'Qǐngwèn nǐ yǒu shénme bù shūfu?',
        english: 'What seems to be the problem?',
      },
      {
        speaker: 'B',
        chinese: '我頭痛，而且喉嚨很痛。',
        pinyin: 'Wǒ tóutòng, érqiě hóulóng hěn tòng.',
        english: 'I have a headache and my throat is very sore.',
      },
      {
        speaker: 'A',
        chinese: '你發燒嗎？',
        pinyin: 'Nǐ fāshāo ma?',
        english: 'Do you have a fever?',
      },
      {
        speaker: 'B',
        chinese: '有一點，體溫三十八度。',
        pinyin: 'Yǒu yīdiǎn, tǐwēn sānshíbā dù.',
        english: 'A little — my temperature is 38 degrees.',
      },
    ],
  },
  {
    week: 8,
    title: '週末計畫 — Weekend Plans',
    lines: [
      {
        speaker: 'A',
        chinese: '這個週末你有什麼計畫？',
        pinyin: 'Zhège zhōumò nǐ yǒu shénme jìhuà?',
        english: 'What are your plans this weekend?',
      },
      {
        speaker: 'B',
        chinese: '我打算去爬山，你要一起來嗎？',
        pinyin: 'Wǒ dǎsuàn qù páshān, nǐ yào yīqǐ lái ma?',
        english: 'I plan to go hiking. Do you want to come along?',
      },
      {
        speaker: 'A',
        chinese: '好啊，要去哪裡？',
        pinyin: 'Hǎo a, yào qù nǎlǐ?',
        english: "Sure! Where are we going?",
      },
      {
        speaker: 'B',
        chinese: '陽明山，風景很美，而且不太難。',
        pinyin: 'Yángmíngshān, fēngjǐng hěn měi, érqiě bù tài nán.',
        english: "Yangmingshan — the scenery is beautiful and it's not too difficult.",
      },
    ],
  },
  {
    week: 9,
    title: '看新聞 — Watching the News',
    lines: [
      {
        speaker: 'A',
        chinese: '你有看今天的新聞嗎？',
        pinyin: 'Nǐ yǒu kàn jīntiān de xīnwén ma?',
        english: "Did you watch today's news?",
      },
      {
        speaker: 'B',
        chinese: '有，報導說颱風下週可能登陸台灣。',
        pinyin: 'Yǒu, bàodǎo shuō táifēng xià zhōu kěnéng dēnglù Táiwān.',
        english: 'Yes — the report said a typhoon might hit Taiwan next week.',
      },
      {
        speaker: 'A',
        chinese: '大家都在買糧食和物資備用。',
        pinyin: 'Dàjiā dōu zài mǎi liángshi hé wùzī bèiyòng.',
        english: "Everyone's buying food and supplies to prepare.",
      },
      {
        speaker: 'B',
        chinese: '我們也要早點準備，以防萬一。',
        pinyin: 'Wǒmen yě yào zǎodiǎn zhǔnbèi, yǐfáng wànyī.',
        english: "We should prepare early too, just in case.",
      },
    ],
  },
  {
    week: 10,
    title: '科技生活 — Tech Life',
    lines: [
      {
        speaker: 'A',
        chinese: '你用什麼手機？',
        pinyin: 'Nǐ yòng shénme shǒujī?',
        english: 'What phone do you use?',
      },
      {
        speaker: 'B',
        chinese: '我用最新款的智慧型手機，功能很強大。',
        pinyin: 'Wǒ yòng zuì xīn kuǎn de zhìhuì xíng shǒujī, gōngnéng hěn qiángdà.',
        english: 'I use the latest smartphone — it has very powerful features.',
      },
      {
        speaker: 'A',
        chinese: '你有在使用人工智慧應用程式嗎？',
        pinyin: 'Nǐ yǒu zài shǐyòng réngōng zhìhuì yìngyòng chéngshì ma?',
        english: 'Do you use any AI applications?',
      },
      {
        speaker: 'B',
        chinese: '有，它幫助我翻譯文件和整理資料。',
        pinyin: 'Yǒu, tā bāngzhù wǒ fānyì wénjiàn hé zhěnglǐ zīliào.',
        english: 'Yes — it helps me translate documents and organize data.',
      },
    ],
  },
  {
    week: 11,
    title: '讀書會 — Book Club',
    lines: [
      {
        speaker: 'A',
        chinese: '你最近在讀什麼書？',
        pinyin: 'Nǐ zuìjìn zài dú shénme shū?',
        english: 'What have you been reading lately?',
      },
      {
        speaker: 'B',
        chinese: '我在讀一本關於哲學與人生意義的書。',
        pinyin: 'Wǒ zài dú yī běn guānyú zhéxué yǔ rénshēng yìyì de shū.',
        english: "I'm reading a book about philosophy and the meaning of life.",
      },
      {
        speaker: 'A',
        chinese: '聽起來很深奧，書中有哪些主要觀點？',
        pinyin: 'Tīng qǐlái hěn shēn ào, shū zhōng yǒu nǎxiē zhǔyào guāndiǎn?',
        english: 'That sounds profound. What are the main ideas?',
      },
      {
        speaker: 'B',
        chinese: '作者認為幸福來自於自我認識和接受。',
        pinyin: 'Zuòzhě rènwéi xìngfú láizì yú zìwǒ rènshi hé jiēshòu.',
        english: 'The author argues that happiness comes from self-knowledge and acceptance.',
      },
    ],
  },
  {
    week: 12,
    title: '回顧與展望 — Looking Back, Looking Forward',
    lines: [
      {
        speaker: 'A',
        chinese: '學了這麼多漢字，你有什麼感想？',
        pinyin: 'Xué le zhème duō Hànzì, nǐ yǒu shénme gǎnxiǎng?',
        english: "Now that you've learned so many characters, how do you feel?",
      },
      {
        speaker: 'B',
        chinese: '我覺得很有成就感，閱讀能力進步了很多。',
        pinyin: 'Wǒ juéde hěn yǒu chéngjiù gǎn, yuèdú nénglì jìnbù le hěn duō.',
        english: 'I feel a great sense of achievement — my reading ability has improved a lot.',
      },
      {
        speaker: 'A',
        chinese: '你未來有什麼學習目標？',
        pinyin: 'Nǐ wèilái yǒu shénme xuéxí mùbiāo?',
        english: 'What are your future learning goals?',
      },
      {
        speaker: 'B',
        chinese: '我想要能夠閱讀中文小說，不依靠字典。',
        pinyin: 'Wǒ xiǎng yào nénggòu yuèdú Zhōngwén xiǎoshuō, bù yīkào zìdiǎn.',
        english: 'I want to be able to read Chinese novels without relying on a dictionary.',
      },
    ],
  },
];
