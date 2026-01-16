/**
 * Clinical AI Sandbox - Mock Document Set
 * 
 * Curated set of simulated clinical documents for RAG testing.
 * These are public-domain style documents for demonstration purposes.
 */

import type { RagDocMetadata } from './types';

/**
 * Document structure with full content
 */
export interface ClinicalDocument {
  id: string;
  title: string;
  version: string;
  updated_at: Date;
  tags: string[];
  excerpt: string;
  body: string;
}

/**
 * Mock curated document set - 12 clinical documents
 */
export const CLINICAL_DOCUMENTS: ClinicalDocument[] = [
  {
    id: 'doc-001',
    title: 'Hypertension Management Guidelines',
    version: '2.1',
    updated_at: new Date('2024-01-15'),
    tags: ['cardiovascular', 'hypertension', 'treatment', 'guidelines'],
    excerpt: 'Evidence-based guidelines for managing high blood pressure in adults, including lifestyle modifications and medication considerations.',
    body: 'Hypertension, or high blood pressure, affects millions of adults worldwide. Management typically involves lifestyle modifications such as dietary changes, regular exercise, and stress reduction. When lifestyle changes are insufficient, medication may be considered. Common classes include ACE inhibitors, ARBs, diuretics, and calcium channel blockers. Regular monitoring and follow-up with healthcare providers are essential for effective management.',
  },
  {
    id: 'doc-002',
    title: 'Diabetes Type 2 Overview',
    version: '1.8',
    updated_at: new Date('2024-02-20'),
    tags: ['diabetes', 'metabolic', 'chronic-disease', 'education'],
    excerpt: 'Comprehensive overview of Type 2 diabetes, including pathophysiology, risk factors, and general management principles.',
    body: 'Type 2 diabetes is a chronic metabolic condition characterized by insulin resistance and relative insulin deficiency. Risk factors include family history, obesity, sedentary lifestyle, and age. Management focuses on blood glucose control through diet, exercise, oral medications, and sometimes insulin. Regular monitoring of blood glucose levels and HbA1c is important. Complications can affect the eyes, kidneys, nerves, and cardiovascular system if not well managed.',
  },
  {
    id: 'doc-003',
    title: 'Common Cold and Upper Respiratory Infections',
    version: '1.5',
    updated_at: new Date('2024-03-10'),
    tags: ['respiratory', 'infectious-disease', 'symptoms', 'self-care'],
    excerpt: 'Information about common cold symptoms, duration, and general self-care recommendations.',
    body: 'The common cold is a viral infection affecting the upper respiratory tract. Symptoms typically include runny nose, congestion, sneezing, sore throat, and mild cough. Most colds resolve within 7-10 days without specific treatment. Self-care measures include rest, hydration, and over-the-counter symptom relief medications. Antibiotics are not effective against viral infections. Seek medical attention if symptoms worsen or persist beyond two weeks.',
  },
  {
    id: 'doc-004',
    title: 'Asthma Action Plan Basics',
    version: '2.0',
    updated_at: new Date('2024-01-30'),
    tags: ['respiratory', 'asthma', 'chronic-disease', 'management'],
    excerpt: 'Fundamental information about asthma management, including trigger identification and medication categories.',
    body: 'Asthma is a chronic respiratory condition characterized by airway inflammation and bronchoconstriction. Common triggers include allergens, exercise, cold air, and respiratory infections. Management involves both controller medications (taken regularly) and rescue medications (for acute symptoms). An asthma action plan helps individuals recognize worsening symptoms and know when to seek medical care. Regular follow-up with healthcare providers is important for optimal control.',
  },
  {
    id: 'doc-005',
    title: 'Headache Types and When to Seek Care',
    version: '1.3',
    updated_at: new Date('2024-02-15'),
    tags: ['neurological', 'symptoms', 'headache', 'education'],
    excerpt: 'Educational information about different types of headaches and guidance on when professional evaluation is recommended.',
    body: 'Headaches are common and can be classified into primary (migraine, tension-type) and secondary (caused by underlying conditions). Most headaches are benign and can be managed with rest, hydration, and over-the-counter pain relievers. However, certain "red flag" symptoms warrant immediate medical attention: sudden severe headache, headache with fever or neck stiffness, headache after head injury, or headache with neurological symptoms. Chronic or severe headaches should be evaluated by a healthcare provider.',
  },
  {
    id: 'doc-006',
    title: 'Medication Safety and Adherence',
    version: '1.9',
    updated_at: new Date('2024-03-05'),
    tags: ['medication', 'safety', 'education', 'adherence'],
    excerpt: 'General principles of medication safety, including proper storage, timing, and the importance of adherence.',
    body: 'Medication safety involves multiple factors: taking medications as prescribed, understanding potential side effects, proper storage, and awareness of drug interactions. It is important to inform healthcare providers about all medications, including over-the-counter drugs and supplements. Medication adherence is crucial for effectiveness, especially for chronic conditions. Pill organizers and medication reminders can help. Never share medications or take medications prescribed for others.',
  },
  {
    id: 'doc-007',
    title: 'Nutrition Basics for Heart Health',
    version: '1.6',
    updated_at: new Date('2024-02-28'),
    tags: ['nutrition', 'cardiovascular', 'prevention', 'lifestyle'],
    excerpt: 'General dietary recommendations for cardiovascular health, including food groups and portion guidance.',
    body: 'A heart-healthy diet emphasizes fruits, vegetables, whole grains, lean proteins, and healthy fats. Limiting sodium, saturated fats, and added sugars is recommended. The Mediterranean and DASH diets are examples of heart-healthy eating patterns. Portion control and regular meal timing can also support cardiovascular health. Individual dietary needs vary, and consultation with a registered dietitian can provide personalized guidance.',
  },
  {
    id: 'doc-008',
    title: 'Exercise and Physical Activity Guidelines',
    version: '2.2',
    updated_at: new Date('2024-01-25'),
    tags: ['exercise', 'prevention', 'lifestyle', 'fitness'],
    excerpt: 'General recommendations for physical activity and exercise for adults, including frequency and intensity.',
    body: 'Regular physical activity provides numerous health benefits including improved cardiovascular health, weight management, and mental well-being. Adults are generally recommended to engage in at least 150 minutes of moderate-intensity or 75 minutes of vigorous-intensity aerobic activity per week, plus muscle-strengthening activities. Activities should be appropriate for individual fitness levels and health conditions. Starting slowly and gradually increasing intensity is important, especially for those new to exercise.',
  },
  {
    id: 'doc-009',
    title: 'Sleep Hygiene and Sleep Disorders',
    version: '1.4',
    updated_at: new Date('2024-03-12'),
    tags: ['sleep', 'lifestyle', 'wellness', 'education'],
    excerpt: 'Information about healthy sleep practices and when sleep problems may require professional evaluation.',
    body: 'Good sleep hygiene includes maintaining a regular sleep schedule, creating a comfortable sleep environment, limiting screen time before bed, and avoiding caffeine and large meals close to bedtime. Most adults need 7-9 hours of sleep per night. Sleep disorders such as insomnia, sleep apnea, or restless leg syndrome may require medical evaluation. Chronic sleep problems can affect physical and mental health and should be discussed with a healthcare provider.',
  },
  {
    id: 'doc-010',
    title: 'Stress Management Techniques',
    version: '1.7',
    updated_at: new Date('2024-02-10'),
    tags: ['mental-health', 'stress', 'wellness', 'self-care'],
    excerpt: 'General strategies for managing stress, including relaxation techniques and lifestyle approaches.',
    body: 'Stress is a normal part of life, but chronic or excessive stress can impact physical and mental health. Effective stress management techniques include deep breathing exercises, meditation, regular physical activity, adequate sleep, and maintaining social connections. Time management and setting boundaries can also help reduce stress. When stress becomes overwhelming or interferes with daily functioning, professional support from mental health providers may be beneficial.',
  },
  {
    id: 'doc-011',
    title: 'Vaccination Schedule for Adults',
    version: '1.2',
    updated_at: new Date('2024-01-18'),
    tags: ['vaccination', 'prevention', 'immunization', 'public-health'],
    excerpt: 'General information about recommended adult vaccinations and their importance for disease prevention.',
    body: 'Vaccinations are important throughout life, not just childhood. Adult vaccines may include influenza (annual), COVID-19, Tdap (tetanus, diphtheria, pertussis), shingles, pneumococcal, and others based on age, health conditions, and risk factors. Vaccination schedules are updated regularly by public health authorities. Staying up to date with recommended vaccinations helps protect individuals and communities from preventable diseases.',
  },
  {
    id: 'doc-012',
    title: 'When to Seek Emergency Medical Care',
    version: '2.3',
    updated_at: new Date('2024-03-20'),
    tags: ['emergency', 'safety', 'education', 'urgent-care'],
    excerpt: 'Guidance on recognizing symptoms that require immediate medical attention and when to call emergency services.',
    body: 'Certain symptoms require immediate medical attention: chest pain or pressure, difficulty breathing, severe allergic reactions, signs of stroke (sudden weakness, speech problems, facial drooping), severe trauma, loss of consciousness, severe burns, or suspected poisoning. When in doubt about whether a situation is an emergency, it is better to seek immediate care. Emergency services (911 in the US) should be called for life-threatening situations. For non-emergency but urgent concerns, urgent care centers or same-day appointments may be appropriate.',
  },
];

/**
 * Get document metadata (without full body)
 */
export function getDocumentMetadata(doc: ClinicalDocument): RagDocMetadata {
  return {
    title: doc.title,
    version: doc.version,
    updated_at: doc.updated_at,
    excerpt: doc.excerpt,
    tags: doc.tags,
  };
}

/**
 * Get all document metadata
 */
export function getAllDocumentMetadata(): RagDocMetadata[] {
  return CLINICAL_DOCUMENTS.map(getDocumentMetadata);
}

/**
 * Get document by ID
 */
export function getDocumentById(id: string): ClinicalDocument | undefined {
  return CLINICAL_DOCUMENTS.find((doc) => doc.id === id);
}
