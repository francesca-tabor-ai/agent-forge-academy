/**
 * Unit tests for /api/jobs query parameter validation
 */

import { describe, it, expect } from 'vitest';

// Mock the validation function logic
function validateQueryParams(searchParams: URLSearchParams): {
  status?: string[];
  matchMin?: number;
  matchMax?: number;
  skills?: string[];
  sort?: string;
  search?: string;
  errors: string[];
} {
  const errors: string[] = [];
  const VALID_STATUSES = ['new', 'recommended', 'unlocked', 'locked', 'stretch'];
  const VALID_SORT_OPTIONS = ['best-match', 'newest', 'least-missing', 'company-az'];

  // Validate status
  let status: string[] | undefined;
  const statusParam = searchParams.get('status');
  if (statusParam) {
    const statusList = statusParam.split(',').map(s => s.trim()).filter(Boolean);
    const invalidStatuses = statusList.filter(s => !VALID_STATUSES.includes(s));
    if (invalidStatuses.length > 0) {
      errors.push(`Invalid status values: ${invalidStatuses.join(', ')}`);
    } else {
      status = statusList;
    }
  }

  // Validate match range
  let matchMin: number | undefined;
  let matchMax: number | undefined;
  const matchMinParam = searchParams.get('matchMin');
  const matchMaxParam = searchParams.get('matchMax');
  if (matchMinParam) {
    const min = parseInt(matchMinParam, 10);
    if (isNaN(min) || min < 0 || min > 100) {
      errors.push('matchMin must be an integer between 0 and 100');
    } else {
      matchMin = min;
    }
  }
  if (matchMaxParam) {
    const max = parseInt(matchMaxParam, 10);
    if (isNaN(max) || max < 0 || max > 100) {
      errors.push('matchMax must be an integer between 0 and 100');
    } else {
      matchMax = max;
    }
  }
  if (matchMin !== undefined && matchMax !== undefined && matchMin > matchMax) {
    errors.push('matchMin must be less than or equal to matchMax');
  }

  // Validate skills (max 10)
  let skills: string[] | undefined;
  const skillsParam = searchParams.get('skills');
  if (skillsParam) {
    const skillsList = skillsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (skillsList.length > 10) {
      errors.push('Maximum 10 skills allowed in filter');
    } else {
      const invalidSkills = skillsList.filter(s => s.length > 50);
      if (invalidSkills.length > 0) {
        errors.push('Skills must be 50 characters or less');
      } else {
        skills = skillsList;
      }
    }
  }

  // Validate sort
  let sort: string | undefined;
  const sortParam = searchParams.get('sort');
  if (sortParam) {
    if (!VALID_SORT_OPTIONS.includes(sortParam)) {
      errors.push(`Invalid sort option: ${sortParam}`);
    } else {
      sort = sortParam;
    }
  }

  // Validate search (max 80 chars)
  let search: string | undefined;
  const searchParam = searchParams.get('search');
  if (searchParam) {
    if (searchParam.length > 80) {
      errors.push('Search query must be 80 characters or less');
    } else {
      search = searchParam.trim();
    }
  }

  return { status, matchMin, matchMax, skills, sort, search, errors };
}

describe('API /api/jobs query parameter validation', () => {
  it('should accept valid query parameters', () => {
    const params = new URLSearchParams({
      status: 'recommended,unlocked',
      matchMin: '60',
      matchMax: '100',
      sort: 'best-match',
      search: 'engineer',
    });
    const result = validateQueryParams(params);
    expect(result.errors).toHaveLength(0);
    expect(result.status).toEqual(['recommended', 'unlocked']);
    expect(result.matchMin).toBe(60);
    expect(result.matchMax).toBe(100);
    expect(result.sort).toBe('best-match');
    expect(result.search).toBe('engineer');
  });

  it('should reject invalid status values', () => {
    const params = new URLSearchParams({
      status: 'invalid,recommended',
    });
    const result = validateQueryParams(params);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Invalid status values');
  });

  it('should reject matchMin > 100', () => {
    const params = new URLSearchParams({
      matchMin: '101',
    });
    const result = validateQueryParams(params);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('matchMin must be an integer between 0 and 100');
  });

  it('should reject matchMin > matchMax', () => {
    const params = new URLSearchParams({
      matchMin: '80',
      matchMax: '60',
    });
    const result = validateQueryParams(params);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('matchMin must be less than or equal to matchMax');
  });

  it('should reject more than 10 skills', () => {
    const params = new URLSearchParams({
      skills: Array.from({ length: 11 }, (_, i) => `skill${i}`).join(','),
    });
    const result = validateQueryParams(params);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Maximum 10 skills allowed');
  });

  it('should reject skills longer than 50 characters', () => {
    const params = new URLSearchParams({
      skills: 'a'.repeat(51),
    });
    const result = validateQueryParams(params);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Skills must be 50 characters or less');
  });

  it('should reject invalid sort option', () => {
    const params = new URLSearchParams({
      sort: 'invalid-sort',
    });
    const result = validateQueryParams(params);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Invalid sort option');
  });

  it('should reject search query longer than 80 characters', () => {
    const params = new URLSearchParams({
      search: 'a'.repeat(81),
    });
    const result = validateQueryParams(params);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Search query must be 80 characters or less');
  });

  it('should handle empty query parameters', () => {
    const params = new URLSearchParams({});
    const result = validateQueryParams(params);
    expect(result.errors).toHaveLength(0);
    expect(result.status).toBeUndefined();
    expect(result.matchMin).toBeUndefined();
    expect(result.matchMax).toBeUndefined();
  });
});
