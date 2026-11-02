import React, { useState, useMemo } from 'react';
import {
  StartupIndustry,
  StartupBusinessModel,
  StartupConfig,
  ProjectConfig,
  DatabaseType,
  JavaVersion,
  SpringBootVersion,
  QualityReport,
  QualityCheckItem
} from '../generator/types';
import {
  INDUSTRY_PRESETS,
  BUSINESS_MODELS,
  buildStartupProjectConfig,
  getStartupReferenceProfile
} from '../generator/startup/startupPresets';
import {
  generateSpringBootProject,
  validateGeneratedProjectQuality
} from '../generator/index';
import { downloadProjectZip } from '../generator/download';
import {
  Rocket,
  Shield,
  CreditCard,
  Bell,
  Cloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Users,
  Check,
  Plus,
  Trash2,
  Cpu,
  Layers,
  FileCheck2,
  AlertTriangle,
  Download,
  Info,
  CheckCheck
} from 'lucide-react';

interface StartupBuilderTabProps {
  currentConfig: ProjectConfig;
  onApplyStartupConfig: (newConfig: ProjectConfig) => void;
}

export const StartupBuilderTab: React.FC<StartupBuilderTabProps> = ({
  currentConfig,
  onApplyStartupConfig
}) => {
  const [industry, setIndustry] = useState<StartupIndustry>(
    currentConfig.startup?.industry || 'SAAS'
  );
  const [businessModel, setBusinessModel] = useState<StartupBusinessModel>(
    currentConfig.startup?.businessModel || 'B2B_SAAS'
  );
  const [database, setDatabase] = useState<DatabaseType>(
    currentConfig.database || 'postgresql'
  );
  const [javaVersion, setJavaVersion] = useState<JavaVersion>(
    currentConfig.javaVersion || '17'
  );
  const [springBootVersion, setSpringBootVersion] = useState<SpringBootVersion>(
    currentConfig.springBootVersion || '3.3.0'
  );

  const selectedPreset = INDUSTRY_PRESETS[industry];
  const selectedModel = BUSINESS_MODELS[businessModel];
  const refProfile = getStartupReferenceProfile(industry);

  const [paymentGateway, setPaymentGateway] = useState<
    'stripe' | 'paypal' | 'razorpay' | 'none'
  >(selectedPreset.recommendedPayment);
  const [notificationService, setNotificationService] = useState<
    'twilio' | 'sendgrid' | 'firebase' | 'none'
  >(selectedPreset.recommendedNotification);
  const [storageService, setStorageService] = useState<'s3' | 'cloudinary' | 'local'>(
    selectedPreset.recommendedStorage
  );

  const [roles, setRoles] = useState<string[]>(selectedPreset.defaultRoles);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [complianceNotes, setComplianceNotes] = useState<Array<'GDPR' | 'HIPAA' | 'PCI_DSS' | 'SOC2'>>(
    selectedPreset.complianceBadges
  );

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Update defaults when industry changes
  const handleSelectIndustry = (newInd: StartupIndustry) => {
    setIndustry(newInd);
    const p = INDUSTRY_PRESETS[newInd];
    setDatabase(p.recommendedDb);
    setPaymentGateway(p.recommendedPayment);
    setNotificationService(p.recommendedNotification);
    setStorageService(p.recommendedStorage);
    setRoles(p.defaultRoles);
    setComplianceNotes(p.complianceBadges);
  };

  const handleAddRole = () => {
    if (!newRoleInput.trim()) return;
    const formatted = newRoleInput.trim().toUpperCase().startsWith('ROLE_')
      ? newRoleInput.trim().toUpperCase()
      : `ROLE_${newRoleInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;

    if (!roles.includes(formatted)) {
      setRoles([...roles, formatted]);
    }
    setNewRoleInput('');
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setRoles(roles.filter(r => r !== roleToRemove));
  };

  const toggleCompliance = (badge: 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'SOC2') => {
    if (complianceNotes.includes(badge)) {
      setComplianceNotes(complianceNotes.filter(b => b !== badge));
    } else {
      setComplianceNotes([...complianceNotes, badge]);
    }
  };

  // Build current candidate project configuration
  const candidateConfig = useMemo(() => {
    const startup: StartupConfig = {
      industry,
      businessModel,
      targetAudience: `${selectedPreset.name} Users`,
      integrations: {
        paymentGateway,
        notificationService,
        storageService,
        complianceNotes,
        userRoles: roles
      }
    };

    return buildStartupProjectConfig(startup, {
      projectName: currentConfig.projectName || `${industry.toLowerCase()}-startup-backend`,
      groupId: currentConfig.groupId || 'com.startup',
      database,
      javaVersion,
      springBootVersion
    });
  }, [industry, businessModel, database, javaVersion, springBootVersion, paymentGateway, notificationService, storageService, complianceNotes, roles, currentConfig.projectName, currentConfig.groupId, selectedPreset.name]);

  // Live quality verification report
  const qualityReport: QualityReport = useMemo(() => {
    try {
      const generated = generateSpringBootProject(candidateConfig);
      return validateGeneratedProjectQuality(generated.files, candidateConfig);
    } catch {
      return {
        isValid: false,
        score: 0,
        checks: [],
        warnings: ['Failed to compute pre-download verification'],
        totalFiles: 0
      };
    }
  }, [candidateConfig]);

  const handleApplyPreset = () => {
    onApplyStartupConfig(candidateConfig);
  };

  const handleDownloadDirect = async () => {
    try {
      setIsDownloading(true);
      const generated = generateSpringBootProject(candidateConfig);
      await downloadProjectZip(generated);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 p-6 sm:p-8 border border-emerald-500/20 overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Startup Architecture Engine • Phase 10 Quality Verified</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Launch Your Startup Backend in Minutes
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Select an industry and business model. The platform configures full transactional business logic,
            strict relationship integrity, Spring Security 6 JWT authentication, Swagger docs, Postman collections,
            and third-party provider abstractions.
          </p>
        </div>
      </div>

      {/* Step 1: Industry Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Select Your Startup Industry</h3>
          </div>
          {refProfile && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-medium">
              Reference Profile Available ({refProfile.entities.length} Entities)
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Pre-packages domain entities, relationship constraints, sample REST endpoints, and security rules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(Object.keys(INDUSTRY_PRESETS) as StartupIndustry[]).map(indKey => {
            const preset = INDUSTRY_PRESETS[indKey];
            const isSelected = industry === indKey;
            const profile = getStartupReferenceProfile(indKey);

            return (
              <button
                key={indKey}
                type="button"
                onClick={() => handleSelectIndustry(indKey)}
                className={`p-4 rounded-xl text-left border transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{preset.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.tagline}</p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {preset.recommendedDb.toUpperCase()}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {profile ? `${profile.entities.length} Entities` : `${preset.defaultRoles.length} Roles`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Business Model Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
            2
          </div>
          <h3 className="text-lg font-bold text-white">Select Your Business Model</h3>
        </div>
        <p className="text-xs text-slate-400">
          Dictates tenant scoping, data access boundaries, and transactional state machines.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(BUSINESS_MODELS) as StartupBusinessModel[]).map(modelKey => {
            const model = BUSINESS_MODELS[modelKey];
            const isSelected = businessModel === modelKey;

            return (
              <button
                key={modelKey}
                type="button"
                onClick={() => setBusinessModel(modelKey)}
                className={`p-4 rounded-xl text-left border transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{model.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{model.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Architecture Highlights:</div>
                  <div className="flex flex-wrap gap-1">
                    {model.keyConcerns.slice(0, 2).map((c, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Reference Architecture & Business Rules Preview */}
      {refProfile && (
        <div className="space-y-4 p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">{refProfile.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{refProfile.tagline}</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
              {refProfile.entities.length} Domain Entities • Workflow Controller & Service
            </span>
          </div>

          {/* Regulatory Disclaimer Banner if present */}
          {refProfile.disclaimer && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Architecture Notice: </span>
                {refProfile.disclaimer}
              </div>
            </div>
          )}

          {/* Business Rules Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              Production Business Logic & Workflow Constraints
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {refProfile.businessRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entities Preview */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Relational Entities & Models ({refProfile.entities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {refProfile.entities.map(e => (
                <div key={e.name} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-cyan-200 font-mono flex items-center gap-1.5">
                  <span>{e.name}</span>
                  <span className="text-[10px] text-slate-400">({e.fields.length}f)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Technical Stack Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
            3
          </div>
          <h3 className="text-lg font-bold text-white">Database & Runtime Stack</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Database */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Target Database
            </label>
            <select
              value={database}
              onChange={e => setDatabase(e.target.value as DatabaseType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="postgresql">PostgreSQL 16 (Recommended for Production)</option>
              <option value="mysql">MySQL 8.0</option>
              <option value="h2">H2 (In-Memory Rapid Prototyping)</option>
            </select>
          </div>

          {/* Java Version */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Java LTS Runtime
            </label>
            <select
              value={javaVersion}
              onChange={e => setJavaVersion(e.target.value as JavaVersion)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="17">Java 17 LTS (Default)</option>
              <option value="21">Java 21 LTS (Virtual Threads)</option>
            </select>
          </div>

          {/* Spring Boot Version */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-indigo-400" />
              Spring Boot Version
            </label>
            <select
              value={springBootVersion}
              onChange={e => setSpringBootVersion(e.target.value as SpringBootVersion)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="3.3.0">Spring Boot 3.3.0</option>
              <option value="3.4.0">Spring Boot 3.4.0</option>
              <option value="3.2.5">Spring Boot 3.2.5</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 5: Third-Party Integrations & Roles */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Integrations & Access Control
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pre-configures production interfaces and safe environment variables in <span className="font-mono text-cyan-300">.env.example</span>.
          </p>
        </div>

        {/* Roles Configuration */}
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            Configured Security Roles
          </label>

          <div className="flex flex-wrap gap-2">
            {roles.map(r => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300"
              >
                {r}
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(r)}
                    className="hover:text-red-400 transition"
                    title="Remove Role"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              placeholder="e.g. ROLE_MANAGER"
              value={newRoleInput}
              onChange={e => setNewRoleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddRole}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Integrations Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              Payment Gateway
            </label>
            <select
              value={paymentGateway}
              onChange={e => setPaymentGateway(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="stripe">Stripe (PaymentGateway Abstraction)</option>
              <option value="paypal">PayPal</option>
              <option value="razorpay">Razorpay</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              Notification Service
            </label>
            <select
              value={notificationService}
              onChange={e => setNotificationService(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="sendgrid">SendGrid (Transactional Email)</option>
              <option value="twilio">Twilio (SMS / WhatsApp)</option>
              <option value="firebase">Firebase Cloud Messaging</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-slate-400" />
              Object / Asset Storage
            </label>
            <select
              value={storageService}
              onChange={e => setStorageService(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="s3">AWS S3 / Compatible (StorageService)</option>
              <option value="cloudinary">Cloudinary</option>
              <option value="local">Local File Storage</option>
            </select>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <label className="block text-xs font-medium text-slate-400">Compliance & Regulatory Standards</label>
          <div className="flex flex-wrap gap-2">
            {(['GDPR', 'HIPAA', 'PCI_DSS', 'SOC2'] as const).map(badge => {
              const active = complianceNotes.includes(badge);
              return (
                <button
                  key={badge}
                  type="button"
                  onClick={() => toggleCompliance(badge)}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-medium border transition ${
                    active
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {badge.replace('_', '-')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pre-Download Quality Verification Report Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Pre-Download Project Quality Report</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated structural verification of Maven dependencies, package hierarchy, entity wiring, and hygiene.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">{qualityReport.score}%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Quality Score</div>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${qualityReport.isValid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
              {qualityReport.isValid ? 'PASSING' : 'NEEDS ATTENTION'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {qualityReport.checks.map((chk: QualityCheckItem) => (
            <div
              key={chk.id}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                chk.passed
                  ? 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                  : 'bg-red-950/20 border-red-500/30 text-red-300'
              }`}
            >
              {chk.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-white">{chk.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{chk.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            Generate {selectedPreset.name} Project
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Packages full Spring Boot 3 backend with {candidateConfig.entities.length} relational entities,
            business workflow controller & service, and {roles.length} security roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleApplyPreset}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition"
          >
            Apply to Designer
          </button>

          <button
            type="button"
            onClick={handleDownloadDirect}
            disabled={isDownloading}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">Generating ZIP...</span>
            ) : downloadSuccess ? (
              <span className="flex items-center gap-2 text-slate-950">
                <Check className="w-4 h-4" /> Download Started!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Backend ZIP
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
