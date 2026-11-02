import React, { useState, useEffect, useCallback } from 'react';
import {
  ProjectConfig,
  GeneratedProject,
  EntityConfig,
  SecurityConfig,
  generateSpringBootProject,
  downloadProjectZip,
  validateProjectConfig,
  ConfigValidationError,
  DOMAIN_TEMPLATES,
  createProjectConfigFromTemplate
} from './generator';
import { Navbar, AppTabType } from './components/Navbar';
import { ProjectSettingsTab } from './components/ProjectSettingsTab';
import { EntitiesTab } from './components/EntitiesTab';
import { SecurityTab } from './components/SecurityTab';
import { PreviewTab } from './components/PreviewTab';
import { ValidationBanner } from './components/ValidationBanner';
import { DatabaseDesignerTab } from './components/DatabaseDesignerTab';
import { StartupBuilderTab } from './components/StartupBuilderTab';
import { TemplatesTab } from './components/TemplatesTab';
import { SavedProjectsTab } from './components/SavedProjectsTab';
import { DocumentationTab } from './components/DocumentationTab';
import { DashboardTab } from './components/DashboardTab';
import { CheckCircle2, Download } from 'lucide-react';

const INITIAL_PROJECT_CONFIG: ProjectConfig = {
  projectName: 'demo-backend',
  groupId: 'com.example',
  artifactId: 'demo-backend',
  packageName: 'com.example.demobackend',
  description: 'Production-ready Spring Boot backend with JPA persistence, REST APIs, and Spring Security.',
  javaVersion: '17',
  springBootVersion: '3.3.0',
  database: 'postgresql',
  options: {
    enableDtos: true,
    enableValidation: true,
    enableGlobalExceptionHandler: true,
    enableSwagger: true,
    enablePostman: true,
    enablePagination: true,
    serverPort: 8080
  },
  security: {
    enabled: true,
    jwtSecretEnvVar: 'JWT_SECRET',
    tokenExpirationMinutes: 1440,
    enableRegistration: true,
    corsAllowedOrigins: ['http://localhost:3000', 'http://localhost:5173']
  },
  entities: [
    {
      name: 'Product',
      tableName: 'products',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 },
        { name: 'sku', type: 'String', required: true, unique: true, length: 50 },
        { name: 'price', type: 'BigDecimal', required: true, precision: 10, scale: 2 },
        { name: 'stockQuantity', type: 'Integer', required: true, min: 0 },
        { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
      ],
      relationships: [
        {
          name: 'category',
          type: 'MANY_TO_ONE',
          targetEntity: 'Category',
          required: false,
          isOwningSide: true,
          joinColumnName: 'category_id'
        }
      ]
    },
    {
      name: 'Category',
      tableName: 'categories',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      fields: [
        { name: 'name', type: 'String', required: true, unique: true, length: 50 },
        { name: 'description', type: 'String', required: false, length: 255 }
      ],
      relationships: [
        {
          name: 'products',
          type: 'ONE_TO_MANY',
          targetEntity: 'Product',
          mappedBy: 'category'
        }
      ]
    }
  ]
};

export default function App() {
  const [config, setConfig] = useState<ProjectConfig>(INITIAL_PROJECT_CONFIG);
  const [activeTab, setActiveTab] = useState<AppTabType>('dashboard');
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('ECOMMERCE');
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<{
    filename: string;
    sizeBytes: number;
  } | null>(null);

  // Validate configuration whenever it changes
  const runValidation = useCallback((candidate: ProjectConfig): string[] => {
    try {
      validateProjectConfig(candidate);
      return [];
    } catch (err) {
      if (err instanceof ConfigValidationError) {
        return err.errors;
      }
      return [err instanceof Error ? err.message : String(err)];
    }
  }, []);

  const handleConfigChange = (partial: Partial<ProjectConfig>) => {
    const updated = {
      ...config,
      ...partial
    };
    setConfig(updated);
    setIsStale(true);
    setValidationErrors(runValidation(updated));
  };

  const handleEntitiesChange = (updatedEntities: EntityConfig[]) => {
    handleConfigChange({ entities: updatedEntities });
  };

  const handleSecurityChange = (updatedSecurity: SecurityConfig) => {
    handleConfigChange({ security: updatedSecurity });
  };

  const handleApplyTemplate = (templateKey: string) => {
    const tmpl = DOMAIN_TEMPLATES[templateKey];
    if (!tmpl) return;

    const newConfig = createProjectConfigFromTemplate(templateKey, {
      database: config.database,
      security: config.security
    });

    setConfig(newConfig);
    setActiveTemplateKey(templateKey);
    setValidationErrors(runValidation(newConfig));

    try {
      const generated = generateSpringBootProject(newConfig);
      setGeneratedProject(generated);
      setIsStale(false);
    } catch {
      setIsStale(true);
    }

    setActiveTab('preview');
  };

  const handleApplyStartupConfig = (newConfig: ProjectConfig) => {
    setConfig(newConfig);
    setValidationErrors(runValidation(newConfig));

    try {
      const generated = generateSpringBootProject(newConfig);
      setGeneratedProject(generated);
      setIsStale(false);
    } catch {
      setIsStale(true);
    }

    setActiveTab('preview');
  };

  const handleLoadSavedProject = (loadedConfig: ProjectConfig) => {
    setConfig(loadedConfig);
    setValidationErrors(runValidation(loadedConfig));

    try {
      const generated = generateSpringBootProject(loadedConfig);
      setGeneratedProject(generated);
      setIsStale(false);
    } catch {
      setIsStale(true);
    }

    setActiveTab('settings');
  };

  const handleGenerate = () => {
    const errors = runValidation(config);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsGenerating(true);
    setValidationErrors([]);

    try {
      const result = generateSpringBootProject(config);
      setGeneratedProject(result);
      setIsStale(false);
      setActiveTab('preview');
    } catch (err) {
      if (err instanceof ConfigValidationError) {
        setValidationErrors(err.errors);
      } else {
        setValidationErrors([err instanceof Error ? err.message : String(err)]);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!generatedProject || isStale) {
      try {
        const result = generateSpringBootProject(config);
        setGeneratedProject(result);
        setIsStale(false);
      } catch (err) {
        setValidationErrors([`Validation error: ${err instanceof Error ? err.message : String(err)}`]);
        return;
      }
    }

    const targetToDownload = generatedProject || config;
    setIsDownloading(true);

    try {
      const result = await downloadProjectZip(targetToDownload);
      setDownloadSuccessNotice(result);
      setTimeout(() => setDownloadSuccessNotice(null), 5000);
    } catch (err) {
      setValidationErrors([`ZIP packaging failed: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setIsDownloading(false);
    }
  };

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Pre-generate initial project on mount so user can preview immediately
  useEffect(() => {
    try {
      const initial = generateSpringBootProject(INITIAL_PROJECT_CONFIG);
      setGeneratedProject(initial);
      setIsStale(false);
    } catch {
      // Ignore initial validation if any
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onApplyTemplate={handleApplyTemplate}
        onGenerate={handleGenerate}
        onDownload={handleDownloadZip}
        isGenerating={isGenerating}
        isDownloading={isDownloading}
        generatedProject={generatedProject}
        isStale={isStale}
        validationErrorsCount={validationErrors.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation Errors Alert Banner */}
        <ValidationBanner errors={validationErrors} />

        {/* Download Success Notice */}
        {downloadSuccessNotice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-200 shadow-md flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-semibold text-white">ZIP Package Generated:</span>{' '}
                <span className="font-mono text-emerald-300">{downloadSuccessNotice.filename}</span> (
                {(downloadSuccessNotice.sizeBytes / 1024).toFixed(1)} KB)
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-medium">Ready to extract & run</span>
          </div>
        )}

        {/* Dynamic SaaS Views */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            config={config}
            onNavigateTab={setActiveTab}
            onLoadTemplate={handleApplyTemplate}
            onDownload={handleDownloadZip}
            isDownloading={isDownloading}
          />
        )}

        {activeTab === 'startup' && (
          <StartupBuilderTab
            currentConfig={config}
            onApplyStartupConfig={handleApplyStartupConfig}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseDesignerTab
            config={config}
            onNavigateToEntities={() => setActiveTab('entities')}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab
            onLoadTemplate={handleApplyTemplate}
            activeTemplateKey={activeTemplateKey}
          />
        )}

        {activeTab === 'saved' && (
          <SavedProjectsTab
            currentConfig={config}
            onLoadProject={handleLoadSavedProject}
          />
        )}

        {activeTab === 'docs' && <DocumentationTab />}

        {activeTab === 'settings' && (
          <ProjectSettingsTab config={config} onChange={handleConfigChange} />
        )}

        {activeTab === 'entities' && (
          <EntitiesTab config={config} onChange={handleEntitiesChange} />
        )}

        {activeTab === 'security' && (
          <SecurityTab config={config} onChange={handleSecurityChange} />
        )}

        {activeTab === 'preview' && (
          <PreviewTab
            generatedProject={generatedProject}
            onGenerate={handleGenerate}
            onDownloadZip={handleDownloadZip}
            isGenerating={isGenerating}
            isDownloading={isDownloading}
            isStale={isStale}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Spring Boot Backend Generator SaaS</span>
            <span>•</span>
            <span>Java 17 / 21 LTS</span>
            <span>•</span>
            <span>PostgreSQL / MySQL / H2</span>
          </div>
          <div>
            <span>Stateless Spring Security 6 • Swagger OpenAPI 3 • Postman Collection Included</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
