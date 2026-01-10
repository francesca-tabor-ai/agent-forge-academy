// Course metadata for dashboard course cards
export interface CourseMetadata {
  slug: string;
  title: string;
  category: string;
  outcome: string;
  build: string;
  bestFor: string;
  time: string;
}

export const courseMetadata: Record<string, CourseMetadata> = {
  'ai-native-software-delivery-pipelines': {
    slug: 'ai-native-software-delivery-pipelines',
    title: 'AI-Native Software Delivery Pipelines',
    category: 'Vibe Engineering',
    outcome: 'Ship AI features safely, repeatedly, and measurably.',
    build: 'A CI/CD pipeline with eval gates, prompt/version control, model routing, and rollout strategy.',
    bestFor: 'Engineers and tech leads owning reliability and release velocity.',
    time: '~4–6 hours',
  },
  'spec-driven-development': {
    slug: 'spec-driven-development',
    title: 'Spec Driven Development',
    category: 'Vibe Engineering',
    outcome: 'Turn vague ideas into executable specs that agents and humans can deliver.',
    build: 'A spec template + workflow (requirements → acceptance tests → tasks → implementation).',
    bestFor: 'PMs, engineers, founders who want fewer misunderstandings and faster iteration.',
    time: '~3–5 hours',
  },
  'vibe-coding-cursor-supabase': {
    slug: 'vibe-coding-cursor-supabase',
    title: 'Vibe Coding with Cursor & Supabase',
    category: 'Vibe Engineering',
    outcome: 'Build full-stack apps fast without losing structure.',
    build: 'A Supabase-backed app (auth, DB, storage, edge functions) using Cursor for iterative coding.',
    bestFor: 'Builders shipping MVPs and internal tools.',
    time: '~4–8 hours',
  },
  'prompt-engineering': {
    slug: 'prompt-engineering',
    title: 'Prompt Engineering',
    category: 'Agentic Systems',
    outcome: 'Write prompts that are reliable, testable, and reusable.',
    build: 'A prompt library with patterns (role/task/context/output), test cases, and failure-mode checks.',
    bestFor: 'Anyone shipping LLM features into production.',
    time: '~2–4 hours',
  },
  'agentic-rag': {
    slug: 'agentic-rag',
    title: 'Mastering Agentic RAG for Enterprise AI',
    category: 'Agentic Systems',
    outcome: 'Build self-correcting, adaptive agentic RAG systems that achieve 94.8% accuracy and strategic enterprise impact.',
    build: 'Complete agentic RAG system with CRAG, Adaptive RAG, Graph-based RAG, specialized frameworks, evaluation metrics, security, and production deployment.',
    bestFor: 'AI engineers, ML engineers, and teams building enterprise knowledge assistants with autonomous reasoning capabilities.',
    time: '~7 weeks',
  },
  'amazon-rufus-optimisation': {
    slug: 'amazon-rufus-optimisation',
    title: 'Amazon Rufus Optimisation',
    category: 'AI Search & Viability',
    outcome: "Make your listings win in Amazon's AI shopping experiences.",
    build: 'A listing optimisation checklist + experimentation loop (titles, bullets, A+ content, Q&A signals).',
    bestFor: 'E-commerce operators and growth teams on Amazon.',
    time: '~2–4 hours',
  },
  'reddit-ai-visibility': {
    slug: 'reddit-ai-visibility',
    title: 'Reddit AI Visibility',
    category: 'AI Search & Viability',
    outcome: 'Earn visibility in AI-driven discovery where authenticity matters.',
    build: 'A playbook for community-first visibility (topic mapping, contribution cadence, measurement).',
    bestFor: 'Founders and marketers targeting niche audiences.',
    time: '~2–4 hours',
  },
  'seo-to-aeo': {
    slug: 'seo-to-aeo',
    title: 'SEO → AEO (Search to Answer Engine Optimisation)',
    category: 'AI Search & Viability',
    outcome: 'Rank for answers, not just clicks.',
    build: 'Content and structure patterns that improve citation/answer pickup (schema, Q&A blocks, entity coverage).',
    bestFor: 'Content, SEO, and product marketing teams.',
    time: '~3–6 hours',
  },
  'hyper-personalised-marketing-advertising': {
    slug: 'hyper-personalised-marketing-advertising',
    title: 'Hyper-Personalised Marketing & Advertising',
    category: 'AI Search & Viability',
    outcome: 'Personalise responsibly without creepy or chaotic automation.',
    build: 'A segmentation + message matrix, plus guardrails for frequency, consent, and performance.',
    bestFor: 'Performance marketers and lifecycle teams.',
    time: '~3–6 hours',
  },
  'ai-visibility': {
    slug: 'ai-visibility',
    title: 'Mastering the AI Visibility Playbook',
    category: 'AI Search & Viability',
    outcome: 'Transform from traditional SEO to AI visibility architecture and achieve 40%+ visibility increases in AI Overviews.',
    build: 'Complete AI visibility system with llms.txt, structured data, content engineering (Inverted Pyramid 2.0), entity authority, and hallucination defense.',
    bestFor: 'SEO specialists, content marketers, and technical SEOs transitioning to AI visibility optimization.',
    time: '~6–8 weeks',
  },
  'llm-first-websites': {
    slug: 'llm-first-websites',
    title: 'Engineering for Machine Judgment (RX)',
    category: 'AI Search & Viability',
    outcome: 'Build LLM-first websites optimized for AI intermediaries that achieve higher visibility and citation recognition.',
    build: 'Complete RX system with ontology/taxonomy, intent-driven APIs, safety boundaries, observability, and governance frameworks.',
    bestFor: 'Web developers, product managers, and data architects building machine-first experiences.',
    time: '~6–7 weeks',
  },
  'agentic-commerce': {
    slug: 'agentic-commerce',
    title: 'Mastering the Agentic Economy',
    category: 'Shopping & E-Commerce',
    outcome: 'Master the agentic economy from foundations to implementation, including trust-building, technical protocols, marketing strategy, and governance.',
    build: 'Complete agentic commerce implementation with ACP protocols, AEO optimization, trust frameworks, organizational design, compliance, and bias auditing.',
    bestFor: 'E-commerce leaders, product managers, marketing directors, CAOs, and strategists building agent-mediated commerce experiences.',
    time: '~7–8 weeks',
  },
  'conversational-commerce-intelligence': {
    slug: 'conversational-commerce-intelligence',
    title: 'Conversational Commerce Intelligence Systems',
    category: 'Shopping & E-Commerce',
    outcome: 'Turn conversations into revenue intelligence.',
    build: 'An insight pipeline (intent → objections → product gaps → next best action → reporting).',
    bestFor: 'Sales, CX, and product teams.',
    time: '~4–8 hours',
  },
  'ai-recommender-systems': {
    slug: 'ai-recommender-systems',
    title: 'AI Recommender Systems',
    category: 'Shopping & E-Commerce',
    outcome: 'Improve conversion with explainable recommendations.',
    build: 'A recommender blueprint (signals, ranking, exploration, evaluation, cold start handling).',
    bestFor: 'Product, data, and growth teams.',
    time: '~6–12 hours',
  },
  '3d-for-ecommerce': {
    slug: '3d-for-ecommerce',
    title: 'Mastering 3D Commerce and Cinematic Capitalism',
    category: 'Shopping & E-Commerce',
    outcome: 'Build production-ready 3D commerce platforms that drive 2x conversion and 9% sales lift.',
    build: 'Full-stack 3D commerce platform with MERN stack, Three.js, Amazon SP-API integration, video shopping infrastructure, and enterprise scaling.',
    bestFor: 'E-commerce developers, platform architects, Amazon sellers, and product managers building immersive commerce experiences.',
    time: '~6–8 weeks',
  },
  'ai-driven-video-synthetic-media': {
    slug: 'ai-driven-video-synthetic-media',
    title: 'AI-Driven Video & Synthetic Media',
    category: 'Media & Content Ops',
    outcome: 'Produce scalable video while keeping brand and ethics intact.',
    build: 'A production pipeline (script → storyboard → generation → edit → QC → distribution).',
    bestFor: 'Content teams and marketers.',
    time: '~3–6 hours',
  },
  'ai-content-pipelines': {
    slug: 'ai-content-pipelines',
    title: 'AI-Content Pipelines',
    category: 'Media & Content Ops',
    outcome: 'Scale content production with consistency, governance, and measurement.',
    build: 'An end-to-end pipeline (brief → research → draft → review → publish → refresh) with QA gates and attribution.',
    bestFor: 'Teams producing content weekly at volume.',
    time: '~4–10 hours',
  },
  'ai-governance-eu-ai-act': {
    slug: 'ai-governance-eu-ai-act',
    title: 'AI Governance & the EU AI Act',
    category: 'Trust & Regulation',
    outcome: 'Ship compliant AI systems with real operational controls.',
    build: 'A governance checklist (risk classification, documentation, human oversight, monitoring, incident response).',
    bestFor: 'Operators, compliance, product leaders in the EU orbit.',
    time: '~3–6 hours',
  },
  'multi-agent-systems': {
    slug: 'multi-agent-systems',
    title: 'Multi-Agent Systems',
    category: 'Agentic Systems',
    outcome: 'Deploy multi-agent AI systems at scale with production-grade infrastructure.',
    build: 'Complete multi-agent system with LangGraph, CrewAI, AutoGen, Kubernetes deployment, security, and monitoring.',
    bestFor: 'Engineers and architects building scalable agent systems.',
    time: '~12 weeks',
  },
};

// Get category groups for organizing courses
export function getCategoryGroups(): Record<string, CourseMetadata[]> {
  const groups: Record<string, CourseMetadata[]> = {};
  
  Object.values(courseMetadata).forEach((course) => {
    if (!groups[course.category]) {
      groups[course.category] = [];
    }
    groups[course.category].push(course);
  });
  
  return groups;
}
