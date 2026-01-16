/**
 * Content Systems Studio - Default Sample Content
 * 
 * Initial sample content items for demonstration and testing.
 */

import type { ContentItem } from './types';

/**
 * Sample Campaign Asset content items
 */
export const sampleCampaignAssets: ContentItem[] = [
  {
    id: 'campaign-1',
    schemaId: 'campaign-asset',
    locale: 'en-US',
    fields: {
      headline: 'Transform Your Business with AI',
      body: 'Discover how artificial intelligence can revolutionize your operations and drive unprecedented growth.',
      disclaimer: 'Results may vary. Terms and conditions apply.',
    },
    status: 'approved',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    createdBy: 'student',
    updatedBy: 'instructor',
  },
  {
    id: 'campaign-2',
    schemaId: 'campaign-asset',
    locale: 'en-GB',
    fields: {
      headline: 'Revolutionise Your Business with AI',
      body: 'Discover how artificial intelligence can transform your operations and drive unprecedented growth.',
      disclaimer: 'Results may vary. Terms and conditions apply.',
    },
    status: 'review',
    createdAt: new Date('2024-01-16T14:30:00Z'),
    updatedAt: new Date('2024-01-16T14:30:00Z'),
    createdBy: 'student',
  },
  {
    id: 'campaign-3',
    schemaId: 'campaign-asset',
    locale: 'es-ES',
    fields: {
      headline: 'Transforma tu Negocio con IA',
      body: 'Descubre cómo la inteligencia artificial puede revolucionar tus operaciones e impulsar un crecimiento sin precedentes.',
      disclaimer: 'Los resultados pueden variar. Se aplican términos y condiciones.',
    },
    status: 'draft',
    createdAt: new Date('2024-01-17T09:15:00Z'),
    updatedAt: new Date('2024-01-17T09:15:00Z'),
    createdBy: 'student',
  },
];

/**
 * Sample Product Label content items
 */
export const sampleProductLabels: ContentItem[] = [
  {
    id: 'product-1',
    schemaId: 'product-label',
    locale: 'en-US',
    fields: {
      headline: 'Organic Protein Bar',
      calories: 250,
      protein: 20,
      carbs: 25,
      fat: 8,
      disclaimer: 'Contains nuts. May contain traces of soy.',
    },
    status: 'approved',
    createdAt: new Date('2024-01-10T08:00:00Z'),
    updatedAt: new Date('2024-01-10T08:00:00Z'),
    createdBy: 'student',
    updatedBy: 'admin',
  },
  {
    id: 'product-2',
    schemaId: 'product-label',
    locale: 'en-GB',
    fields: {
      headline: 'Organic Protein Bar',
      calories: 250,
      protein: 20,
      carbs: 25,
      fat: 8,
      disclaimer: 'Contains nuts. May contain traces of soy.',
    },
    status: 'localised',
    createdAt: new Date('2024-01-11T10:00:00Z'),
    updatedAt: new Date('2024-01-12T15:30:00Z'),
    createdBy: 'student',
    updatedBy: 'instructor',
  },
  {
    id: 'product-3',
    schemaId: 'product-label',
    locale: 'fr-FR',
    fields: {
      headline: 'Barre Protéinée Biologique',
      calories: 250,
      protein: 20,
      carbs: 25,
      fat: 8,
      disclaimer: 'Contient des noix. Peut contenir des traces de soja.',
    },
    status: 'review',
    createdAt: new Date('2024-01-13T11:00:00Z'),
    updatedAt: new Date('2024-01-13T11:00:00Z'),
    createdBy: 'student',
  },
];

/**
 * Sample Offer/Promotion content items
 */
export const sampleOfferPromotions: ContentItem[] = [
  {
    id: 'offer-1',
    schemaId: 'offer-promotion',
    locale: 'en-US',
    fields: {
      headline: 'Limited Time: 50% Off All Courses',
      body: 'Get access to all premium courses at half price. This exclusive offer expires in 48 hours. Don\'t miss out on this incredible opportunity to advance your career.',
      tone: 'urgent',
      length: 'medium',
    },
    status: 'approved',
    createdAt: new Date('2024-01-18T12:00:00Z'),
    updatedAt: new Date('2024-01-18T12:00:00Z'),
    createdBy: 'student',
    updatedBy: 'admin',
  },
  {
    id: 'offer-2',
    schemaId: 'offer-promotion',
    locale: 'en-US',
    fields: {
      headline: 'Welcome to Our Platform',
      body: 'We\'re excited to have you join our community. Start your learning journey today with our comprehensive course library.',
      tone: 'friendly',
      length: 'short',
    },
    status: 'draft',
    createdAt: new Date('2024-01-19T09:00:00Z'),
    updatedAt: new Date('2024-01-19T09:00:00Z'),
    createdBy: 'student',
  },
  {
    id: 'offer-3',
    schemaId: 'offer-promotion',
    locale: 'en-GB',
    fields: {
      headline: 'Professional Development Programme',
      body: 'Enhance your professional skills with our comprehensive training programme. Designed for ambitious professionals seeking to advance their careers through structured learning and practical application.',
      tone: 'professional',
      length: 'long',
    },
    status: 'review',
    createdAt: new Date('2024-01-20T14:00:00Z'),
    updatedAt: new Date('2024-01-20T14:00:00Z'),
    createdBy: 'student',
  },
];

/**
 * All sample content items combined
 */
export const sampleContentItems: ContentItem[] = [
  ...sampleCampaignAssets,
  ...sampleProductLabels,
  ...sampleOfferPromotions,
];

/**
 * Get sample content items by schema ID
 */
export function getSampleContentBySchemaId(schemaId: string): ContentItem[] {
  return sampleContentItems.filter((item) => item.schemaId === schemaId);
}

/**
 * Get sample content items by status
 */
export function getSampleContentByStatus(status: ContentItem['status']): ContentItem[] {
  return sampleContentItems.filter((item) => item.status === status);
}

/**
 * Get sample content items by locale
 */
export function getSampleContentByLocale(locale: string): ContentItem[] {
  return sampleContentItems.filter((item) => item.locale === locale);
}
