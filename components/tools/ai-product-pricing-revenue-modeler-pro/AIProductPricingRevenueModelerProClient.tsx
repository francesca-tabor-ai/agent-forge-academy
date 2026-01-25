'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { logToolRunSafe } from '@/lib/tools/logToolRun';

interface AIProductPricingRevenueModelerProClientProps {
  toolId: string;
  studentProfileId: string;
}

declare global {
  interface Window {
    Chart: any;
    pdfjsLib: any;
  }
}

interface AnalysisResult {
  adoption: { level: string; details: string };
  risk: { type: string; value: string; description: string };
  cost: {
    apiCost: number;
    embeddingCost: number;
    monitoringCost: number;
    supportCost: number;
    integrationCost: number;
    totalCost: string;
    minimumPrice: string;
  };
  outcome: string;
  pricingModel: string;
  pricing: {
    model: string;
    basic: { name: string; price: number; description: string };
    pro: { name: string; price: number; description: string };
    enterprise: { name: string; price: number; description: string };
  };
  forecast: Array<{ month: number; customers: number; revenue: number; arr: number }>;
}

export function AIProductPricingRevenueModelerProClient({
  toolId,
  studentProfileId,
}: AIProductPricingRevenueModelerProClientProps) {
  const [prdText, setPrdText] = useState('');
  const [productCategory, setProductCategory] = useState('compliance');
  const [customerSegment, setCustomerSegment] = useState('enterprise');
  const [apiCost, setApiCost] = useState(10);
  const [forecastPeriod, setForecastPeriod] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (chartLoaded && analysisResult && chartRef.current) {
      renderChart(analysisResult.forecast);
    }
  }, [chartLoaded, analysisResult]);

  const handleFile = async (file: File) => {
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        await extractPDFText(arrayBuffer, file.name);
      } catch (error) {
        console.error('PDF extraction error:', error);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setPrdText(text);
      };
      reader.onerror = () => {
        console.error('Error reading file');
      };
      reader.readAsText(file);
    }
  };

  const extractPDFText = async (arrayBuffer: ArrayBuffer, fileName: string) => {
    try {
      if (!window.pdfjsLib) {
        await loadPDFJS();
      }

      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      setPrdText(fullText);
    } catch (error) {
      console.error('PDF extraction error:', error);
    }
  };

  const loadPDFJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const determineAdoptionFriction = (prd: string, category: string) => {
    const requiresApproval = /approval|sign-off|compliance review|legal/i.test(prd);
    const policyChange = /policy|governance|procedure change/i.test(prd);
    const decisionMaking = /decision|autonomous|recommend|advise/i.test(prd);

    let friction = 'low';
    let details = '';

    if (category === 'compliance' || requiresApproval || policyChange) {
      friction = 'high';
      details = 'Requires compliance approval, legal sign-off, and policy updates. Recommend pilot pricing initially.';
    } else if (decisionMaking) {
      friction = 'medium';
      details = 'Decision-making capability requires stakeholder buy-in. Suitable for risk-tier pricing.';
    } else {
      friction = 'low';
      details = 'Assistive features with minimal barriers. Ready for standalone monetization via bundling.';
    }

    return { level: friction, details };
  };

  const determineRiskValue = (prd: string, category: string, hasCompliance: boolean) => {
    const riskTypes: Record<string, { type: string; value: string; description: string }> = {
      compliance: { type: 'Regulatory Risk', value: 'high', description: 'Reduces fines, breaches, and non-compliance exposure' },
      advisor: { type: 'Reputational Risk', value: 'high', description: 'Prevents bad advice and hallucination damage' },
      ops: { type: 'Operational Risk', value: 'medium', description: 'Reduces manual errors and delays' },
      research: { type: 'Opportunity Risk', value: 'medium', description: 'Prevents missed insights and slow decisions' },
      content: { type: 'Operational Risk', value: 'low', description: 'Improves efficiency without critical risk impact' },
    };

    return riskTypes[category] || riskTypes.content;
  };

  const calculateCostToServe = (apiCost: number, segment: string, hasIntegration: boolean) => {
    const baseApiCost = apiCost;
    const embeddingCost = apiCost * 0.3;
    const monitoringCost = apiCost * 0.2;
    const supportMultiplier = segment === 'enterprise' ? 1.5 : segment === 'mid-market' ? 1.2 : 1.0;
    const integrationOverhead = hasIntegration ? apiCost * 0.4 : 0;

    const totalCost = (baseApiCost + embeddingCost + monitoringCost + integrationOverhead) * supportMultiplier;
    const minimumPrice = totalCost * 3.5;

    return {
      apiCost: baseApiCost,
      embeddingCost,
      monitoringCost,
      supportCost: (baseApiCost + embeddingCost + monitoringCost) * (supportMultiplier - 1),
      integrationCost: integrationOverhead,
      totalCost: totalCost.toFixed(2),
      minimumPrice: minimumPrice.toFixed(2),
    };
  };

  const determineOutcomeAnchor = (category: string) => {
    const anchors: Record<string, string> = {
      compliance: 'Documents validated per month / Risk events avoided',
      advisor: 'Time saved per advisor / Faster client onboarding',
      ops: 'Cycle time reduction % / Error reduction %',
      research: 'Coverage breadth / Data freshness SLA',
      content: 'Content pieces generated / Production time saved',
    };

    return anchors[category] || anchors.content;
  };

  const selectPricingModel = (adoption: { level: string }, risk: { value: string }, category: string) => {
    if (adoption.level === 'high') {
      return 'Outcome-Backed Pilot';
    } else if (risk.value === 'high') {
      return 'Risk-Tier Pricing';
    } else if (adoption.level === 'low') {
      return 'Capability Bundling';
    } else {
      return 'Consumption-Capped Value Pricing';
    }
  };

  const calculatePricing = (model: string, segment: string, risk: { value: string }, cost: { minimumPrice: string }) => {
    const minPrice = parseFloat(cost.minimumPrice);

    const segmentMultipliers: Record<string, { base: number; growth: number }> = {
      enterprise: { base: 4.5, growth: 1.8 },
      'mid-market': { base: 3.2, growth: 1.5 },
      smb: { base: 2.5, growth: 1.3 },
    };

    const riskMultipliers: Record<string, number> = { high: 1.6, medium: 1.3, low: 1.0 };

    const mult = segmentMultipliers[segment];
    const riskMult = riskMultipliers[risk.value];

    const basePrice = minPrice * mult.base * riskMult;
    const proPrice = basePrice * mult.growth;
    const enterprisePrice = proPrice * 1.5;

    return {
      model,
      basic: {
        name: model === 'Outcome-Backed Pilot' ? '90-Day Pilot' : 'Starter',
        price: Math.round(basePrice / 10) * 10,
        description: model === 'Outcome-Backed Pilot' ? 'Fixed-fee pilot with success metrics' : 'Core features with usage caps',
      },
      pro: {
        name: 'Professional',
        price: Math.round(proPrice / 10) * 10,
        description: 'Advanced capabilities + integration support',
      },
      enterprise: {
        name: 'Enterprise',
        price: Math.round(enterprisePrice / 10) * 10,
        description: 'Full platform + dedicated success + SLA',
      },
    };
  };

  const generateForecast = (
    pricing: { basic: { price: number }; pro: { price: number }; enterprise: { price: number } },
    segment: string,
    months: number,
    adoption: { level: string }
  ) => {
    const adoptionRates: Record<string, { initial: number; growth: number; churn: number }> = {
      low: { initial: 8, growth: 0.25, churn: 0.03 },
      medium: { initial: 5, growth: 0.18, churn: 0.05 },
      high: { initial: 2, growth: 0.12, churn: 0.08 },
    };

    const segmentSizes: Record<string, { maxCustomers: number; avgSeats: number }> = {
      enterprise: { maxCustomers: 150, avgSeats: 200 },
      'mid-market': { maxCustomers: 500, avgSeats: 50 },
      smb: { maxCustomers: 2000, avgSeats: 12 },
    };

    const rate = adoptionRates[adoption.level];
    const segmentData = segmentSizes[segment];

    const tiers = {
      basic: 0.45,
      pro: 0.35,
      enterprise: 0.2,
    };

    const forecast = [];
    let customers = rate.initial;

    for (let month = 0; month <= months; month++) {
      if (month > 0) {
        const growthFactor = 1 - (customers / segmentData.maxCustomers) * 0.7;
        const netGrowth = customers * rate.growth * growthFactor - customers * rate.churn;
        customers = Math.min(customers + netGrowth, segmentData.maxCustomers);
      }

      const basicCustomers = customers * tiers.basic;
      const proCustomers = customers * tiers.pro;
      const enterpriseCustomers = customers * tiers.enterprise;

      const basicRevenue = basicCustomers * pricing.basic.price * segmentData.avgSeats * 0.3;
      const proRevenue = proCustomers * pricing.pro.price * segmentData.avgSeats * 0.5;
      const enterpriseRevenue = enterpriseCustomers * pricing.enterprise.price * segmentData.avgSeats * 0.8;

      const totalRevenue = basicRevenue + proRevenue + enterpriseRevenue;

      forecast.push({
        month,
        customers: Math.round(customers),
        revenue: Math.round(totalRevenue),
        arr: Math.round(totalRevenue * 12),
      });
    }

    return forecast;
  };

  const performAnalysis = (prdContent: string, category: string, segment: string, apiCost: number, forecastPeriod: number): AnalysisResult => {
    const hasCompliance = /compliance|regulatory|audit|governance/i.test(prdContent);
    const hasIntegration = /integrat|api|connect|sync/i.test(prdContent);

    const adoption = determineAdoptionFriction(prdContent, category);
    const risk = determineRiskValue(prdContent, category, hasCompliance);
    const cost = calculateCostToServe(apiCost, segment, hasIntegration);
    const outcome = determineOutcomeAnchor(category);

    const pricingModel = selectPricingModel(adoption, risk, category);
    const pricing = calculatePricing(pricingModel, segment, risk, cost);

    const forecast = generateForecast(pricing, segment, forecastPeriod, adoption);

    return {
      adoption,
      risk,
      cost,
      outcome,
      pricingModel,
      pricing,
      forecast,
    };
  };

  const analyzePRD = async () => {
    const prdContent = prdText.trim();
    if (!prdContent) {
      alert('Please upload or paste a PRD first');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const analysis = performAnalysis(prdContent, productCategory, customerSegment, apiCost, forecastPeriod);
      setAnalysisResult(analysis);
      setIsLoading(false);

      logToolRunSafe({
        toolId,
        studentProfileId,
        inputs: {
          prdContent: prdContent.substring(0, 500),
          productCategory,
          customerSegment,
          apiCost,
          forecastPeriod,
        },
        outputs: {
          pricingModel: analysis.pricingModel,
          pricing: analysis.pricing,
          forecast: analysis.forecast,
        },
      });

      if (chartLoaded && chartRef.current) {
        setTimeout(() => renderChart(analysis.forecast), 100);
      }
    }, 1500);
  };

  const renderChart = (forecast: Array<{ month: number; customers: number; revenue: number }>) => {
    if (!window.Chart || !chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const labels = forecast.map((f) => `M${f.month}`);
    const revenueData = forecast.map((f) => f.revenue / 1000);
    const customerData = forecast.map((f) => f.customers);

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'MRR ($K)',
            data: revenueData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'Customers',
            data: customerData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  if (context.datasetIndex === 0) {
                    label += '$' + context.parsed.y.toFixed(0) + 'K';
                  } else {
                    label += Math.round(context.parsed.y);
                  }
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'MRR ($K)',
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Customers',
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });
  };

  const getBadgeClasses = (level: string) => {
    if (level === 'high') {
      return 'bg-red-100 text-red-800';
    } else if (level === 'medium') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="lazyOnload"
        onLoad={() => {
          setChartLoaded(true);
        }}
      />

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-6">
                {/* Upload PRD Card */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📄 Upload PRD
                  </h2>
                  <div
                    ref={uploadAreaRef}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        handleFile(files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="text-5xl mb-4">📤</div>
                    <p className="font-semibold text-gray-700 mb-1">Drag & drop your PRD here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="fileInput"
                      accept=".txt,.md,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="block font-semibold text-gray-700 text-sm mb-2">
                      Or paste PRD content:
                    </label>
                    <textarea
                      id="prdText"
                      value={prdText}
                      onChange={(e) => setPrdText(e.target.value)}
                      placeholder="Paste your Product Requirements Document here..."
                      className="w-full min-h-[200px] p-4 border-2 border-gray-200 rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Configuration Card */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    ⚙️ Configuration
                  </h2>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 text-sm">Product Category</label>
                      <select
                        id="productCategory"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="compliance">Compliance AI</option>
                        <option value="advisor">Advisor AI</option>
                        <option value="ops">Operations AI</option>
                        <option value="research">Research AI</option>
                        <option value="content">Content Generation AI</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 text-sm">Target Customer Segment</label>
                      <select
                        id="customerSegment"
                        value={customerSegment}
                        onChange={(e) => setCustomerSegment(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="enterprise">Enterprise (1000+ employees)</option>
                        <option value="mid-market">Mid-Market (100-1000 employees)</option>
                        <option value="smb">SMB (10-100 employees)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 text-sm">Expected Monthly API Cost per User</label>
                      <input
                        type="number"
                        id="apiCost"
                        value={apiCost}
                        onChange={(e) => setApiCost(parseFloat(e.target.value))}
                        min="1"
                        step="0.5"
                        className="px-3 py-3 border-2 border-gray-200 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 text-sm">Forecast Period (months)</label>
                      <input
                        type="number"
                        id="forecastPeriod"
                        value={forecastPeriod}
                        onChange={(e) => setForecastPeriod(parseInt(e.target.value))}
                        min="6"
                        max="60"
                        step="6"
                        className="px-3 py-3 border-2 border-gray-200 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      id="analyzeBtn"
                      onClick={analyzePRD}
                      disabled={isLoading}
                      className={`w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      🎯 Analyze & Model Pricing
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Section */}
              <div className="space-y-6">
                {isLoading && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p>Analyzing PRD and modeling pricing strategy...</p>
                  </div>
                )}

                {!isLoading && analysisResult && (
                  <div className="space-y-6">
                    {/* ARC-O Framework Analysis */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        📊 ARC-O Framework Analysis
                      </h2>
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mt-4">
                        <div className="space-y-4">
                          <div>
                            <div className="font-bold text-orange-900 mb-2">🚦 Adoption Gate</div>
                            <div className="text-orange-800 leading-relaxed">
                              {analysisResult.adoption.details}
                              <span
                                className={`inline-block ml-2 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClasses(
                                  analysisResult.adoption.level
                                )}`}
                              >
                                {analysisResult.adoption.level.toUpperCase()} FRICTION
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-orange-900 mb-2">⚠️ Risk Value</div>
                            <div className="text-orange-800 leading-relaxed">
                              <strong>{analysisResult.risk.type}:</strong> {analysisResult.risk.description}
                              <span
                                className={`inline-block ml-2 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClasses(
                                  analysisResult.risk.value
                                )}`}
                              >
                                {analysisResult.risk.value.toUpperCase()} RISK VALUE
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-orange-900 mb-2">💵 Cost-to-Serve Floor</div>
                            <div className="text-orange-800 leading-relaxed">
                              <strong>Total monthly cost per user:</strong> ${analysisResult.cost.totalCost}
                              <br />
                              <strong>Minimum viable price:</strong> ${analysisResult.cost.minimumPrice}/user/month
                              <div className="mt-2 text-sm">
                                API: ${analysisResult.cost.apiCost} | Embedding: ${analysisResult.cost.embeddingCost.toFixed(2)} | Monitoring: ${analysisResult.cost.monitoringCost.toFixed(2)} | Support: ${analysisResult.cost.supportCost.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-orange-900 mb-2">🎯 Outcome Anchor</div>
                            <div className="text-orange-800 leading-relaxed">
                              Price against: <strong>{analysisResult.outcome}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Recommendation */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        💰 Pricing Recommendation
                      </h2>
                      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-xl mt-4">
                        <h3 className="mb-4 text-xl font-semibold">Recommended Model: {analysisResult.pricingModel}</h3>
                        <div className="space-y-3">
                          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                            <div className="font-bold text-lg mb-2">{analysisResult.pricing.basic.name}</div>
                            <div className="text-2xl font-bold mb-2">${analysisResult.pricing.basic.price.toLocaleString()}/month</div>
                            <div>{analysisResult.pricing.basic.description}</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                            <div className="font-bold text-lg mb-2">{analysisResult.pricing.pro.name}</div>
                            <div className="text-2xl font-bold mb-2">${analysisResult.pricing.pro.price.toLocaleString()}/month</div>
                            <div>{analysisResult.pricing.pro.description}</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                            <div className="font-bold text-lg mb-2">{analysisResult.pricing.enterprise.name}</div>
                            <div className="text-2xl font-bold mb-2">${analysisResult.pricing.enterprise.price.toLocaleString()}/month</div>
                            <div>{analysisResult.pricing.enterprise.description}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Forecast */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        📈 Revenue Forecast
                      </h2>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                          <div className="text-xs text-gray-500 mb-1">
                            Customers (Year {Math.floor(analysisResult.forecast.length / 12)})
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {analysisResult.forecast[analysisResult.forecast.length - 1].customers}
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                          <div className="text-xs text-gray-500 mb-1">MRR (Month {analysisResult.forecast.length})</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${(analysisResult.forecast[analysisResult.forecast.length - 1].revenue / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                          <div className="text-xs text-gray-500 mb-1">ARR (Projected)</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${(analysisResult.forecast[analysisResult.forecast.length - 1].arr / 1000000).toFixed(2)}M
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                          <div className="text-xs text-gray-500 mb-1">Growth Rate</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {(
                              ((analysisResult.forecast[analysisResult.forecast.length - 1].revenue / analysisResult.forecast[1].revenue) **
                                (1 / (analysisResult.forecast.length - 1)) -
                                1) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-lg mt-4 h-[300px]">
                        <canvas ref={chartRef}></canvas>
                      </div>
                      <div className="bg-slate-100 p-4 rounded-lg mt-4 text-sm text-slate-600">
                        <div className="font-semibold mb-2 text-gray-900">📋 Forecast Assumptions</div>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          <li>Tier distribution: 45% Starter, 35% Pro, 20% Enterprise</li>
                          <li>Adoption friction: {analysisResult.adoption.level} (affects growth rate and churn)</li>
                          <li>Initial customers: {analysisResult.forecast[0].customers}, growing with diminishing returns</li>
                          <li>Seat utilization varies by tier (30% Starter, 50% Pro, 80% Enterprise)</li>
                          <li>Pricing anchored to {analysisResult.risk.type.toLowerCase()} reduction</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
