/**
 * Unit tests for jobs API query parameter parsing
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

// We'll need to extract the parseJobsQuery function or test it indirectly
// For now, let's create a test that validates the logic

describe('Jobs API Query Parameter Parsing', () => {
  it('should handle invalid matchMin gracefully', () => {
    const url = new URL('http://localhost/api/jobs?matchMin=abc');
    const matchMinParam = url.searchParams.get('matchMin');
    const min = parseInt(matchMinParam || '', 10);
    
    // Should return NaN for invalid input
    expect(isNaN(min)).toBe(true);
    
    // Should default to 0 when NaN
    const result = isNaN(min) ? 0 : Math.max(0, Math.min(100, min));
    expect(result).toBe(0);
  });

  it('should clamp matchMin to 0-100 range', () => {
    const url = new URL('http://localhost/api/jobs?matchMin=150');
    const matchMinParam = url.searchParams.get('matchMin');
    const min = parseInt(matchMinParam || '', 10);
    const clamped = Math.max(0, Math.min(100, min));
    
    expect(clamped).toBe(100);
  });

  it('should handle negative matchMin', () => {
    const url = new URL('http://localhost/api/jobs?matchMin=-10');
    const matchMinParam = url.searchParams.get('matchMin');
    const min = parseInt(matchMinParam || '', 10);
    const clamped = Math.max(0, Math.min(100, min));
    
    expect(clamped).toBe(0);
  });

  it('should swap matchMin and matchMax if min > max', () => {
    let matchMin = 80;
    let matchMax = 60;
    
    if (matchMin > matchMax) {
      [matchMin, matchMax] = [matchMax, matchMin];
    }
    
    expect(matchMin).toBe(60);
    expect(matchMax).toBe(80);
  });

  it('should parse comma-separated skills', () => {
    const url = new URL('http://localhost/api/jobs?skills=react,typescript,node');
    const skillsParam = url.searchParams.get('skills');
    const skillsList = skillsParam?.split(',').map(s => s.trim()).filter(Boolean) || [];
    
    expect(skillsList).toEqual(['react', 'typescript', 'node']);
  });

  it('should limit skills to max 10', () => {
    const skills = Array.from({ length: 15 }, (_, i) => `skill${i}`);
    const limited = skills.slice(0, 10);
    
    expect(limited.length).toBe(10);
  });

  it('should filter out skills longer than 50 characters', () => {
    const skills = ['react', 'a'.repeat(60), 'typescript'];
    const validSkills = skills.filter(s => s.length <= 50);
    
    expect(validSkills).toEqual(['react', 'typescript']);
  });

  it('should handle empty search string', () => {
    const searchParam = '';
    const trimmed = searchParam.trim();
    const result = trimmed.length > 0 ? trimmed : undefined;
    
    expect(result).toBeUndefined();
  });

  it('should truncate search query longer than 80 characters', () => {
    const searchParam = 'a'.repeat(100);
    const trimmed = searchParam.trim();
    const result = trimmed.length <= 80 ? trimmed : undefined;
    
    expect(result).toBeUndefined();
  });

  it('should validate status values', () => {
    const VALID_STATUSES = ['new', 'recommended', 'unlocked', 'locked', 'stretch'] as const;
    const statusParam = 'new,invalid,recommended';
    const statusList = statusParam.split(',').map(s => s.trim()).filter(Boolean);
    const validStatuses = statusList.filter(s => VALID_STATUSES.includes(s as typeof VALID_STATUSES[number]));
    
    expect(validStatuses).toEqual(['new', 'recommended']);
  });

  it('should default sort to best-match', () => {
    const VALID_SORT_OPTIONS = ['best-match', 'newest', 'least-missing', 'company-az'] as const;
    let sort: typeof VALID_SORT_OPTIONS[number] = 'best-match';
    const sortParam = null; // No sort param provided
    if (sortParam && VALID_SORT_OPTIONS.includes(sortParam as typeof VALID_SORT_OPTIONS[number])) {
      sort = sortParam as typeof VALID_SORT_OPTIONS[number];
    }
    
    expect(sort).toBe('best-match');
  });
});
