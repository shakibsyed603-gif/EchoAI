import { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import { PatientData } from './components/PatientEditModal';
import {
  Scan, Image, Sparkles, Target, ClipboardList, Wand2, Search, HeartPulse, CheckCircle2, RotateCcw, Activity
} from 'lucide-react';
// echoSample used for demo button below
import echoSample from './assets/echo_sample.png';
import Sidebar from './components/Sidebar';
import UploadZone from './components/UploadZone';
import ImagePanel, { FileMetadata } from './components/ImagePanel';
import PatientHistory from './components/PatientHistory';
import LoginScreen from './components/LoginScreen';
import ReportModal from './components/ReportModal';
import { CardiacMeasurementsPanel } from './components/CardiacMeasurementsPanel';
import { AIProcessingTimeline } from './components/AIProcessingTimeline';
import HelpPage from './components/HelpPage';
import SettingsPage from './components/SettingsPage';
import DashboardOverview from './components/DashboardOverview';
import ArchivePage from './components/ArchivePage';
import ReportsPage from './components/ReportsPage';
import { AIFindingsPanel } from './components/AIFindingsPanel';
import { supabase } from './lib/supabase';


// ─── Types ────────────────────────────────────────────────────────────────────
type ProcessingState = 'idle' | 'enhancing' | 'segmenting' | 'done';

// ─── App ─────────────────────────────────────────────────────────────────────
const DEFAULT_PATIENT: PatientData = {
  name: '—',
  id: '—',
  age: '—',
  gender: '—',
  hr: '—',
  bp: '—',
  phone: '—',
  email: '',
  address: '',
  bloodGroup: '—',
  status: 'Active',
};

export default function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [segmentedImage, setSegmentedImage] = useState<string | null>(null);
  const [binaryMask, setBinaryMask] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [aiMetrics, setAiMetrics] = useState<any>(null);
  const [enhanceMetrics, setEnhanceMetrics] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>(DEFAULT_PATIENT);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestStudy = async () => {
      try {
        let query = supabase.from('studies').select('*');
        if (currentStudyId) {
          query = query.eq('id', currentStudyId);
        } else {
          query = query.order('created_at', { ascending: false }).limit(1);
        }

        const { data, error } = await query;
        if (error) {
          console.error("Error fetching study:", error);
          return;
        }

        const study = Array.isArray(data) ? data[0] : data;

        if (study) {
          const loadedPatient: any = {
            name: study.patient_name || DEFAULT_PATIENT.name,
            id: study.patient_id || DEFAULT_PATIENT.id,
            age: study.age || DEFAULT_PATIENT.age,
            gender: study.gender || DEFAULT_PATIENT.gender,
            hr: study.heart_rate || DEFAULT_PATIENT.hr,
            bp: study.blood_pressure || DEFAULT_PATIENT.bp,
            phone: study.phone || DEFAULT_PATIENT.phone,
            email: study.email || DEFAULT_PATIENT.email,
            address: DEFAULT_PATIENT.address,
            bloodGroup: study.blood_group || DEFAULT_PATIENT.bloodGroup,
            status: study.status || DEFAULT_PATIENT.status,
          };
          if (study.height) loadedPatient.height = study.height;
          if (study.weight) loadedPatient.weight = study.weight;

          setPatientData(loadedPatient);
          if (!currentStudyId) {
            setCurrentStudyId(study.id);
          }
        }
      } catch (err) {
        console.error("Failed to load patient from Supabase:", err);
      }
    };

    fetchLatestStudy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on startup

  const handlePatientUpdate = async (updatedPatient: PatientData) => {
    if (currentStudyId) {
      try {
        const updatePayload: any = {
          patient_name: updatedPatient.name,
          patient_id: updatedPatient.id,
          age: updatedPatient.age,
          gender: updatedPatient.gender,
          blood_group: updatedPatient.bloodGroup,
          heart_rate: updatedPatient.hr,
          blood_pressure: updatedPatient.bp,
          phone: updatedPatient.phone,
          email: updatedPatient.email,
        };
        if ('height' in updatedPatient) updatePayload.height = (updatedPatient as any).height;
        if ('weight' in updatedPatient) updatePayload.weight = (updatedPatient as any).weight;

        const { error } = await supabase.from('studies').update(updatePayload).eq('id', currentStudyId);

        if (error) throw error;
        setPatientData(updatedPatient);
        alert('Patient details successfully updated in database!');
      } catch (error: any) {
        console.error('Failed to update patient details in Supabase:', error);
        alert(`Failed to save changes: ${error.message}`);
      }
    } else {
      // If no study created yet, just update local state
      setPatientData(updatedPatient);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) {
      setUploadedFile(null); setOriginalImage(null);
      setEnhancedImage(null); setSegmentedImage(null);
      setProcessingState('idle'); setShowSuccess(false);
      setFileMetadata(null);
      return;
    }
    setUploadedFile(file); setShowSuccess(false);
    setFileMetadata({
      name: file.name,
      type: file.type || 'image/jpeg',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // --- NEW: Upload to Supabase Storage ---
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('echo-studies')
        .upload(`scans/${fileName}`, file);

      if (error) {
        console.error("Supabase Storage Error:", error);
        alert(`WARNING: Supabase upload failed. Did you run the SQL command to allow uploads?\nError: ${error.message}`);
      } else {
        // (Optional) Get the public URL for the database later
        const { data: urlData } = supabase.storage.from('echo-studies').getPublicUrl(`scans/${fileName}`);

        // Create the study record now so the backend can update it later
        const { data: studyData, error: studyError } = await supabase.from('studies').insert([{
          patient_name: 'Patient Scan',
          image_url: urlData.publicUrl || file.name,
          status: 'Uploaded'
        }]).select('id').single();

        if (studyError) {
          console.error('Failed to create study record:', studyError);
        } else if (studyData) {
          setCurrentStudyId(studyData.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
    // ----------------------------------------

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setEnhancedImage(null); setSegmentedImage(null); setProcessingState('idle');
      setAiMetrics(null); setEnhanceMetrics(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleEnhance = useCallback(async () => {
    if (!originalImage || !uploadedFile) return;
    setProcessingState('enhancing');

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      if (currentStudyId) formData.append('study_id', currentStudyId);

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.enhanced_image_base64) {
        setEnhancedImage(data.enhanced_image_base64);
        setEnhanceMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Enhancement failed:', err);
      alert('Could not reach Flask server. Make sure python app.py is running on port 5000.');
    }

    setProcessingState('idle');
  }, [originalImage, uploadedFile, currentStudyId]);

  const handleSegment = useCallback(async () => {
    if (!enhancedImage || !uploadedFile) return;
    setProcessingState('segmenting');

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      if (currentStudyId) formData.append('study_id', currentStudyId);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success' && data.segmented_image_base64) {
        setSegmentedImage(data.segmented_image_base64);
        setBinaryMask(data.binary_mask_base64 || null);
        setAiMetrics(data.metrics);
        setProcessingState('done');
        setShowSuccess(true);
      } else {
        throw new Error(data.error || 'Segmentation failed');
      }
    } catch (err: any) {
      console.error('Segmentation failed:', err);
      alert(err.message || 'Could not reach Flask server. Make sure python app.py is running on port 5000.');
      setProcessingState('idle'); // Revert state on failure
      return; // Do not update Supabase or show success
    }

    // Update study status in Supabase
    if (currentStudyId) {
      try {
        const { error } = await supabase.from('studies').update({
          status: 'Analysis Complete'
        }).eq('id', currentStudyId);
        if (error) console.error('Status update error:', error);
      } catch (err) {
        console.error(err);
      }
    }
  }, [enhancedImage, uploadedFile, aiMetrics, currentStudyId]);

  const handleReset = useCallback(() => {
    setUploadedFile(null); setOriginalImage(null);
    setEnhancedImage(null); setSegmentedImage(null); setBinaryMask(null);
    setProcessingState('idle'); setShowSuccess(false);
    setAiMetrics(null); setEnhanceMetrics(null);
    setCurrentStudyId(null);
  }, []);

  const handleGenerateReport = useCallback(() => {
    setShowReport(true);
  }, []);

  const handleViewArchiveReport = useCallback((study: any) => {
    // Populate the App.tsx state with the study from archive
    setOriginalImage(study.image_url || null);
    setEnhancedImage(study.enhanced_image_url || null);
    setSegmentedImage(study.overlay_image_url || null);
    setBinaryMask(study.segmentation_mask_url || null);

    // Construct metrics object from study
    const metrics: any = {};
    if (study.ejection_fraction) metrics.ejection_fraction = study.ejection_fraction;
    if (study.confidence) metrics.confidence = study.confidence;
    else if (study.confidence_score) metrics.confidence = `${study.confidence_score}%`;
    if (study.id) metrics.report_id = `REP-${study.id.substring(0, 4).toUpperCase()}`;

    setAiMetrics(Object.keys(metrics).length > 0 ? metrics : null);

    // Keep existing patient data but override name and id
    setPatientData(prev => ({
      ...prev,
      id: study.patient_id || 'Not Assigned',
      name: study.patient_name || 'Patient Scan'
    }));

    setCurrentStudyId(study.id);

    setShowReport(true);
  }, []);

  const handleLoadDemo = useCallback(async () => {
    // Convert the imported asset URL into a real File so the backend receives actual image data
    try {
      const response = await fetch(echoSample);
      const blob = await response.blob();
      const file = new File([blob], 'echo_demo_scan.png', { type: 'image/png' });
      setUploadedFile(file);
      setOriginalImage(echoSample);
      setEnhancedImage(null);
      setSegmentedImage(null);
      setProcessingState('idle');
      setShowSuccess(false);
      setFileMetadata({
        name: 'echo_demo_scan.png',
        type: 'image/png',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.error('Failed to load demo scan:', err);
    }
  }, []);

  const canEnhance = !!originalImage && processingState === 'idle';
  const canSegment = !!enhancedImage && processingState === 'idle';

  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-shell">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} patientData={patientData} onPatientUpdate={handlePatientUpdate} />

      <div className="main-content">
        {currentView === 'dashboard' ? (
          <DashboardOverview onViewReport={handleViewArchiveReport} />
        ) : currentView === 'analysis' ? (
          <PatientHistory />
        ) : currentView === 'help' ? (
          <HelpPage />
        ) : currentView === 'settings' ? (
          <SettingsPage />
        ) : currentView === 'archive' ? (
          <ArchivePage onViewReport={handleViewArchiveReport} />
        ) : currentView === 'reports' ? (
          <ReportsPage onViewReport={handleViewArchiveReport} />
        ) : (
          <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                EchoAI Clinical Workstation
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                AI-Powered Echocardiography Clinical Decision Support System
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

              {/* LEFT: 2x2 Image Viewer Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <ImagePanel
                  title=""
                  subtitle=""
                  imageSrc={originalImage}
                  icon={<Scan style={{ width: '100%', height: '100%' }} />}
                  status={originalImage ? (processingState === 'enhancing' ? 'processing' : 'done') : 'idle'}
                  accentColor="blue"
                  delay={0}
                  empty={!originalImage}
                  fileMetadata={fileMetadata}
                />
                <ImagePanel
                  title=""
                  subtitle=""
                  imageSrc={enhancedImage}
                  comparisonImageSrc={originalImage}
                  icon={<Wand2 style={{ width: '100%', height: '100%' }} />}
                  status={enhancedImage ? 'done' : processingState === 'enhancing' ? 'processing' : 'idle'}
                  accentColor="green"
                  delay={100}
                  empty={!enhancedImage}
                  fileMetadata={fileMetadata}
                />
                <ImagePanel
                  title="Overlay View"
                  subtitle="Contours overlaid on enhanced"
                  imageSrc={segmentedImage}
                  icon={<Scan style={{ width: '100%', height: '100%' }} />}
                  status={segmentedImage ? 'done' : processingState === 'segmenting' ? 'processing' : 'idle'}
                  accentColor="purple"
                  delay={200}
                  empty={!segmentedImage}
                  fileMetadata={fileMetadata}
                />
                <ImagePanel
                  title="Segmentation Mask"
                  subtitle="Isolated chamber detection"
                  imageSrc={binaryMask}
                  icon={<Scan style={{ width: '100%', height: '100%' }} />}
                  status={binaryMask ? 'done' : processingState === 'segmenting' ? 'processing' : 'idle'}
                  accentColor="purple"
                  delay={300}
                  empty={!binaryMask}
                  fileMetadata={fileMetadata}
                />
              </div>

              {/* RIGHT: Controls & Clinical Info Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <UploadZone onFileUpload={handleFileUpload} uploadedFile={uploadedFile} onLoadDemo={handleLoadDemo} />

                {uploadedFile && (
                  <div className="card animate-slide-up" style={{ padding: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: 30, height: 30, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles style={{ width: 14, height: 14, color: '#7C3AED' }} />
                      </div>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>AI Pipeline</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '18px', left: '15%', right: '15%', height: 2, background: 'var(--surface-border)', zIndex: 0 }} />

                      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={handleEnhance} disabled={!canEnhance} style={{ width: 36, height: 36, borderRadius: '50%', background: enhancedImage ? '#059669' : canEnhance ? 'var(--surface-card)' : 'var(--surface-base)', border: `2px solid ${enhancedImage ? '#059669' : canEnhance ? '#004B9F' : 'var(--surface-border)'}`, color: enhancedImage ? 'white' : canEnhance ? '#004B9F' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canEnhance ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: canEnhance ? '0 0 0 4px rgba(0,75,159,0.1)' : 'none' }}>
                          {processingState === 'enhancing' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(0,75,159,0.2)', borderTopColor: '#004B9F', borderRadius: '50%' }} /> : enhancedImage ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <Wand2 style={{ width: 16, height: 16 }} />}
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: enhancedImage ? '#059669' : canEnhance ? '#004B9F' : 'var(--text-muted)' }}>1. Denoise</span>
                      </div>

                      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={handleSegment} disabled={!canSegment} style={{ width: 36, height: 36, borderRadius: '50%', background: segmentedImage ? '#059669' : canSegment ? 'var(--surface-card)' : 'var(--surface-base)', border: `2px solid ${segmentedImage ? '#059669' : canSegment ? '#7C3AED' : 'var(--surface-border)'}`, color: segmentedImage ? 'white' : canSegment ? '#7C3AED' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canSegment ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: canSegment ? '0 0 0 4px rgba(124,58,237,0.1)' : 'none' }}>
                          {processingState === 'segmenting' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%' }} /> : segmentedImage ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <Scan style={{ width: 16, height: 16 }} />}
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: segmentedImage ? '#059669' : canSegment ? '#7C3AED' : 'var(--text-muted)' }}>2. Segment</span>
                      </div>

                      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={showSuccess ? handleGenerateReport : undefined} disabled={!showSuccess} style={{ width: 36, height: 36, borderRadius: '50%', background: showSuccess ? 'linear-gradient(135deg, #059669, #047857)' : 'var(--surface-base)', border: `2px solid ${showSuccess ? '#059669' : 'var(--surface-border)'}`, color: showSuccess ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: showSuccess ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: showSuccess ? '0 0 0 4px rgba(5,150,105,0.15)' : 'none' }}>
                          <ClipboardList style={{ width: 16, height: 16 }} />
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: showSuccess ? '#059669' : 'var(--text-muted)' }}>3. Report</span>
                      </div>
                    </div>

                    {(processingState === 'enhancing' || processingState === 'segmenting') && (
                      <div className="animate-fade-in" style={{ padding: '0.75rem', background: 'var(--surface-base)', borderRadius: 8, border: '1px dashed var(--surface-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {processingState === 'enhancing' ? 'Running CNN denoiser (ResNet-50)...' : 'Running U-Net segmentation...'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {processingState === 'enhancing' ? 'GPU active' : 'Tensor cores active'}
                          </span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: processingState === 'enhancing' ? '55%' : '75%', background: processingState === 'enhancing' ? 'linear-gradient(90deg, #004B9F, #38bdf8)' : 'linear-gradient(90deg, #7C3AED, #c084fc)' }} />
                        </div>
                      </div>
                    )}

                    {showSuccess && (
                      <div className="animate-slide-up" style={{ padding: '0.75rem', background: 'rgba(5,150,105,0.06)', borderRadius: 8, border: '1px solid rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 24, height: 24, background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckCircle2 style={{ width: 14, height: 14, color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: '#059669', lineHeight: 1.2 }}>Analysis Complete</p>
                          <p style={{ fontSize: '10px', color: 'rgba(5,150,105,0.8)' }}>Chambers mapped.</p>
                        </div>
                        <button className="btn-secondary" onClick={handleReset} style={{ padding: '0.4rem 0.6rem', fontSize: '10px' }}>
                          <RotateCcw style={{ width: 10, height: 10 }} /> Reset
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="card" style={{ padding: '1rem', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7C3AED, #38bdf8)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ width: 24, height: 24, background: 'rgba(56,189,248,0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56,189,248,0.2)' }}>
                      <Activity style={{ width: 12, height: 12, color: 'var(--accent-blue)' }} />
                    </div>
                    <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>AI Clinical Summary</h4>
                    {showSuccess && <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '9px' }}>READY</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { label: 'Image Quality', value: enhancedImage ? 'Diagnostic' : 'Sub-optimal', icon: Search, color: enhancedImage ? '#059669' : 'var(--warning)', show: !!uploadedFile },
                      { label: 'Noise Level', value: enhanceMetrics?.noise_reduction ? `Reduced by ${enhanceMetrics.noise_reduction}` : 'High', icon: Wand2, color: enhancedImage ? '#059669' : 'var(--warning)', show: !!uploadedFile },
                      { label: 'Ejection Fraction', value: aiMetrics?.ejection_fraction || '—', icon: HeartPulse, color: aiMetrics?.ejection_fraction ? '#ef4444' : 'var(--text-muted)', show: true },
                      { label: 'Segmentation Confidence', value: aiMetrics?.confidence || '—', icon: Target, color: aiMetrics?.confidence ? '#38bdf8' : 'var(--text-muted)', show: true },
                      { label: 'Dice Score', value: aiMetrics?.dice_score ? aiMetrics.dice_score.toFixed(3) : '—', icon: Scan, color: aiMetrics?.dice_score ? '#a78bfa' : 'var(--text-muted)', show: true },
                      { label: 'IoU Score', value: aiMetrics?.iou_score ? aiMetrics.iou_score.toFixed(3) : '—', icon: Image, color: aiMetrics?.iou_score ? '#a78bfa' : 'var(--text-muted)', show: true },
                      { label: 'Processing Time', value: aiMetrics?.processing_time || '—', icon: Sparkles, color: aiMetrics?.processing_time ? '#059669' : 'var(--text-muted)', show: true },
                      { label: 'Review Status', value: showSuccess ? 'Pending Sign-off' : 'Incomplete', icon: ClipboardList, color: showSuccess ? '#f59e0b' : 'var(--text-muted)', show: true },
                    ].filter(item => item.show).map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <item.icon style={{ width: 12, height: 12, color: item.color }} />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}40` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {!segmentedImage && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(56,189,248,0.05)', borderRadius: '6px', border: '1px dashed rgba(56,189,248,0.2)', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Complete the AI Pipeline to generate full clinical metrics.</p>
                    </div>
                  )}
                </div>

                {showSuccess && <AIFindingsPanel aiMetrics={aiMetrics} />}

                <CardiacMeasurementsPanel aiMetrics={aiMetrics} />

              </div>
            </div>

            {/* FULL WIDTH: AI Processing Timeline */}
            <AIProcessingTimeline
              uploadedFile={uploadedFile}
              processingState={processingState}
              enhancedImage={enhancedImage}
              segmentedImage={segmentedImage}
              aiMetrics={aiMetrics}
              showSuccess={showSuccess}
            />
          </div>
        )}
      </div>
      {/* Professional Clinical Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        originalImage={originalImage}
        enhancedImage={enhancedImage}
        segmentedImage={segmentedImage}
        aiMetrics={aiMetrics}
        enhanceMetrics={enhanceMetrics}
        patientData={patientData}
      />
    </div>
  );
}
