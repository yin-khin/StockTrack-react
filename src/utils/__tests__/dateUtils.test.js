// src/utils/__tests__/dateUtils.test.js
import { formatDistanceToNow, formatDate, isToday, isYesterday } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDistanceToNow', () => {
    it('should return "just now" for very recent dates', () => {
      const now = new Date();
      const result = formatDistanceToNow(now);
      expect(result).toBe('just now');
    });

    it('should return "Recently" for invalid dates', () => {
      const result = formatDistanceToNow('invalid-date');
      expect(result).toBe('Recently');
    });

    it('should format minutes correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatDistanceToNow(fiveMinutesAgo);
      expect(result).toBe('5 minutes ago');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatDistanceToNow(twoHoursAgo);
      expect(result).toBe('2 hours ago');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);
      expect(result).toContain('Jan 15, 2024');
    });

    it('should return "Invalid Date" for invalid dates', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date();
      const result = isToday(today);
      expect(result).toBe(true);
    });

    it('should return false for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = isToday(yesterday);
      expect(result).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = isYesterday(yesterday);
      expect(result).toBe(true);
    });

    it('should return false for today\'s date', () => {
      const today = new Date();
      const result = isYesterday(today);
      expect(result).toBe(false);
    });
  });
});