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

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="lazyOnload"
        onLoad={() => {
          setChartLoaded(true);
        }}
      />

      <div
        className="container"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <div
          className="header"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀 AI Product Pricing & Revenue Modeler</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Upload your PRD and get ARC-O framework analysis with revenue forecasting</p>
        </div>

        <div
          className="main-content"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '2rem',
            padding: '2rem',
          }}
        >
          <div className="input-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📄 Upload PRD
              </h2>
              <div
                ref={uploadAreaRef}
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (uploadAreaRef.current) {
                    uploadAreaRef.current.style.borderColor = '#2563eb';
                    uploadAreaRef.current.style.background = '#dbeafe';
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (uploadAreaRef.current) {
                    uploadAreaRef.current.style.borderColor = '#cbd5e1';
                    uploadAreaRef.current.style.background = 'white';
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (uploadAreaRef.current) {
                    uploadAreaRef.current.style.borderColor = '#cbd5e1';
                    uploadAreaRef.current.style.background = 'white';
                  }
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    handleFile(files[0]);
                  }
                }}
                style={{
                  border: '3px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: 'white',
                }}
              >
                <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  📤
                </div>
                <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>Drag & drop your PRD here</p>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="fileInput"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                >
                  Choose File
                </button>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  Or paste PRD content:
                </label>
                <textarea
                  id="prdText"
                  value={prdText}
                  onChange={(e) => setPrdText(e.target.value)}
                  placeholder="Paste your Product Requirements Document here..."
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div className="card" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚙️ Configuration
              </h2>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Product Category</label>
                <select
                  id="productCategory"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white',
                  }}
                >
                  <option value="compliance">Compliance AI</option>
                  <option value="advisor">Advisor AI</option>
                  <option value="ops">Operations AI</option>
                  <option value="research">Research AI</option>
                  <option value="content">Content Generation AI</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Target Customer Segment</label>
                <select
                  id="customerSegment"
                  value={customerSegment}
                  onChange={(e) => setCustomerSegment(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white',
                  }}
                >
                  <option value="enterprise">Enterprise (1000+ employees)</option>
                  <option value="mid-market">Mid-Market (100-1000 employees)</option>
                  <option value="smb">SMB (10-100 employees)</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Expected Monthly API Cost per User</label>
                <input
                  type="number"
                  id="apiCost"
                  value={apiCost}
                  onChange={(e) => setApiCost(parseFloat(e.target.value))}
                  min="1"
                  step="0.5"
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white',
                  }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Forecast Period (months)</label>
                <input
                  type="number"
                  id="forecastPeriod"
                  value={forecastPeriod}
                  onChange={(e) => setForecastPeriod(parseInt(e.target.value))}
                  min="6"
                  max="60"
                  step="6"
                  style={{
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white',
                  }}
                />
              </div>

              <button
                className="btn"
                id="analyzeBtn"
                onClick={analyzePRD}
                disabled={isLoading}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                🎯 Analyze & Model Pricing
              </button>
            </div>
          </div>

          <div className="output-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {isLoading && (
              <div className="loading" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <div
                  className="spinner"
                  style={{
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem',
                  }}
                ></div>
                <p>Analyzing PRD and modeling pricing strategy...</p>
              </div>
            )}

            {!isLoading && analysisResult && (
              <div id="analysisResult" style={{ display: 'block' }}>
                <div className="card" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                  <h2 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 ARC-O Framework Analysis
                  </h2>
                  <div
                    className="framework-analysis"
                    style={{
                      background: '#fff7ed',
                      borderLeft: '4px solid #f59e0b',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem',
                    }}
                  >
                    <div className="framework-section" style={{ marginBottom: '1rem' }}>
                      <div className="framework-title" style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
                        🚦 Adoption Gate
                      </div>
                      <div className="framework-content" style={{ color: '#78350f', lineHeight: 1.6 }}>
                        {analysisResult.adoption.details}
                        <span
                          className={`risk-badge risk-${analysisResult.adoption.level}`}
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginTop: '0.5rem',
                            marginLeft: '0.5rem',
                            background:
                              analysisResult.adoption.level === 'high'
                                ? '#fee2e2'
                                : analysisResult.adoption.level === 'medium'
                                  ? '#fef3c7'
                                  : '#d1fae5',
                            color:
                              analysisResult.adoption.level === 'high'
                                ? '#991b1b'
                                : analysisResult.adoption.level === 'medium'
                                  ? '#92400e'
                                  : '#065f46',
                          }}
                        >
                          {analysisResult.adoption.level.toUpperCase()} FRICTION
                        </span>
                      </div>
                    </div>
                    <div className="framework-section" style={{ marginBottom: '1rem' }}>
                      <div className="framework-title" style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
                        ⚠️ Risk Value
                      </div>
                      <div className="framework-content" style={{ color: '#78350f', lineHeight: 1.6 }}>
                        <strong>{analysisResult.risk.type}:</strong> {analysisResult.risk.description}
                        <span
                          className={`risk-badge risk-${analysisResult.risk.value}`}
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginTop: '0.5rem',
                            marginLeft: '0.5rem',
                            background:
                              analysisResult.risk.value === 'high'
                                ? '#fee2e2'
                                : analysisResult.risk.value === 'medium'
                                  ? '#fef3c7'
                                  : '#d1fae5',
                            color:
                              analysisResult.risk.value === 'high'
                                ? '#991b1b'
                                : analysisResult.risk.value === 'medium'
                                  ? '#92400e'
                                  : '#065f46',
                          }}
                        >
                          {analysisResult.risk.value.toUpperCase()} RISK VALUE
                        </span>
                      </div>
                    </div>
                    <div className="framework-section" style={{ marginBottom: '1rem' }}>
                      <div className="framework-title" style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
                        💵 Cost-to-Serve Floor
                      </div>
                      <div className="framework-content" style={{ color: '#78350f', lineHeight: 1.6 }}>
                        <strong>Total monthly cost per user:</strong> ${analysisResult.cost.totalCost}
                        <br />
                        <strong>Minimum viable price:</strong> ${analysisResult.cost.minimumPrice}/user/month
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                          API: ${analysisResult.cost.apiCost} | Embedding: ${analysisResult.cost.embeddingCost.toFixed(2)} | Monitoring: ${analysisResult.cost.monitoringCost.toFixed(2)} | Support: ${analysisResult.cost.supportCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="framework-section">
                      <div className="framework-title" style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.5rem' }}>
                        🎯 Outcome Anchor
                      </div>
                      <div className="framework-content" style={{ color: '#78350f', lineHeight: 1.6 }}>
                        Price against: <strong>{analysisResult.outcome}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                  <h2 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    💰 Pricing Recommendation
                  </h2>
                  <div
                    className="pricing-recommendation"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginTop: '1rem',
                    }}
                  >
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Recommended Model: {analysisResult.pricingModel}</h3>
                    <div className="pricing-tiers" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="tier" style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                        <div className="tier-name" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {analysisResult.pricing.basic.name}
                        </div>
                        <div className="tier-price" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                          ${analysisResult.pricing.basic.price.toLocaleString()}/month
                        </div>
                        <div>{analysisResult.pricing.basic.description}</div>
                      </div>
                      <div className="tier" style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                        <div className="tier-name" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {analysisResult.pricing.pro.name}
                        </div>
                        <div className="tier-price" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                          ${analysisResult.pricing.pro.price.toLocaleString()}/month
                        </div>
                        <div>{analysisResult.pricing.pro.description}</div>
                      </div>
                      <div className="tier" style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
                        <div className="tier-name" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                          {analysisResult.pricing.enterprise.name}
                        </div>
                        <div className="tier-price" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                          ${analysisResult.pricing.enterprise.price.toLocaleString()}/month
                        </div>
                        <div>{analysisResult.pricing.enterprise.description}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                  <h2 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📈 Revenue Forecast
                  </h2>
                  <div
                    className="metric-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem',
                      marginTop: '1rem',
                    }}
                  >
                    <div className="metric-card" style={{ background: 'white', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <div className="metric-label" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        Customers (Year {Math.floor(analysisResult.forecast.length / 12)})
                      </div>
                      <div className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        {analysisResult.forecast[analysisResult.forecast.length - 1].customers}
                      </div>
                    </div>
                    <div className="metric-card" style={{ background: 'white', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <div className="metric-label" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        MRR (Month {analysisResult.forecast.length})
                      </div>
                      <div className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        ${(analysisResult.forecast[analysisResult.forecast.length - 1].revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div className="metric-card" style={{ background: 'white', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <div className="metric-label" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        ARR (Projected)
                      </div>
                      <div className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                        ${(analysisResult.forecast[analysisResult.forecast.length - 1].arr / 1000000).toFixed(2)}M
                      </div>
                    </div>
                    <div className="metric-card" style={{ background: 'white', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <div className="metric-label" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        Growth Rate
                      </div>
                      <div className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
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
                  <div className="chart-container" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem', height: '300px' }}>
                    <canvas ref={chartRef}></canvas>
                  </div>
                  <div
                    className="assumptions"
                    style={{
                      background: '#f1f5f9',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem',
                      fontSize: '0.9rem',
                      color: '#475569',
                    }}
                  >
                    <div className="assumptions-title" style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                      📋 Forecast Assumptions
                    </div>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
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

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 968px) {
          .main-content {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
