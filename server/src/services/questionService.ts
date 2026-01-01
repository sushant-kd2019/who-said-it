import { QuestionModel, QuestionDocument } from '../models/Question';

/**
 * Get N questions for a game, sorted by least-used first.
 * Called once at game start to fetch all questions needed.
 */
export async function getQuestions(count: number): Promise<string[]> {
  const questions = await QuestionModel.find({ isActive: true })
    .sort({ usageCount: 1 })
    .limit(count)
    .select('template')
    .lean();
  
  // Shuffle to add randomness (they're already least-used, but shuffle for variety)
  return shuffleArray(questions.map(q => q.template));
}

// Simple Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatQuestion(template: string, playerName: string): string {
  return template.replace(/{name}/g, playerName);
}

export async function addQuestion(template: string, category?: string): Promise<QuestionDocument> {
  const question = new QuestionModel({
    template,
    category: category || 'general',
    isActive: true,
    usageCount: 0,
  });
  
  await question.save();
  return question;
}

export async function getQuestionCount(): Promise<number> {
  return QuestionModel.countDocuments({ isActive: true });
}

/**
 * Increment usage count for questions used in a completed game.
 * Call this when a game finishes (all rounds completed).
 */
export async function incrementQuestionUsage(templates: string[]): Promise<void> {
  if (templates.length === 0) return;
  
  await QuestionModel.updateMany(
    { template: { $in: templates } },
    { $inc: { usageCount: 1 } }
  );
}

/**
 * Seed questions into the database (only inserts new ones).
 */
export async function seedQuestions(questions: string[]): Promise<number> {
  let insertedCount = 0;
  
  for (const template of questions) {
    try {
      const existing = await QuestionModel.findOne({ template });
      if (!existing) {
        await QuestionModel.create({ template, isActive: true, usageCount: 0 });
        insertedCount++;
      }
    } catch (error) {
      // Skip duplicates
      console.log(`Skipping duplicate question: ${template.substring(0, 50)}...`);
    }
  }
  
  return insertedCount;
}
