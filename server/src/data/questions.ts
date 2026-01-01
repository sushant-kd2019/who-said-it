/**
 * @deprecated This file is deprecated. Questions are now stored in MongoDB.
 * See src/services/questionService.ts for the new implementation.
 * See src/data/seedQuestions.ts for the question templates.
 * 
 * This file is kept for reference only.
 */

export const questionTemplates: string[] = [];

export function getRandomQuestion(_usedQuestions: string[]): string | null {
  console.warn('DEPRECATED: Use questionService.getRandomQuestion instead');
  return null;
}

export function formatQuestion(template: string, playerName: string): string {
  console.warn('DEPRECATED: Use questionService.formatQuestion instead');
  return template.replace(/{name}/g, playerName);
}

