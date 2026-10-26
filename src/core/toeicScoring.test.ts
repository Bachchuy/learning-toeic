import { describe, it, expect } from 'vitest';
import { calculateListeningScore, calculateReadingScore, calculateTotalScore } from './toeicScoring';

describe('TOEIC Standard Scoring', () => {
  it('converts minimum raw scores to 5', () => {
    expect(calculateListeningScore(0)).toBe(5);
    expect(calculateReadingScore(0)).toBe(5);
    const { totalScore } = calculateTotalScore(0, 0);
    expect(totalScore).toBe(10);
  });

  it('converts maximum raw scores to 495 and 990', () => {
    expect(calculateListeningScore(100)).toBe(495);
    expect(calculateReadingScore(100)).toBe(495);
    const { totalScore } = calculateTotalScore(100, 100);
    expect(totalScore).toBe(990);
  });

  it('calculates mid-tier scores accurately', () => {
    // 70 listening correct ~ 380
    expect(calculateListeningScore(70)).toBe(380);
    // 70 reading correct ~ 335
    expect(calculateReadingScore(70)).toBe(335);
    const result = calculateTotalScore(70, 70);
    expect(result.totalScore).toBe(715);
  });

  it('handles out of bounds raw inputs gracefully', () => {
    expect(calculateListeningScore(-10)).toBe(5);
    expect(calculateListeningScore(150)).toBe(495);
    expect(calculateReadingScore(-5)).toBe(5);
    expect(calculateReadingScore(200)).toBe(495);
  });
});
