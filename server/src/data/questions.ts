export const questionTemplates: string[] = [
  "What would {name} do if no one was looking?",
  "What is {name}'s secret talent that nobody knows about?",
  "What would {name} spend $1 million on first?",
  "What's the most embarrassing thing {name} has probably done?",
  "If {name} was a superhero, what would their power be?",
  "What would {name} do on their perfect day off?",
  "What's {name}'s guilty pleasure?",
  "What would {name} be famous for in 10 years?",
  "What's the weirdest thing in {name}'s search history?",
  "If {name} had a catchphrase, what would it be?",
  "What would {name} do if they won the lottery?",
  "What's {name}'s most unpopular opinion?",
  "If {name} could only eat one food forever, what would it be?",
  "What would {name}'s autobiography be titled?",
  "What's the first thing {name} would do during a zombie apocalypse?",
  "If {name} was a villain, what would be their evil plan?",
  "What would {name} never admit to liking?",
  "If {name} had a theme song, what would it be?",
  "What's {name} most likely to be late for?",
  "What would {name} do with an extra hour every day?",
  "What's {name}'s biggest pet peeve?",
  "If {name} could have dinner with anyone, who would they pick?",
  "What's {name}'s go-to karaoke song?",
  "What would {name} do if they were invisible for a day?",
  "What's {name}'s hidden fear?",
  "If {name} was stranded on a desert island, what one thing would they bring?",
  "What's {name}'s most useless skill?",
  "What would {name}'s dating profile bio say?",
  "What does {name} think about in the shower?",
  "If {name} was a food, what would they be?",
];

export function getRandomQuestion(usedQuestions: string[]): string | null {
  const available = questionTemplates.filter(q => !usedQuestions.includes(q));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function formatQuestion(template: string, playerName: string): string {
  return template.replace(/{name}/g, playerName);
}

