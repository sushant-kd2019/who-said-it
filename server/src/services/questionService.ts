import { QuestionModel, QuestionDocument } from '../models/Question';

// Cache for questions to avoid repeated DB calls
let questionCache: string[] | null = null;

export async function getAllQuestions(): Promise<string[]> {
  if (questionCache) {
    return questionCache;
  }
  
  const questions = await QuestionModel.find({ isActive: true });
  questionCache = questions.map(q => q.template);
  return questionCache;
}

export async function getRandomQuestion(usedQuestions: string[]): Promise<string | null> {
  const allQuestions = await getAllQuestions();
  const available = allQuestions.filter(q => !usedQuestions.includes(q));
  
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function formatQuestion(template: string, playerName: string): string {
  return template.replace(/{name}/g, playerName);
}

export async function addQuestion(template: string, category?: string): Promise<QuestionDocument> {
  const question = new QuestionModel({
    template,
    category: category || 'general',
    isActive: true,
  });
  
  await question.save();
  
  // Invalidate cache
  questionCache = null;
  
  return question;
}

export async function getQuestionCount(): Promise<number> {
  return QuestionModel.countDocuments({ isActive: true });
}

export function invalidateCache(): void {
  questionCache = null;
}

// Seed questions into the database
export async function seedQuestions(questions: string[]): Promise<number> {
  let insertedCount = 0;
  
  for (const template of questions) {
    try {
      const existing = await QuestionModel.findOne({ template });
      if (!existing) {
        await QuestionModel.create({ template, isActive: true });
        insertedCount++;
      }
    } catch (error) {
      // Skip duplicates
      console.log(`Skipping duplicate question: ${template.substring(0, 50)}...`);
    }
  }
  
  // Invalidate cache after seeding
  questionCache = null;
  
  return insertedCount;
}

