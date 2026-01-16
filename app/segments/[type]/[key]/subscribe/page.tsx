import { notFound } from 'next/navigation';
import { getSegment } from '@/lib/utils/segments';
import type { SegmentType } from '@/lib/types/segment';
import { getSegmentSubscriptionConfig } from '@/lib/utils/segment-subscriptions';
import SegmentSubscribePage from '@/components/segments/SegmentSubscribePage';

interface PageProps {
  params: Promise<{
    type: string;
    key: string;
  }>;
}

export default async function SegmentSubscribePageRoute({ params }: PageProps) {
  const { type, key } = await params;
  
  // Validate type
  const validTypes: SegmentType[] = ['track', 'industry', 'role'];
  if (!validTypes.includes(type as SegmentType)) {
    notFound();
  }
  
  // Get segment
  const segment = getSegment(type as SegmentType, key);
  
  if (!segment) {
    notFound();
  }
  
  // Get subscription config
  const config = getSegmentSubscriptionConfig(segment);
  
  if (!config) {
    notFound();
  }
  
  return <SegmentSubscribePage segment={segment} config={config} />;
}
