import React, { useState } from 'react';
import { useBroker } from '../../context/BrokerContext';
import { HomepageCMSContent } from '../../types';
import {
  Save,
  RefreshCw,
  Check,
  Eye,
  Sparkles,
  BarChart3,
  ShieldCheck,
  HelpCircle,
  Tag,
} from 'lucide-react';

export const AdminHomepageCMS: React.FC = () => {
  const {
    homepageCMS,
    updateHomepageCMS,
    resetHomepageCMSToDefaults,
    navigateToPublicPage,
  } = useBroker();

  const [formData, setFormData] = useState<HomepageCMSContent>(() =>
    JSON.parse(JSON.stringify(homepageCMS))
  );
  const [activeSection, setActiveSection] = useState<
    'hero' | 'metrics' | 'trust' | 'howItWorks' | 'pricing'
  >('hero');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHomepageCMS(formData);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset all homepage marketing copy to original institutional defaults?'
      )
    ) {
      resetHomepageCMSToDefaults();
      setTimeout(() => {
        setFormData(JSON.parse(JSON.stringify(homepageCMS)));
        setShowSavedFeedback(true);
        setTimeout(() => setShowSavedFeedback(false), 3000);
      }, 50);
    }
  };

  const handlePreviewHomepage = () => {
    navigateToPublicPage('home');
  };

  // Helper to update a metric by index
  const updateMetric = (
    index: number,
    field: 'label' | 'value' | 'change',
    val: string
  ) => {
    const updated = [...formData.metrics];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: val };
      setFormData({ ...formData, metrics: updated });
    }
  };

  // Helper to update a trust badge by index
  const updateBadge = (
    index: number,
    field: 'title' | 'subtitle',
    val: string
  ) => {
    const updated = [...formData.trustCompliance.badges];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: val };
      setFormData({
        ...formData,
        trustCompliance: {
          ...formData.trustCompliance,
          badges: updated,
        },
      });
    }
  };

  // Helper to update a walkthrough step by index
  const updateStep = (
    index: number,
    field: 'title' | 'description' | 'tag',
    val: string
  ) => {
    const updated = [...formData.howItWorks.steps];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: val };
      setFormData({
        ...formData,
        howItWorks: {
          ...formData.howItWorks,
          steps: updated,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-semibold">
                Content Management System (CMS)
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-medium">
                Live Instant Publish
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">
              Homepage Marketing Copy & Content Editor
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Dynamically modify public homepage headlines, hero copy, live metrics,
              trust badges, 3-step walkthroughs, and pricing guarantee copy. Updates take
              effect immediately across all visitors.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handlePreviewHomepage}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-amber-500/30 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Homepage</span>
            </button>
          </div>
        </div>

        {showSavedFeedback && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Homepage CMS Published!</strong> All changes are active and synchronized across public visitors and conversion funnels.
            </span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSection('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'hero'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hero & CTAs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'metrics'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Live Metrics (4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('trust')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'trust'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trust & Badges</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('howItWorks')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'howItWorks'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How It Works (3-Steps)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeSection === 'pricing'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Pricing Section & SLA</span>
        </button>
      </div>

      {/* Main CMS Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: HERO & CTAS */}
        {activeSection === 'hero' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Hero Section Copy & Action Buttons
              </h3>
              <p className="text-xs text-slate-400">
                Topmost value proposition, headline highlights, subhead, and CTAs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kicker Tagline / Top Badge
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.kicker}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, kicker: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Headline (Leading Text)
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.headlineStart}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, headlineStart: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  Headline (Highlighted Green Accent)
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.headlineHighlight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, headlineHighlight: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Headline (Closing Text)
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.headlineEnd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, headlineEnd: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subheadline / Descriptive Paragraph
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.hero.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, description: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.primaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, primaryCtaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  required
                  value={formData.hero.secondaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, secondaryCtaText: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Feature Highlight 1 (Title / Subtitle)
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={formData.hero.feature1Title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, feature1Title: e.target.value },
                      })
                    }
                    placeholder="e.g. Tiered Capacity"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={formData.hero.feature1Desc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, feature1Desc: e.target.value },
                      })
                    }
                    placeholder="e.g. $10k to $15M+ custom facilities"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Feature Highlight 2 (Title / Subtitle)
                </label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={formData.hero.feature2Title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, feature2Title: e.target.value },
                      })
                    }
                    placeholder="e.g. 24-Hr Underwriting"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={formData.hero.feature2Desc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, feature2Desc: e.target.value },
                      })
                    }
                    placeholder="e.g. Direct broker desk assignment"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: LIVE BROKERAGE METRICS */}
        {activeSection === 'metrics' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Live Brokerage Institutional Metrics Strip
              </h3>
              <p className="text-xs text-slate-400">
                Live statistics displayed prominently beneath the hero banner for social proof.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
                >
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                    Metric #{idx + 1}
                  </span>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Value</label>
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Change / Badge
                    </label>
                    <input
                      type="text"
                      value={metric.change}
                      onChange={(e) => updateMetric(idx, 'change', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: TRUST & COMPLIANCE BADGES */}
        {activeSection === 'trust' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Trust, Security & Regulatory Compliance Badges
              </h3>
              <p className="text-xs text-slate-400">
                Institutional accreditation, data security guarantees, and tier-1 banking syndicate references.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section Tag
                </label>
                <input
                  type="text"
                  value={formData.trustCompliance.tag}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trustCompliance: {
                        ...formData.trustCompliance,
                        tag: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section Main Headline
                </label>
                <input
                  type="text"
                  value={formData.trustCompliance.headline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trustCompliance: {
                        ...formData.trustCompliance,
                        headline: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section Subtitle / Description
                </label>
                <input
                  type="text"
                  value={formData.trustCompliance.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trustCompliance: {
                        ...formData.trustCompliance,
                        subtitle: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              {/* 4 Badges */}
              {formData.trustCompliance.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
                >
                  <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold">
                    Badge #{idx + 1}
                  </span>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={badge.title}
                      onChange={(e) => updateBadge(idx, 'title', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={badge.subtitle}
                      onChange={(e) => updateBadge(idx, 'subtitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: HOW IT WORKS (3 STEPS) */}
        {activeSection === 'howItWorks' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                How It Works — 3-Step Walkthrough Flow
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step guidance explaining how subscribers select a tier, verify identity, and disburse capital.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section Tag
                </label>
                <input
                  type="text"
                  value={formData.howItWorks.tag}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      howItWorks: { ...formData.howItWorks, tag: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.howItWorks.headline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      howItWorks: { ...formData.howItWorks, headline: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.howItWorks.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      howItWorks: { ...formData.howItWorks, description: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              {/* 3 Walkthrough Steps */}
              {formData.howItWorks.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="md:col-span-2 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      Step {step.number || `0${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Badge: {step.tag}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Step {idx + 1} Title
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(idx, 'title', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Step {idx + 1} Tagline
                    </label>
                    <input
                      type="text"
                      value={step.tag}
                      onChange={(e) => updateStep(idx, 'tag', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Step {idx + 1} Description
                    </label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => updateStep(idx, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: PRICING SECTION & SLA GUARANTEE */}
        {activeSection === 'pricing' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                Pricing Header & Institutional SLA Guarantee Copy
              </h3>
              <p className="text-xs text-slate-400">
                Customize the copy above the 4 subscription cards and the money-back escrow placement SLA guarantee.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Section Tag
                </label>
                <input
                  type="text"
                  value={formData.pricingHeader.tag}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricingHeader: {
                        ...formData.pricingHeader,
                        tag: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.pricingHeader.headline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricingHeader: {
                        ...formData.pricingHeader,
                        headline: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.pricingHeader.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricingHeader: {
                        ...formData.pricingHeader,
                        description: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  Guarantee Title
                </label>
                <input
                  type="text"
                  value={formData.pricingHeader.guaranteeTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricingHeader: {
                        ...formData.pricingHeader,
                        guaranteeTitle: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  Institutional SLA Money-Back Placement Guarantee Text
                </label>
                <textarea
                  rows={3}
                  value={formData.pricingHeader.guaranteeDesc}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricingHeader: {
                        ...formData.pricingHeader,
                        guaranteeDesc: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-xs text-slate-200 leading-relaxed"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Displayed inside the green guarantee badge beneath the membership matrix.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            All copy is stored persistently in localStorage and context memory.
          </span>

          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Publish Live Homepage Copy</span>
          </button>
        </div>
      </form>
    </div>
  );
};
