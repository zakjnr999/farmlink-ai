import { describe, expect, it } from 'vitest';
import { generateFarmAdvisoryResponse } from '@/lib/demo/farm-advisory-demo';
import type { AdvisoryMessage } from '@/types/farm-advisory';

function userMessage(content: string): AdvisoryMessage {
  return {
    id: `user-${content.slice(0, 8)}`,
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  };
}

describe('Farm advisory demo', () => {
  it('asks follow-up questions for plantain leaves turning black', () => {
    const response = generateFarmAdvisoryResponse([
      userMessage('Why is my plantain leaves turning black?'),
    ]);

    expect(response.topicLabel).toContain('Plantain');
    expect(response.message.content).toMatch(/Sigatoka|waterlogging|yellow/i);
    expect(response.suggestedFollowUps?.length).toBeGreaterThan(0);
  });

  it('narrows to Sigatoka when yellow spots are reported first', () => {
    const response = generateFarmAdvisoryResponse([
      userMessage('My plantain leaves are turning black'),
      userMessage('Yellow spots appeared before the leaves turned black'),
    ]);

    expect(response.message.content).toMatch(/Sigatoka/i);
    expect(response.urgency).toBeDefined();
  });

  it('suggests waterlogging advice when soil is wet', () => {
    const response = generateFarmAdvisoryResponse([
      userMessage('Plantain leaves turning black'),
      userMessage('The soil has been very wet after recent rains'),
    ]);

    expect(response.message.content).toMatch(/waterlogging|drainage|wet/i);
  });

  it('provides starter prompts for general questions', () => {
    const response = generateFarmAdvisoryResponse([
      userMessage('I need help with my farm'),
    ]);

    expect(response.suggestedFollowUps?.some((item) => item.includes('plantain'))).toBe(true);
  });
});
