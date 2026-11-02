import React from 'react';
import { ProjectConfig, SecurityConfig } from '../generator/types';
import { Shield, KeyRound, Lock, Info, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface SecurityTabProps {
  config: ProjectConfig;
  onChange: (securityConfig: SecurityConfig) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ config, onChange }) => {
  const security = config.security ?? {
    enabled: false,
    jwtSecretEnvVar: 'JWT_SECRET',
    tokenExpirationMinutes: 1440,
    enableRegistration: true,
    corsAllowedOrigins: ['http://localhost:3000', 'http://localhost:5173']
  };

  const handleToggle = (enabled: boolean) => {
    onChange({
      ...security,
      enabled
    });
  };

  const handleChange = (key: keyof SecurityConfig, value: any) => {
    onChange({
      ...security,
      [key]: value
    });
  };

  const handleCorsChange = (corsStr: string) => {
    const origins = corsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleChange('corsAllowedOrigins', origins);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Security Master Toggle Card */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div
              className={`p-2.5 rounded-lg border ${
                security.enabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Shield className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                <span>Spring Security 6 & JJWT Authentication</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium border ${
                    security.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {security.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Generates a robust, production-grade security architecture: Stateless JWT bearer tokens,
                BCrypt password encryption, <code className="text-slate-300">AppUser</code> entity & repository,
                <code className="text-slate-300">/api/auth/login</code> and <code className="text-slate-300">/api/auth/register</code> endpoints,
                and comprehensive MockMvc security unit tests.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="ml-4 shrink-0 flex items-center">
            <button
              type="button"
              role="switch"
              aria-checked={security.enabled}
              onClick={() => handleToggle(!security.enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                security.enabled ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
              aria-label="Toggle Spring Security and JWT"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  security.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Security Parameters (shown if enabled) */}
      {security.enabled && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800/80">
            <KeyRound className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h3 className="text-base font-semibold text-white">Security & Token Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JWT Secret Environment Variable */}
            <div>
              <label
                htmlFor="jwt-env-var"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                JWT Secret Environment Variable <span className="text-rose-400">*</span>
              </label>
              <input
                id="jwt-env-var"
                type="text"
                value={security.jwtSecretEnvVar || 'JWT_SECRET'}
                onChange={(e) => handleChange('jwtSecretEnvVar', e.target.value)}
                aria-describedby="jwt-env-var-desc"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono"
                placeholder="JWT_SECRET"
              />
              <p id="jwt-env-var-desc" className="text-[11px] text-slate-400 mt-1">
                Environment variable injected at runtime into <code className="text-slate-300">application.properties</code> as <code className="text-slate-300">${'{' + (security.jwtSecretEnvVar || 'JWT_SECRET') + '}'}</code>.
              </p>
            </div>

            {/* Token Expiration Minutes */}
            <div>
              <label
                htmlFor="jwt-exp-minutes"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Token Expiration (Minutes) <span className="text-rose-400">*</span>
              </label>
              <input
                id="jwt-exp-minutes"
                type="number"
                min={1}
                max={525600}
                value={security.tokenExpirationMinutes ?? 1440}
                onChange={(e) =>
                  handleChange('tokenExpirationMinutes', parseInt(e.target.value, 10) || 60)
                }
                aria-describedby="jwt-exp-desc"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono"
              />
              <p id="jwt-exp-desc" className="text-[11px] text-slate-400 mt-1">
                Default: 1440 minutes (24 hours). Configured as <code className="text-slate-300">security.jwt.expiration-ms</code>.
              </p>
            </div>

            {/* Public Registration Toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 text-xs text-slate-200 cursor-pointer p-3 bg-slate-950 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={security.enableRegistration ?? true}
                  onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50"
                />
                <div>
                  <span className="font-medium text-white block">
                    Enable Public Self-Registration Endpoint (<code className="text-emerald-400">POST /api/auth/register</code>)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Permits anonymous users to create new accounts with BCrypt-hashed passwords and assigned USER roles.
                  </span>
                </div>
              </label>
            </div>

            {/* Allowed CORS Origins */}
            <div className="md:col-span-2">
              <label
                htmlFor="cors-origins"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                CORS Allowed Origins (comma-separated)
              </label>
              <input
                id="cors-origins"
                type="text"
                value={(security.corsAllowedOrigins || []).join(', ')}
                onChange={(e) => handleCorsChange(e.target.value)}
                aria-describedby="cors-origins-desc"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono"
                placeholder="http://localhost:3000, http://localhost:5173"
              />
              <p id="cors-origins-desc" className="text-[11px] text-slate-400 mt-1">
                Configured in SecurityConfig to allow cross-origin requests from frontend single-page apps.
              </p>
            </div>
          </div>

          {/* Architecture & Secrets Safety Explainer */}
          <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-4 text-xs text-sky-200 space-y-2">
            <div className="flex items-center space-x-2 text-sky-300 font-semibold">
              <Info className="w-4 h-4" aria-hidden="true" />
              <span>Zero-Secret Architecture & Production Security Guide</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              The generator strictly avoids hardcoding secrets into Git repositories or <code className="text-sky-300">application.properties</code>.
              Before launching the generated Spring Boot app, generate a secure random 256-bit base64 key in your terminal:
            </p>
            <div className="bg-slate-950/80 rounded p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800">
              <code>export {security.jwtSecretEnvVar || 'JWT_SECRET'}="$(openssl rand -base64 32)"</code>
              <br />
              <code className="text-slate-400">./mvnw spring-boot:run</code>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Stateless JWT Filter per request</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Modern JJWT 0.12.5 API with HMAC-SHA256</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>BCrypt password hashing (never plaintext)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Automated MockMvc & Unit tests included</span>
              </li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};
