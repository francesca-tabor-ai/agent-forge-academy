import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getLLMProvider } from '@/lib/ai/llm';

interface ProductInfo {
  name: string;
  description: string;
  category?: string;
  price?: string;
  specifications?: string;
  features?: string;
  targetAudience?: string;
}

interface ReviewAnalysis {
  overallScore: number;
  truthfulness: number;
  completeness: number;
  evidenceDensity: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiTrustScore: number;
}

interface GeneratedReview {
  reviewText: string;
  analysis: ReviewAnalysis;
  reviewType: 'consumer' | 'technical' | 'comparative' | 'comprehensive';
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productInfo, reviewType }: { productInfo: ProductInfo; reviewType: string } = body;

    if (!productInfo?.name || !productInfo?.description) {
      return NextResponse.json(
        { error: 'Product name and description are required' },
        { status: 400 }
      );
    }

    // Build prompt based on review type
    const prompt = buildReviewPrompt(productInfo, reviewType);

    // Generate review using LLM
    const llm = getLLMProvider();
    const response = await llm.generate(
      [
        {
          role: 'system',
          content: `You are an expert product reviewer specializing in AI-trust-optimized reviews. Your reviews evaluate products based on:
- Truthfulness: Are claims supported by evidence?
- Completeness: Is it clear who should/shouldn't buy?
- Evidence Density: How much verifiable evidence supports claims?

Generate comprehensive, balanced reviews that help consumers make informed decisions.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 3000,
      }
    );

    // Parse the response to extract review and analysis
    const reviewData = parseReviewResponse(response.content, reviewType);

    const generatedReview: GeneratedReview = {
      reviewText: reviewData.reviewText,
      analysis: reviewData.analysis,
      reviewType: reviewType as any,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ review: generatedReview });
  } catch (error) {
    console.error('Error generating review:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate review' },
      { status: 500 }
    );
  }
}

function buildReviewPrompt(productInfo: ProductInfo, reviewType: string): string {
  let prompt = `Generate a ${reviewType} product review for the following product:\n\n`;

  prompt += `**Product Name:** ${productInfo.name}\n`;
  prompt += `**Description:** ${productInfo.description}\n\n`;

  if (productInfo.category) {
    prompt += `**Category:** ${productInfo.category}\n`;
  }
  if (productInfo.price) {
    prompt += `**Price:** ${productInfo.price}\n`;
  }
  if (productInfo.specifications) {
    prompt += `**Specifications:** ${productInfo.specifications}\n`;
  }
  if (productInfo.features) {
    prompt += `**Key Features:** ${productInfo.features}\n`;
  }
  if (productInfo.targetAudience) {
    prompt += `**Target Audience:** ${productInfo.targetAudience}\n`;
  }

  prompt += `\nPlease provide:\n`;
  prompt += `1. A comprehensive review text (800-1500 words) that evaluates:\n`;
  prompt += `   - Product overview and positioning\n`;
  prompt += `   - Key features and benefits\n`;
  prompt += `   - Use cases and target audience fit\n`;
  prompt += `   - Strengths and differentiators\n`;
  prompt += `   - Limitations and considerations\n`;
  prompt += `   - Value proposition assessment\n`;
  prompt += `   - Overall recommendation\n\n`;

  prompt += `2. An analysis section with scores (0-100) for:\n`;
  prompt += `   - Overall Score: Overall product quality and value\n`;
  prompt += `   - AI Trust Score: How well the product information would perform in AI systems (truthfulness, completeness, evidence density)\n`;
  prompt += `   - Truthfulness: Are claims supported by evidence?\n`;
  prompt += `   - Completeness: Is it clear who should/shouldn't buy?\n`;
  prompt += `   - Evidence Density: How much verifiable evidence supports claims?\n\n`;

  prompt += `3. A list of 3-5 key strengths\n`;
  prompt += `4. A list of 3-5 key weaknesses or areas for improvement\n`;
  prompt += `5. 3-5 actionable recommendations\n\n`;

  if (reviewType === 'consumer') {
    prompt += `Focus on practical use cases, ease of use, value for money, and everyday benefits.\n`;
  } else if (reviewType === 'technical') {
    prompt += `Focus on technical specifications, performance metrics, architecture, and technical trade-offs.\n`;
  } else if (reviewType === 'comparative') {
    prompt += `Include comparisons with similar products in the market, highlighting competitive advantages and disadvantages.\n`;
  }

  prompt += `\nFormat your response as JSON with the following structure:\n`;
  prompt += `{\n`;
  prompt += `  "reviewText": "The full review text...",\n`;
  prompt += `  "analysis": {\n`;
  prompt += `    "overallScore": 85,\n`;
  prompt += `    "aiTrustScore": 78,\n`;
  prompt += `    "truthfulness": 82,\n`;
  prompt += `    "completeness": 75,\n`;
  prompt += `    "evidenceDensity": 80,\n`;
  prompt += `    "strengths": ["strength 1", "strength 2", ...],\n`;
  prompt += `    "weaknesses": ["weakness 1", "weakness 2", ...],\n`;
  prompt += `    "recommendations": ["recommendation 1", "recommendation 2", ...]\n`;
  prompt += `  }\n`;
  prompt += `}\n`;

  return prompt;
}

function parseReviewResponse(content: string, reviewType: string): {
  reviewText: string;
  analysis: ReviewAnalysis;
} {
  // Try to parse JSON from the response
  try {
    // Look for JSON block in the response (handle code blocks)
    let jsonContent = content;
    
    // Remove markdown code blocks if present
    jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the parsed data
      const reviewText = parsed.reviewText || content.split('{')[0] || content;
      const analysis = parsed.analysis || generateDefaultAnalysis();
      
      // Ensure analysis has all required fields
      const sanitizedAnalysis: ReviewAnalysis = {
        overallScore: typeof analysis.overallScore === 'number' ? analysis.overallScore : 75,
        aiTrustScore: typeof analysis.aiTrustScore === 'number' ? analysis.aiTrustScore : 72,
        truthfulness: typeof analysis.truthfulness === 'number' ? analysis.truthfulness : 70,
        completeness: typeof analysis.completeness === 'number' ? analysis.completeness : 70,
        evidenceDensity: typeof analysis.evidenceDensity === 'number' ? analysis.evidenceDensity : 70,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : generateDefaultAnalysis().strengths,
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : generateDefaultAnalysis().weaknesses,
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : generateDefaultAnalysis().recommendations,
      };
      
      return {
        reviewText: reviewText.trim(),
        analysis: sanitizedAnalysis,
      };
    }
  } catch (error) {
    console.error('Failed to parse JSON from LLM response:', error);
  }

  // Fallback: extract review text and generate default analysis
  // Try to find where the review text ends (before JSON or analysis section)
  let reviewText = content;
  const jsonStart = content.indexOf('{');
  const analysisStart = content.toLowerCase().indexOf('analysis');
  
  if (jsonStart > 0) {
    reviewText = content.substring(0, jsonStart);
  } else if (analysisStart > 0) {
    reviewText = content.substring(0, analysisStart);
  }
  
  return {
    reviewText: reviewText.trim() || content,
    analysis: generateDefaultAnalysis(),
  };
}

function generateDefaultAnalysis(): ReviewAnalysis {
  return {
    overallScore: 75,
    truthfulness: 70,
    completeness: 70,
    evidenceDensity: 70,
    aiTrustScore: 72,
    strengths: [
      'Product has clear value proposition',
      'Well-defined target audience',
      'Competitive features',
    ],
    weaknesses: [
      'Could benefit from more detailed specifications',
      'Limited evidence of performance claims',
      'Target audience could be more clearly defined',
    ],
    recommendations: [
      'Add more verifiable evidence to support claims',
      'Clarify who should and shouldn\'t use this product',
      'Include more detailed technical specifications',
      'Provide comparison with similar products',
    ],
  };
}
