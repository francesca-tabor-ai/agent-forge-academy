/**
 * Skill Extraction from CV Text
 * 
 * Extracts normalized skills from CV text using keyword matching and alias mapping.
 * Skills are normalized to canonical names for consistent matching.
 */

/**
 * Skill alias map: maps common variations to canonical skill names
 * This helps normalize skills like "JS" -> "javascript", "React.js" -> "react", etc.
 */
const SKILL_ALIAS_MAP: Record<string, string> = {
  // JavaScript variations
  'js': 'javascript',
  'javascript': 'javascript',
  'ecmascript': 'javascript',
  'es6': 'javascript',
  'es2015': 'javascript',
  'es2016': 'javascript',
  'es2017': 'javascript',
  'es2018': 'javascript',
  'es2019': 'javascript',
  'es2020': 'javascript',
  'es2021': 'javascript',
  'es2022': 'javascript',
  'es2023': 'javascript',
  'es2024': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  
  // Frontend frameworks
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'vue': 'vue',
  'vue.js': 'vue',
  'vuejs': 'vue',
  'angular': 'angular',
  'angular.js': 'angular',
  'angularjs': 'angular',
  'svelte': 'svelte',
  'next.js': 'nextjs',
  'nextjs': 'nextjs',
  'nuxt': 'nuxt',
  'nuxt.js': 'nuxt',
  'gatsby': 'gatsby',
  
  // Backend frameworks
  'node': 'nodejs',
  'node.js': 'nodejs',
  'nodejs': 'nodejs',
  'express': 'express',
  'express.js': 'express',
  'nest': 'nestjs',
  'nestjs': 'nestjs',
  'fastify': 'fastify',
  'koa': 'koa',
  'django': 'django',
  'flask': 'flask',
  'fastapi': 'fastapi',
  'spring': 'spring',
  'spring boot': 'spring',
  'springboot': 'spring',
  'laravel': 'laravel',
  'symfony': 'symfony',
  'rails': 'ruby on rails',
  'ruby on rails': 'ruby on rails',
  'asp.net': 'asp.net',
  'aspnet': 'asp.net',
  
  // Languages
  'python': 'python',
  'py': 'python',
  'java': 'java',
  'c++': 'c++',
  'cpp': 'c++',
  'c#': 'c#',
  'csharp': 'c#',
  'go': 'go',
  'golang': 'go',
  'rust': 'rust',
  'php': 'php',
  'ruby': 'ruby',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'scala': 'scala',
  'r': 'r',
  'matlab': 'matlab',
  
  // Databases
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  'mysql': 'mysql',
  'mariadb': 'mariadb',
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  'redis': 'redis',
  'sqlite': 'sqlite',
  'oracle': 'oracle',
  'sql server': 'sql server',
  'mssql': 'sql server',
  'cassandra': 'cassandra',
  'dynamodb': 'dynamodb',
  'elasticsearch': 'elasticsearch',
  'elastic': 'elasticsearch',
  
  // Cloud & DevOps
  'aws': 'aws',
  'amazon web services': 'aws',
  'azure': 'azure',
  'microsoft azure': 'azure',
  'gcp': 'gcp',
  'google cloud': 'gcp',
  'google cloud platform': 'gcp',
  'docker': 'docker',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'terraform': 'terraform',
  'ansible': 'ansible',
  'jenkins': 'jenkins',
  'ci/cd': 'ci/cd',
  'cicd': 'ci/cd',
  'github actions': 'github actions',
  'gitlab ci': 'gitlab ci',
  'circleci': 'circleci',
  'travis ci': 'travis ci',
  
  // Tools & Libraries
  'git': 'git',
  'github': 'git',
  'gitlab': 'git',
  'webpack': 'webpack',
  'vite': 'vite',
  'rollup': 'rollup',
  'babel': 'babel',
  'eslint': 'eslint',
  'prettier': 'prettier',
  'jest': 'jest',
  'mocha': 'mocha',
  'cypress': 'cypress',
  'playwright': 'playwright',
  'selenium': 'selenium',
  
  // CSS & Styling
  'css': 'css',
  'scss': 'scss',
  'sass': 'scss',
  'less': 'less',
  'tailwind': 'tailwind css',
  'tailwindcss': 'tailwind css',
  'tailwind css': 'tailwind css',
  'bootstrap': 'bootstrap',
  'material-ui': 'material-ui',
  'mui': 'material-ui',
  'styled-components': 'styled-components',
  
  // AI/ML
  'machine learning': 'machine learning',
  'ml': 'machine learning',
  'deep learning': 'deep learning',
  'dl': 'deep learning',
  'artificial intelligence': 'artificial intelligence',
  'ai': 'artificial intelligence',
  'tensorflow': 'tensorflow',
  'pytorch': 'pytorch',
  'keras': 'keras',
  'scikit-learn': 'scikit-learn',
  'sklearn': 'scikit-learn',
  'pandas': 'pandas',
  'numpy': 'numpy',
  'opencv': 'opencv',
  'nlp': 'natural language processing',
  'natural language processing': 'natural language processing',
  
  // Mobile
  'react native': 'react native',
  'reactnative': 'react native',
  'flutter': 'flutter',
  'ionic': 'ionic',
  'xamarin': 'xamarin',
  
  // Other
  'graphql': 'graphql',
  'rest': 'rest api',
  'rest api': 'rest api',
  'microservices': 'microservices',
  'serverless': 'serverless',
  'lambda': 'aws lambda',
  'aws lambda': 'aws lambda',
};

/**
 * Normalize skill name to canonical form
 */
export function normalizeSkill(skill: string): string {
  const normalized = skill
    .toLowerCase()
    .trim()
    .replace(/[^\w\s+#.-]/g, '') // Remove special chars except common ones
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Check alias map
  if (SKILL_ALIAS_MAP[normalized]) {
    return SKILL_ALIAS_MAP[normalized];
  }

  return normalized;
}

/**
 * Extract skills from CV text using keyword matching
 * 
 * @param cvText - The CV text to extract skills from
 * @returns Array of normalized skill names
 */
export function extractSkillsFromCv(cvText: string): string[] {
  if (!cvText || cvText.length === 0) {
    return [];
  }

  const extractedSkills = new Set<string>();
  const lowerText = cvText.toLowerCase();

  // Get all canonical skill names and their aliases
  const allSkills = new Set<string>();
  Object.entries(SKILL_ALIAS_MAP).forEach(([alias, canonical]) => {
    allSkills.add(canonical);
  });

  // Also include the aliases themselves for matching
  const allAliases = Object.keys(SKILL_ALIAS_MAP);

  // Match skills in text (case-insensitive)
  // Look for whole word matches to avoid false positives
  const words = lowerText.split(/\s+/);
  const textChunks = [
    ...words, // Individual words
    ...words.map((w, i) => i < words.length - 1 ? `${w} ${words[i + 1]}` : '').filter(Boolean), // Bigrams
    ...words.map((w, i) => i < words.length - 2 ? `${w} ${words[i + 1]} ${words[i + 2]}` : '').filter(Boolean), // Trigrams
  ];

  // Check for exact matches and variations
  for (const chunk of textChunks) {
    const normalized = normalizeSkill(chunk);
    if (normalized && normalized.length > 1) {
      // Check if it's a known skill or alias
      if (SKILL_ALIAS_MAP[normalized]) {
        extractedSkills.add(SKILL_ALIAS_MAP[normalized]);
      } else if (allSkills.has(normalized)) {
        extractedSkills.add(normalized);
      }
    }
  }

  // Also check for common skill patterns in text
  // Look for skill mentions in context (e.g., "experienced with React", "proficient in Python")
  const skillPatterns = [
    /(?:proficient|experienced|skilled|expert|familiar|knowledgeable)\s+(?:in|with|at)\s+([a-z\s+#.-]+)/gi,
    /(?:technologies?|skills?|tools?|frameworks?|languages?)[\s:]+([a-z\s+#.,-]+)/gi,
    /(?:using|utilizing|working with)\s+([a-z\s+#.,-]+)/gi,
  ];

  for (const pattern of skillPatterns) {
    const matches = cvText.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const skills = match[1]
          .split(/[,;|&]/)
          .map(s => normalizeSkill(s.trim()))
          .filter(s => s.length > 1);
        
        skills.forEach(skill => {
          if (SKILL_ALIAS_MAP[skill] || allSkills.has(skill)) {
            extractedSkills.add(SKILL_ALIAS_MAP[skill] || skill);
          }
        });
      }
    }
  }

  return Array.from(extractedSkills).sort();
}

/**
 * Check if a skill from CV is confirmed by portfolio or course evidence
 * 
 * @param cvSkill - Skill extracted from CV
 * @param portfolioSkills - Skills from portfolio projects
 * @param courseSkills - Skills from enrolled/completed courses (optional)
 * @returns true if skill is confirmed by evidence
 */
export function isSkillConfirmed(
  cvSkill: string,
  portfolioSkills: string[],
  courseSkills: string[] = []
): boolean {
  const normalizedCvSkill = normalizeSkill(cvSkill);
  const normalizedPortfolioSkills = portfolioSkills.map(normalizeSkill);
  const normalizedCourseSkills = courseSkills.map(normalizeSkill);

  // Check if skill appears in portfolio
  if (normalizedPortfolioSkills.includes(normalizedCvSkill)) {
    return true;
  }

  // Check if skill appears in courses
  if (normalizedCourseSkills.includes(normalizedCvSkill)) {
    return true;
  }

  return false;
}

/**
 * Filter CV-extracted skills to only include those confirmed by evidence
 * 
 * @param cvSkills - Skills extracted from CV
 * @param portfolioSkills - Skills from portfolio projects
 * @param courseSkills - Skills from enrolled/completed courses (optional)
 * @returns Array of confirmed skills
 */
export function getConfirmedCvSkills(
  cvSkills: string[],
  portfolioSkills: string[],
  courseSkills: string[] = []
): string[] {
  return cvSkills.filter(skill =>
    isSkillConfirmed(skill, portfolioSkills, courseSkills)
  );
}
