'use client';

import { useState, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Download, 
  Star, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  BarChart3,
  Copy,
  RefreshCw
} from 'lucide-react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';

interface AIProductReviewBotClientProps {
  toolId: string;
  studentProfileId: string;
}

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

export function AIProductReviewBotClient({ 
  toolId, 
  studentProfileId 
}: AIProductReviewBotClientProps) {
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: '',
    description: '',
    category: '',
    price: '',
    specifications: '',
    features: '',
    targetAudience: '',
  });
  const [reviewType, setReviewType] = useState<'consumer' | 'technical' | 'comparative' | 'comprehensive'>('comprehensive');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReview, setGeneratedReview] = useState<GeneratedReview | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Handle PDF files
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('utf-8');
        let text = decoder.decode(uint8Array);
        
        // Basic PDF text extraction
        text = text.replace(/\/[A-Za-z]+\s*\[.*?\]/g, '');
        text = text.replace(/<<.*?>>/g, '');
        text = text.replace(/stream[\s\S]*?endstream/g, '');
        text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        text = text.replace(/\s+/g, ' ');
        text = text.trim();
        
        // Try to extract product info from text
        setProductInfo(prev => ({
          ...prev,
          description: text.substring(0, 2000),
        }));
      } catch (error) {
        alert('Error reading PDF. Please try copying and pasting the text instead.');
        console.error('PDF read error:', error);
      }
      return;
    }

    // Handle text files
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setProductInfo(prev => ({
          ...prev,
          description: result.substring(0, 2000),
        }));
      }
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  }, []);

  const generateReview = useCallback(async () => {
    if (!productInfo.name.trim() || !productInfo.description.trim()) {
      setError('Please provide at least a product name and description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tools/ai-product-review-bot/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productInfo,
          reviewType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate review' }));
        throw new Error(errorData.error || 'Failed to generate review');
      }

      const data = await response.json();
      setGeneratedReview(data.review);

      // Log tool run
      await logToolRunSafe({
        toolId,
        studentProfileId,
        inputs: {
          productName: productInfo.name,
          reviewType,
          hasSpecifications: !!productInfo.specifications,
          hasFeatures: !!productInfo.features,
        },
        outputs: {
          reviewType: data.review.reviewType,
          overallScore: data.review.analysis.overallScore,
          aiTrustScore: data.review.analysis.aiTrustScore,
        },
      });
    } catch (err) {
      console.error('Review generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate review');
    } finally {
      setIsLoading(false);
    }
  }, [productInfo, reviewType, toolId, studentProfileId]);

  const handleExport = useCallback((format: 'markdown' | 'json') => {
    if (!generatedReview) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(generatedReview, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-review-${productInfo.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const markdown = generateMarkdown(generatedReview, productInfo);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `product-review-${productInfo.name.replace(/\s+/g, '-')}-${Date.now()}.md`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [generatedReview, productInfo]);

  const handleCopyReview = useCallback(() => {
    if (!generatedReview) return;
    navigator.clipboard.writeText(generatedReview.reviewText);
    alert('Review copied to clipboard!');
  }, [generatedReview]);

  const handleReset = useCallback(() => {
    setProductInfo({
      name: '',
      description: '',
      category: '',
      price: '',
      specifications: '',
      features: '',
      targetAudience: '',
    });
    setGeneratedReview(null);
    setFileName('');
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Sparkles className="text-brand-light" size={32} />
            AI Product Review Bot
          </h1>
          <p className="text-gray-600 text-lg">
            Generate comprehensive, AI-trust-optimized product reviews with automated analysis and insights
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Input Form */}
        {!generatedReview && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-brand-light" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">Product Information</h2>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF, TXT, MD, or any text file</p>
                  {fileName && (
                    <p className="text-sm text-brand-light font-semibold mt-2">
                      ✓ {fileName}
                    </p>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.doc,.docx,.pdf,application/pdf,text/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Product Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="product-name"
                  value={productInfo.name}
                  onChange={(e) => setProductInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                  placeholder="e.g., iPhone 15 Pro"
                />
              </div>

              <div>
                <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="product-description"
                  value={productInfo.description}
                  onChange={(e) => setProductInfo(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent resize-none"
                  placeholder="Describe the product, its features, use cases, and key selling points..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    id="product-category"
                    value={productInfo.category}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                    placeholder="e.g., Electronics, Software, SaaS"
                  />
                </div>

                <div>
                  <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    id="product-price"
                    value={productInfo.price}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                    placeholder="e.g., $999 or $49/month"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="product-specifications" className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Specifications
                </label>
                <textarea
                  id="product-specifications"
                  value={productInfo.specifications}
                  onChange={(e) => setProductInfo(prev => ({ ...prev, specifications: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent resize-none font-mono text-sm"
                  placeholder="CPU, RAM, storage, dimensions, weight, etc."
                />
              </div>

              <div>
                <label htmlFor="product-features" className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features
                </label>
                <textarea
                  id="product-features"
                  value={productInfo.features}
                  onChange={(e) => setProductInfo(prev => ({ ...prev, features: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent resize-none"
                  placeholder="List key features, benefits, and differentiators..."
                />
              </div>

              <div>
                <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  id="target-audience"
                  value={productInfo.targetAudience}
                  onChange={(e) => setProductInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                  placeholder="e.g., Small business owners, Enterprise developers, Students"
                />
              </div>

              <div>
                <label htmlFor="review-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Type
                </label>
                <select
                  id="review-type"
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  <option value="comprehensive">Comprehensive Review</option>
                  <option value="consumer">Consumer-Focused Review</option>
                  <option value="technical">Technical Review</option>
                  <option value="comparative">Comparative Analysis</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateReview}
              disabled={!productInfo.name.trim() || !productInfo.description.trim() || isLoading}
              className="mt-6 w-full bg-brand-light hover:bg-brand-light/90 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Generating AI-Powered Review...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Review
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Review */}
        {generatedReview && (
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ScoreCard
                title="Overall Score"
                score={generatedReview.analysis.overallScore}
                icon={<Star className="text-yellow-500" size={24} />}
              />
              <ScoreCard
                title="AI Trust Score"
                score={generatedReview.analysis.aiTrustScore}
                icon={<CheckCircle className="text-green-500" size={24} />}
              />
              <ScoreCard
                title="Truthfulness"
                score={generatedReview.analysis.truthfulness}
                icon={<Target className="text-blue-500" size={24} />}
              />
              <ScoreCard
                title="Completeness"
                score={generatedReview.analysis.completeness}
                icon={<BarChart3 className="text-purple-500" size={24} />}
              />
            </div>

            {/* Review Text */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Generated Review</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyReview}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                  <button
                    onClick={() => handleExport('markdown')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export MD
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export JSON
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {generatedReview.reviewText}
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalysisCard
                title="Strengths"
                items={generatedReview.analysis.strengths}
                icon={<TrendingUp className="text-green-500" size={24} />}
                color="green"
              />
              <AnalysisCard
                title="Weaknesses"
                items={generatedReview.analysis.weaknesses}
                icon={<AlertCircle className="text-orange-500" size={24} />}
                color="orange"
              />
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-brand-light" size={24} />
                <h2 className="text-2xl font-semibold text-gray-900">Recommendations</h2>
              </div>
              <ul className="space-y-3">
                {generatedReview.analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="text-brand-light mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Generate New Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ title, score, icon }: { title: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900">{score}/100</div>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-brand-light h-2 rounded-full transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function AnalysisCard({ 
  title, 
  items, 
  icon, 
  color 
}: { 
  title: string; 
  items: string[]; 
  icon: React.ReactNode;
  color: 'green' | 'orange';
}) {
  const bgColor = color === 'green' ? 'bg-green-50' : 'bg-orange-50';
  const borderColor = color === 'green' ? 'border-green-200' : 'border-orange-200';

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-2 ${borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className={`${color === 'green' ? 'text-green-600' : 'text-orange-600'} mt-1`}>•</span>
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function generateMarkdown(review: GeneratedReview, productInfo: ProductInfo): string {
  return `# Product Review: ${productInfo.name}

**Generated:** ${new Date(review.createdAt).toLocaleDateString()}  
**Review Type:** ${review.reviewType.charAt(0).toUpperCase() + review.reviewType.slice(1)}

---

## Review Scores

- **Overall Score:** ${review.analysis.overallScore}/100
- **AI Trust Score:** ${review.analysis.aiTrustScore}/100
- **Truthfulness:** ${review.analysis.truthfulness}/100
- **Completeness:** ${review.analysis.completeness}/100
- **Evidence Density:** ${review.analysis.evidenceDensity}/100

---

## Review

${review.reviewText}

---

## Analysis

### Strengths

${review.analysis.strengths.map(s => `- ${s}`).join('\n')}

### Weaknesses

${review.analysis.weaknesses.map(w => `- ${w}`).join('\n')}

### Recommendations

${review.analysis.recommendations.map(r => `- ${r}`).join('\n')}

---

*This review was generated using AI Product Review Bot.*
`;
}
