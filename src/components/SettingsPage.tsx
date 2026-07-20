import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Settings, Sun, Moon, Save, Brain,
  SlidersHorizontal, Upload, Stamp,
  FileText, HeartPulse,
  ChevronRight, CheckCircle2, Monitor, AlertTriangle, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS PAGE
   Professional clinical settings for EchoAI Workstation
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Default Settings ─────────────────────────────────────────────────────────
const SETTINGS_ID = 'echoai-global';

interface AppSettings {
  theme: string;
  language: string;
  auto_save: boolean;
  enhancement_model: string;
  segmentation_model: string;
  confidence_threshold: number;
  gpu_acceleration: boolean;
  noise_reduction: boolean;
  contrast_enhancement: boolean;
  image_normalization: boolean;
  overlay_opacity: number;
  hospital_name: string;
  cardiologist_name: string;
  department: string;
  hospital_logo_url?: string;
  digital_signature_url?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'en',
  auto_save: true,
  enhancement_model: 'clahe-v2',
  segmentation_model: 'unet-camus',
  confidence_threshold: 85,
  gpu_acceleration: true,
  noise_reduction: true,
  contrast_enhancement: true,
  image_normalization: true,
  overlay_opacity: 65,
  hospital_name: 'EchoAI Cardiac Institute',
  cardiologist_name: '',
  department: 'Cardiology & Cardiac Imaging',
};

// ── Section Wrapper ──────────────────────────────────────────────────────────
function SettingsSection({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      border: '1px solid #E8EDF5',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid #F0F3F8',
      }}>
        <div style={{
          width: 32, height: 32,
          background: 'rgba(46,125,255,0.08)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ width: 15, height: 15, color: '#2E7DFF' }} />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0B1F3A', letterSpacing: '-0.01em' }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: '0.25rem 0' }}>
        {children}
      </div>
    </div>
  );
}

// ── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.875rem 1.25rem',
      gap: '1.5rem',
      borderBottom: '1px solid #F8F9FC',
      transition: 'background 0.1s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFD'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F3A' }}>{label}</p>
        {description && (
          <p style={{ fontSize: '11px', color: '#7F93A8', marginTop: '2px', lineHeight: 1.4 }}>{description}</p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

// ── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24,
        borderRadius: 12,
        border: 'none',
        background: checked ? '#2E7DFF' : '#D1D8E3',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        padding: 0,
      }}
    >
      <div style={{
        width: 18, height: 18,
        borderRadius: '50%',
        background: '#FFFFFF',
        position: 'absolute',
        top: 3,
        left: checked ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

// ── Select Dropdown ──────────────────────────────────────────────────────────
function Select({ value, options, onChange }: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '0.4rem 0.75rem',
        paddingRight: '1.75rem',
        fontSize: '12px',
        fontWeight: 600,
        color: '#0B1F3A',
        background: '#F4F6FA',
        border: '1px solid #E2E7EF',
        borderRadius: 8,
        cursor: 'pointer',
        outline: 'none',
        appearance: 'auto',
        minWidth: 140,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Slider ───────────────────────────────────────────────────────────────────
function Slider({ value, min, max, step, unit, onChange }: {
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 120,
          accentColor: '#2E7DFF',
          cursor: 'pointer',
        }}
      />
      <span style={{
        fontSize: '12px', fontWeight: 700, color: '#0B1F3A',
        fontFamily: "'JetBrains Mono', monospace",
        background: '#F4F6FA',
        padding: '0.2rem 0.5rem',
        borderRadius: 6,
        minWidth: 48,
        textAlign: 'center',
      }}>
        {value}{unit}
      </span>
    </div>
  );
}

// ── Text Input ───────────────────────────────────────────────────────────────
function TextInput({ value, placeholder, onChange }: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '0.4rem 0.75rem',
        fontSize: '12px',
        fontWeight: 600,
        color: '#0B1F3A',
        background: '#F4F6FA',
        border: '1px solid #E2E7EF',
        borderRadius: 8,
        outline: 'none',
        minWidth: 180,
        transition: 'border-color 0.15s',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#2E7DFF'; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E7EF'; }}
    />
  );
}

// ── Info Row (for About section) ─────────────────────────────────────────────
function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.625rem 1.25rem',
      borderBottom: '1px solid #F8F9FC',
    }}>
      <span style={{ fontSize: '12px', color: '#7F93A8', fontWeight: 600 }}>{label}</span>
      <span style={{
        fontSize: '12px', fontWeight: 700, color: color || '#0B1F3A',
        fontFamily: "'JetBrains Mono', monospace",
      }}>{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  // ── General ──
  const [theme, setTheme] = useState(DEFAULT_SETTINGS.theme);
  const [language, setLanguage] = useState(DEFAULT_SETTINGS.language);
  const [autoSave, setAutoSave] = useState(DEFAULT_SETTINGS.auto_save);

  // ── AI Settings ──
  const [enhancementModel, setEnhancementModel] = useState(DEFAULT_SETTINGS.enhancement_model);
  const [segmentationModel, setSegmentationModel] = useState(DEFAULT_SETTINGS.segmentation_model);
  const [confidenceThreshold, setConfidenceThreshold] = useState(DEFAULT_SETTINGS.confidence_threshold);
  const [gpuAcceleration, setGpuAcceleration] = useState(DEFAULT_SETTINGS.gpu_acceleration);

  // ── Image Processing ──
  const [noiseReduction, setNoiseReduction] = useState(DEFAULT_SETTINGS.noise_reduction);
  const [contrastEnhancement, setContrastEnhancement] = useState(DEFAULT_SETTINGS.contrast_enhancement);
  const [imageNormalization, setImageNormalization] = useState(DEFAULT_SETTINGS.image_normalization);
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_SETTINGS.overlay_opacity);

  // ── Report Settings ──
  const [hospitalName, setHospitalName] = useState(DEFAULT_SETTINGS.hospital_name);
  const [cardiologistName, setCardiologistName] = useState(DEFAULT_SETTINGS.cardiologist_name);
  const [department, setDepartment] = useState(DEFAULT_SETTINGS.department);
  const [hospitalLogoUrl, setHospitalLogoUrl] = useState<string>('');
  const [digitalSignatureUrl, setDigitalSignatureUrl] = useState<string>('');

  // ── UI State ──
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // ── Load settings from Supabase on mount ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoadingSettings(true);
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', SETTINGS_ID)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('Settings: failed to load', error);
          // Table might not exist yet — use defaults silently
          setLoadingSettings(false);
          return;
        }

        if (data) {
          // Populate form with saved values (fall back to defaults for missing)
          setTheme(data.theme ?? DEFAULT_SETTINGS.theme);
          setLanguage(data.language ?? DEFAULT_SETTINGS.language);
          setAutoSave(data.auto_save ?? DEFAULT_SETTINGS.auto_save);
          setEnhancementModel(data.enhancement_model ?? DEFAULT_SETTINGS.enhancement_model);
          setSegmentationModel(data.segmentation_model ?? DEFAULT_SETTINGS.segmentation_model);
          setConfidenceThreshold(data.confidence_threshold ?? DEFAULT_SETTINGS.confidence_threshold);
          setGpuAcceleration(data.gpu_acceleration ?? DEFAULT_SETTINGS.gpu_acceleration);
          setNoiseReduction(data.noise_reduction ?? DEFAULT_SETTINGS.noise_reduction);
          setContrastEnhancement(data.contrast_enhancement ?? DEFAULT_SETTINGS.contrast_enhancement);
          setImageNormalization(data.image_normalization ?? DEFAULT_SETTINGS.image_normalization);
          setOverlayOpacity(data.overlay_opacity ?? DEFAULT_SETTINGS.overlay_opacity);
          setHospitalName(data.hospital_name ?? DEFAULT_SETTINGS.hospital_name);
          setCardiologistName(data.cardiologist_name ?? DEFAULT_SETTINGS.cardiologist_name);
          setDepartment(data.department ?? DEFAULT_SETTINGS.department);
          setHospitalLogoUrl(data.hospital_logo_url ?? '');
          setDigitalSignatureUrl(data.digital_signature_url ?? '');
        }
        // If data is null, defaults are already set — no record exists yet
      } catch (err) {
        console.error('Settings: load exception', err);
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    }

    loadSettings();
    return () => { cancelled = true; };
  }, []);

  // ── File Upload Handler ──────────────────────────────────────────────────
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Clear the input value so the same file can be selected again if needed
    event.target.value = '';

    if (type === 'logo') setIsUploadingLogo(true);
    else setIsUploadingSignature(true);
    
    setErrorMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${SETTINGS_ID}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      // Upload to Supabase Storage (assuming 'settings' bucket exists)
      const { error: uploadError } = await supabase.storage
        .from('settings')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('settings')
        .getPublicUrl(filePath);
        
      if (type === 'logo') {
        setHospitalLogoUrl(publicUrlData.publicUrl);
      } else {
        setDigitalSignatureUrl(publicUrlData.publicUrl);
      }
      
      // We don't automatically save to the database here.
      // The user still needs to click "Save Settings".
      
    } catch (err: any) {
      console.error(`Settings: failed to upload ${type}`, err);
      setErrorMessage(`Failed to upload ${type}: ${err.message || 'Unknown error'}`);
    } finally {
      if (type === 'logo') setIsUploadingLogo(false);
      else setIsUploadingSignature(false);
    }
  };

  // ── Save settings to Supabase ────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    setErrorMessage('');

    const payload: AppSettings & { id: string; updated_at: string } = {
      id: SETTINGS_ID,
      theme,
      language,
      auto_save: autoSave,
      enhancement_model: enhancementModel,
      segmentation_model: segmentationModel,
      confidence_threshold: confidenceThreshold,
      gpu_acceleration: gpuAcceleration,
      noise_reduction: noiseReduction,
      contrast_enhancement: contrastEnhancement,
      image_normalization: imageNormalization,
      overlay_opacity: overlayOpacity,
      hospital_name: hospitalName,
      cardiologist_name: cardiologistName,
      department,
      hospital_logo_url: hospitalLogoUrl,
      digital_signature_url: digitalSignatureUrl,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Settings: save failed', error);
        setSaveStatus('error');
        setErrorMessage(error.message || 'Failed to save settings');
        setTimeout(() => setSaveStatus('idle'), 4000);
        return;
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      console.error('Settings: save exception', err);
      setSaveStatus('error');
      setErrorMessage(err?.message || 'Unexpected error saving settings');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  }, [
    theme, language, autoSave,
    enhancementModel, segmentationModel, confidenceThreshold, gpuAcceleration,
    noiseReduction, contrastEnhancement, imageNormalization, overlayOpacity,
    hospitalName, cardiologistName, department, hospitalLogoUrl, digitalSignatureUrl
  ]);

  // ── Save button appearance ───────────────────────────────────────────────
  function getSaveButtonStyle() {
    const base = {
      display: 'flex' as const, alignItems: 'center' as const, gap: '0.5rem',
      padding: '0.625rem 1.25rem',
      color: '#FFFFFF',
      border: 'none' as const,
      borderRadius: 10,
      fontSize: '13px',
      fontWeight: 700,
      cursor: saveStatus === 'saving' ? 'not-allowed' as const : 'pointer' as const,
      transition: 'all 0.2s',
    };

    if (saveStatus === 'saved') return { ...base, background: '#059669', boxShadow: '0 2px 10px rgba(5,150,105,0.3)' };
    if (saveStatus === 'error') return { ...base, background: '#DC2626', boxShadow: '0 2px 10px rgba(220,38,38,0.3)' };
    if (saveStatus === 'saving') return { ...base, background: '#2E7DFF', boxShadow: '0 2px 10px rgba(46,125,255,0.3)', opacity: 0.8 };
    return { ...base, background: '#2E7DFF', boxShadow: '0 2px 10px rgba(46,125,255,0.3)' };
  }

  function getSaveButtonContent() {
    if (saveStatus === 'saving') return <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Saving…</>;
    if (saveStatus === 'saved') return <><CheckCircle2 style={{ width: 15, height: 15 }} /> Saved</>;
    if (saveStatus === 'error') return <><AlertTriangle style={{ width: 15, height: 15 }} /> Error</>;
    return <><Save style={{ width: 15, height: 15 }} /> Save Settings</>;
  }

  return (
    <div style={{
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      background: '#F4F6FA',
    }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '11px', color: '#7F93A8', fontWeight: 600 }}>System</span>
            <ChevronRight style={{ width: 12, height: 12, color: '#7F93A8' }} />
            <span style={{ fontSize: '11px', color: '#2E7DFF', fontWeight: 600 }}>Settings</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Settings
          </h2>
          <p style={{ fontSize: '13px', color: '#7F93A8', marginTop: '0.35rem' }}>
            Configure the EchoAI Clinical Workstation preferences
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            style={getSaveButtonStyle()}
          >
            {getSaveButtonContent()}
          </button>
          {saveStatus === 'error' && errorMessage && (
            <p style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500, maxWidth: 250, textAlign: 'right' }}>
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* ── Loading Overlay ── */}
      {loadingSettings && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#7F93A8' }}>
          <div style={{ width: 24, height: 24, border: '3px solid #E2E7EF', borderTopColor: '#2E7DFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '0.75rem' }} />
          Loading settings…
        </div>
      )}

      {/* ── Settings Grid ── */}
      {!loadingSettings && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1rem',
        alignItems: 'start',
      }}>

        {/* ═══ 1. GENERAL ═══ */}
        <SettingsSection title="General" icon={Settings}>
          <SettingRow label="Theme" description="Switch between light and dark interface">
            <div style={{ display: 'flex', gap: '0.25rem', background: '#F4F6FA', borderRadius: 8, padding: '3px' }}>
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    fontSize: '11px', fontWeight: 600,
                    color: theme === t.id ? '#FFFFFF' : '#7F93A8',
                    background: theme === t.id ? '#0B1F3A' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <t.icon style={{ width: 12, height: 12 }} />
                  {t.label}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Language" description="Interface display language">
            <Select
              value={language}
              options={[
                { label: 'English', value: 'en' },
                { label: 'Hindi', value: 'hi' },
                { label: 'Arabic', value: 'ar' },
                { label: 'Spanish', value: 'es' },
              ]}
              onChange={setLanguage}
            />
          </SettingRow>
          <SettingRow label="Auto Save Analysis" description="Automatically save results after each pipeline step">
            <Toggle checked={autoSave} onChange={setAutoSave} />
          </SettingRow>
        </SettingsSection>

        {/* ═══ 2. AI SETTINGS ═══ */}
        <SettingsSection title="AI Settings" icon={Brain}>
          <SettingRow label="Enhancement Model" description="Select the image enhancement algorithm">
            <Select
              value={enhancementModel}
              options={[
                { label: 'CLAHE v2 (Default)', value: 'clahe-v2' },
                { label: 'CLAHE v1', value: 'clahe-v1' },
                { label: 'Histogram Eq.', value: 'hist-eq' },
                { label: 'Adaptive Median', value: 'adaptive-median' },
              ]}
              onChange={setEnhancementModel}
            />
          </SettingRow>
          <SettingRow label="Segmentation Model" description="Deep learning model for cardiac segmentation">
            <Select
              value={segmentationModel}
              options={[
                { label: 'U-Net CAMUS (Default)', value: 'unet-camus' },
                { label: 'U-Net++', value: 'unet-plus' },
                { label: 'Attention U-Net', value: 'attention-unet' },
                { label: 'DeepLabV3+', value: 'deeplabv3' },
              ]}
              onChange={setSegmentationModel}
            />
          </SettingRow>
          <SettingRow label="AI Confidence Threshold" description="Minimum confidence level for accepting AI predictions">
            <Slider value={confidenceThreshold} min={50} max={99} step={1} unit="%" onChange={setConfidenceThreshold} />
          </SettingRow>
          <SettingRow label="GPU Acceleration" description="Use GPU for faster model inference when available">
            <Toggle checked={gpuAcceleration} onChange={setGpuAcceleration} />
          </SettingRow>
        </SettingsSection>

        {/* ═══ 3. IMAGE PROCESSING ═══ */}
        <SettingsSection title="Image Processing" icon={SlidersHorizontal}>
          <SettingRow label="Noise Reduction" description="Apply speckle noise reduction to ultrasound images">
            <Toggle checked={noiseReduction} onChange={setNoiseReduction} />
          </SettingRow>
          <SettingRow label="Contrast Enhancement" description="Adaptive contrast adjustment for improved visibility">
            <Toggle checked={contrastEnhancement} onChange={setContrastEnhancement} />
          </SettingRow>
          <SettingRow label="Image Normalization" description="Normalize pixel intensity values before processing">
            <Toggle checked={imageNormalization} onChange={setImageNormalization} />
          </SettingRow>
          <SettingRow label="Overlay Opacity" description="Transparency of the segmentation mask overlay">
            <Slider value={overlayOpacity} min={10} max={100} step={5} unit="%" onChange={setOverlayOpacity} />
          </SettingRow>
        </SettingsSection>

        {/* ═══ 4. REPORT SETTINGS ═══ */}
        <SettingsSection title="Report Settings" icon={FileText}>
          <SettingRow label="Hospital Name" description="Displayed on generated clinical reports">
            <TextInput value={hospitalName} placeholder="Enter hospital name" onChange={setHospitalName} />
          </SettingRow>
          <SettingRow label="Cardiologist Name" description="Reviewing physician for report signature">
            <TextInput value={cardiologistName} placeholder="Dr. Full Name" onChange={setCardiologistName} />
          </SettingRow>
          <SettingRow label="Department" description="Clinical department for report headers">
            <TextInput value={department} placeholder="Department name" onChange={setDepartment} />
          </SettingRow>
          <SettingRow label="Hospital Logo" description="Logo displayed on report headers (PNG, SVG)">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {hospitalLogoUrl && (
                <div style={{ 
                  width: 32, height: 32, 
                  background: '#F4F6FA', borderRadius: 6, border: '1px solid #E2E7EF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img src={hospitalLogoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}
              <input 
                type="file" 
                ref={logoInputRef} 
                onChange={(e) => handleFileUpload(e, 'logo')} 
                accept="image/png, image/jpeg, image/jpg, image/svg+xml" 
                style={{ display: 'none' }} 
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  fontSize: '12px', fontWeight: 600,
                  color: '#2E7DFF',
                  background: 'rgba(46,125,255,0.06)',
                  border: '1px solid rgba(46,125,255,0.2)',
                  borderRadius: 8,
                  cursor: isUploadingLogo ? 'not-allowed' : 'pointer',
                  opacity: isUploadingLogo ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!isUploadingLogo) e.currentTarget.style.background = 'rgba(46,125,255,0.12)'; }}
                onMouseLeave={(e) => { if (!isUploadingLogo) e.currentTarget.style.background = 'rgba(46,125,255,0.06)'; }}
              >
                {isUploadingLogo ? (
                  <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Upload style={{ width: 13, height: 13 }} />
                )}
                {isUploadingLogo ? 'Uploading...' : (hospitalLogoUrl ? 'Change' : 'Upload')}
              </button>
            </div>
          </SettingRow>
          <SettingRow label="Digital Signature" description="Electronic signature for report approval">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {digitalSignatureUrl && (
                <div style={{ 
                  height: 32, padding: '0 0.5rem',
                  background: '#F4F6FA', borderRadius: 6, border: '1px solid #E2E7EF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img src={digitalSignatureUrl} alt="Signature" style={{ maxHeight: '24px', objectFit: 'contain' }} />
                </div>
              )}
              <input 
                type="file" 
                ref={signatureInputRef} 
                onChange={(e) => handleFileUpload(e, 'signature')} 
                accept="image/png, image/jpeg, image/jpg" 
                style={{ display: 'none' }} 
              />
              <button
                onClick={() => signatureInputRef.current?.click()}
                disabled={isUploadingSignature}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  fontSize: '12px', fontWeight: 600,
                  color: '#2E7DFF',
                  background: 'rgba(46,125,255,0.06)',
                  border: '1px solid rgba(46,125,255,0.2)',
                  borderRadius: 8,
                  cursor: isUploadingSignature ? 'not-allowed' : 'pointer',
                  opacity: isUploadingSignature ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!isUploadingSignature) e.currentTarget.style.background = 'rgba(46,125,255,0.12)'; }}
                onMouseLeave={(e) => { if (!isUploadingSignature) e.currentTarget.style.background = 'rgba(46,125,255,0.06)'; }}
              >
                {isUploadingSignature ? (
                  <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Stamp style={{ width: 13, height: 13 }} />
                )}
                {isUploadingSignature ? 'Uploading...' : (digitalSignatureUrl ? 'Change' : 'Configure')}
              </button>
            </div>
          </SettingRow>
        </SettingsSection>

        {/* ═══ 5. ABOUT ═══ */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E8EDF5',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          gridColumn: '1 / -1',
        }}>
          {/* About Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0B1F3A, #163A63)',
            padding: '1.5rem',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', right: -15, bottom: -15,
              opacity: 0.04, fontSize: '100px', fontWeight: 900, lineHeight: 1, pointerEvents: 'none',
            }}>♥</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HeartPulse style={{ width: 22, height: 22, color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.015em' }}>
                  Echo<span style={{ color: '#93C5FD' }}>AI</span>
                </h3>
                <p style={{ fontSize: '11px', color: '#B8C7D9' }}>AI-Powered Echocardiography Clinical Workstation</p>
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.65rem',
              background: 'rgba(46,125,255,0.2)',
              borderRadius: 6,
              fontSize: '10px', fontWeight: 700, color: '#93C5FD',
              letterSpacing: '0.04em',
            }}>
              <Monitor style={{ width: 11, height: 11 }} />
              RESEARCH EDITION · v1.0
            </div>
          </div>

          {/* About Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
          }}>
            {/* Left Column */}
            <div style={{ borderRight: '1px solid #F0F3F8' }}>
              <div style={{
                padding: '0.75rem 1.25rem 0.5rem',
                fontSize: '10px', fontWeight: 700, color: '#7F93A8',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                System Information
              </div>
              <InfoRow label="Version" value="1.0.0" color="#2E7DFF" />
              <InfoRow label="Edition" value="Research" />
              <InfoRow label="Frontend" value="React + Vite + TypeScript" />
              <InfoRow label="Backend" value="Python Flask" />
              <InfoRow label="AI Framework" value="TensorFlow / Keras" />
              <InfoRow label="Dataset" value="CAMUS" color="#059669" />
              <InfoRow label="License" value="Research Use Only" />
            </div>
            {/* Right Column */}
            <div>
              <div style={{
                padding: '0.75rem 1.25rem 0.5rem',
                fontSize: '10px', fontWeight: 700, color: '#7F93A8',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Project Team
              </div>
              <InfoRow label="Project Type" value="Final Year Major Project" />
              <InfoRow label="Department" value="Computer Science & Engg." />
              <InfoRow label="Project Guide" value="(Add Guide Name)" />
              <InfoRow label="Team Member 1" value="(Add Name)" />
              <InfoRow label="Team Member 2" value="(Add Name)" />
              <InfoRow label="Team Member 3" value="(Add Name)" />
              <InfoRow label="Team Member 4" value="(Add Name)" />
            </div>
          </div>
        </div>

      </div>
      )}

      {/* Bottom Padding */}
      <div style={{ height: '2rem' }} />
    </div>
  );
}
