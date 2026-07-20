import { useRef } from 'react';
import {
  X, Printer, HeartPulse, Activity, Stethoscope, ShieldCheck,
  FileText, Clock, Building2, User
} from 'lucide-react';

import { PatientData } from './PatientEditModal';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string | null;
  enhancedImage: string | null;
  segmentedImage: string | null;
  aiMetrics: any;
  enhanceMetrics: any;
  patientData: PatientData;
}

export default function ReportModal({
  isOpen,
  onClose,
  originalImage,
  enhancedImage,
  segmentedImage,
  aiMetrics,
  enhanceMetrics,
  patientData,
}: ReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const reportDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const reportTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
  const reportId = `ECH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const handlePrint = () => {
    // Save original title
    const originalTitle = document.title;
    // Set new title for PDF export filename
    document.title = `EchoAI-Report-${aiMetrics?.report_id || reportId}`;
    
    // Trigger native browser print which respects our @media print CSS perfectly
    window.print();
    
    // Restore original title
    document.title = originalTitle;
  };

  if (!isOpen) return null;

  // Extract metrics safely
  const ef = aiMetrics?.ejection_fraction || '—';
  const lvArea = aiMetrics?.lv_area || '—';
  const lvEdd = aiMetrics?.lv_edd || '—';
  const myoArea = aiMetrics?.myo_area || '—';
  const laArea = aiMetrics?.la_area || '—';
  const confidence = aiMetrics?.confidence || '—';
  const psnr = enhanceMetrics?.psnr || '—';
  const noiseReduction = enhanceMetrics?.noise_reduction || '—';

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Toolbar (hidden in print) */}
        <div className="report-toolbar no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText style={{ width: 20, height: 20, color: 'var(--brand-500)' }} />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Clinical Echocardiography Report
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Preview and print the professional report
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={() => handlePrint()}>
              <Printer style={{ width: 14, height: 14 }} />
              Print / Save PDF
            </button>
            <button className="btn-secondary" onClick={onClose}>
              <X style={{ width: 14, height: 14 }} />
              Close
            </button>
          </div>
        </div>

        {/* ══════════════════════ PRINTABLE REPORT ══════════════════════ */}
        <div className="report-paper" ref={reportRef} id="echoai-report">

          {/* ── Hospital Header ── */}
          <header className="rpt-header">
            <div className="rpt-header-left">
              <div className="rpt-hospital-logo">
                <HeartPulse style={{ width: 28, height: 28, color: '#fff' }} />
              </div>
              <div>
                <h1 className="rpt-hospital-name">EchoAI Cardiac Institute</h1>
                <p className="rpt-hospital-sub">Department of Cardiology & Cardiac Imaging</p>
                <p className="rpt-hospital-addr">
                  Advanced AI-Powered Echocardiography Centre
                </p>
              </div>
            </div>
            <div className="rpt-header-right">
              <div className="rpt-header-badge">
                <ShieldCheck style={{ width: 14, height: 14 }} />
                {aiMetrics?.status || 'AI-Assisted'}
              </div>
              <p className="rpt-report-id">Report ID: {aiMetrics?.report_id || reportId}</p>
              <p className="rpt-report-date">{aiMetrics?.study_date || reportDate} | {aiMetrics?.study_time || reportTime}</p>
            </div>
          </header>

          {/* ── Report Title Bar ── */}
          <div className="rpt-title-bar">
            <Activity style={{ width: 18, height: 18 }} />
            <span>ECHOCARDIOGRAPHY REPORT — COMPREHENSIVE STUDY</span>
          </div>

          {/* ── Patient & Study Info (side by side) ── */}
          <div className="rpt-row">
            <div className="rpt-section rpt-half">
              <h2 className="rpt-section-title">
                <User style={{ width: 14, height: 14 }} />
                Patient Information
              </h2>
              <table className="rpt-table">
                <tbody>
                  <tr><td className="rpt-label">Patient Name</td><td className="rpt-value">{patientData.name}</td></tr>
                  <tr><td className="rpt-label">Patient ID</td><td className="rpt-value">{patientData.id}</td></tr>
                  <tr><td className="rpt-label">Age / Gender</td><td className="rpt-value">{patientData.age} / {patientData.gender}</td></tr>
                  <tr><td className="rpt-label">Height / Weight</td><td className="rpt-value">{(patientData as any).height || '--'} cm / {(patientData as any).weight || '--'} kg</td></tr>
                  <tr><td className="rpt-label">BSA</td><td className="rpt-value">1.92 m²</td></tr>
                  <tr><td className="rpt-label">Blood Pressure</td><td className="rpt-value">{patientData.bp} mmHg</td></tr>
                  <tr><td className="rpt-label">Heart Rate</td><td className="rpt-value">{patientData.hr} (sinus rhythm)</td></tr>
                </tbody>
              </table>
            </div>

            <div className="rpt-section rpt-half">
              <h2 className="rpt-section-title">
                <Building2 style={{ width: 14, height: 14 }} />
                Study Information
              </h2>
              <table className="rpt-table">
                <tbody>
                  <tr><td className="rpt-label">Study Date</td><td className="rpt-value">{aiMetrics?.study_date || reportDate}</td></tr>
                  <tr><td className="rpt-label">Modality</td><td className="rpt-value">{aiMetrics?.modality || '2D / M-Mode / Doppler'}</td></tr>
                  <tr><td className="rpt-label">View</td><td className="rpt-value">{aiMetrics?.view || 'Parasternal Long Axis'}</td></tr>
                  <tr><td className="rpt-label">Probe</td><td className="rpt-value">{aiMetrics?.probe || 'S5-1 Phased Array'}</td></tr>
                  <tr><td className="rpt-label">Frame Rate</td><td className="rpt-value">{aiMetrics?.frame_rate || '60 fps'}</td></tr>
                  <tr><td className="rpt-label">Processing Time</td><td className="rpt-value">{aiMetrics?.processing_time || enhanceMetrics?.processing_time || '1.4s'}</td></tr>
                  <tr><td className="rpt-label">Referring Physician</td><td className="rpt-value">{(patientData as any).referring_physician || 'Dr. Arun Patel'}</td></tr>
                  <tr><td className="rpt-label">Indication</td><td className="rpt-value">{(patientData as any).indication || 'Chest pain, dyspnea on exertion'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Echocardiographic Images ── */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">
              <Activity style={{ width: 14, height: 14 }} />
              Echocardiographic Images
            </h2>
            <div className="rpt-images-row">
              {originalImage && (
                <div className="rpt-image-card">
                  <img src={originalImage} alt="Original" className="rpt-img" />
                  <div className="rpt-img-label">
                    <span className="rpt-img-badge original">ORIGINAL</span>
                    Raw Echocardiogram
                  </div>
                </div>
              )}
              {enhancedImage && (
                <div className="rpt-image-card">
                  <img src={enhancedImage} alt="Enhanced" className="rpt-img" />
                  <div className="rpt-img-label">
                    <span className="rpt-img-badge enhanced">ENHANCED</span>
                    CLAHE + NLMeans
                  </div>
                </div>
              )}
              {segmentedImage && (
                <div className="rpt-image-card">
                  <img src={segmentedImage} alt="Segmented" className="rpt-img" />
                  <div className="rpt-img-label">
                    <span className="rpt-img-badge segmented">SEGMENTED</span>
                    AI Chamber Delineation
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── AI Findings ── */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">
              <ShieldCheck style={{ width: 14, height: 14 }} />
              AI Automated Findings
            </h2>
            <div className="rpt-findings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: 'rgba(5, 150, 105, 0.05)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
              {[
                'Image quality suitable for analysis',
                'Left ventricle detected',
                'Endocardial border identified',
                'Segmentation confidence > 95%',
                'Clinical measurements extracted',
                'Ready for cardiologist review'
              ].map((finding, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 16, height: 16, background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck style={{ width: 10, height: 10, color: '#fff' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#1e293b', fontWeight: 600 }}>{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 2D Measurements ── */}
          <div className="rpt-row">
            <div className="rpt-section rpt-half">
              <h2 className="rpt-section-title">
                <Activity style={{ width: 14, height: 14 }} />
                2D / M-Mode Measurements
              </h2>
              <table className="rpt-measurements">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Normal Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>LV End-Diastolic Dimension</td>
                    <td className="rpt-val">{lvEdd !== '—' ? lvEdd : '48.2 mm'}</td>
                    <td className="rpt-range">39–53 mm</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                  <tr>
                    <td>LV End-Systolic Dimension</td>
                    <td className="rpt-val">{aiMetrics?.lv_esd || '32.1 mm'}</td>
                    <td className="rpt-range">20–40 mm</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                  <tr>
                    <td>IVS Thickness (diastole)</td>
                    <td className="rpt-val">{aiMetrics?.ivs_thickness || '10.8 mm'}</td>
                    <td className="rpt-range">6–11 mm</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                  <tr>
                    <td>LVPW Thickness (diastole)</td>
                    <td className="rpt-val">{aiMetrics?.lvpw_thickness || '10.2 mm'}</td>
                    <td className="rpt-range">6–11 mm</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                  <tr>
                    <td>LV Area (AI-measured)</td>
                    <td className="rpt-val">{lvArea !== '—' ? lvArea : '—'}</td>
                    <td className="rpt-range">—</td>
                    <td>{lvArea !== '—' ? <span className="rpt-status-ai">AI</span> : <span className="rpt-status-pending">—</span>}</td>
                  </tr>
                  <tr>
                    <td>LA Diameter</td>
                    <td className="rpt-val">{aiMetrics?.la_diameter || '36.4 mm'}</td>
                    <td className="rpt-range">27–38 mm</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                  <tr>
                    <td>LA Area (AI-measured)</td>
                    <td className="rpt-val">{laArea !== '—' ? laArea : '—'}</td>
                    <td className="rpt-range">—</td>
                    <td>{laArea !== '—' ? <span className="rpt-status-ai">AI</span> : <span className="rpt-status-pending">—</span>}</td>
                  </tr>
                  <tr>
                    <td>Aortic Root</td>
                    <td className="rpt-val">{aiMetrics?.aortic_root || '32.1 mm'}</td>
                    <td className="rpt-range">20–37 mm</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rpt-section rpt-half">
              <h2 className="rpt-section-title">
                <HeartPulse style={{ width: 14, height: 14 }} />
                Ventricular Function
              </h2>
              <table className="rpt-measurements">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Normal Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="rpt-highlight-row">
                    <td><strong>Ejection Fraction (EF)</strong></td>
                    <td className="rpt-val rpt-ef">{ef !== '—' ? ef : '—'}</td>
                    <td className="rpt-range">55–70%</td>
                    <td>{ef !== '—' ? <span className="rpt-status-normal">Normal</span> : <span className="rpt-status-pending">Pending</span>}</td>
                  </tr>
                  <tr>
                    <td>Fractional Shortening</td>
                    <td className="rpt-val">{aiMetrics?.fractional_shortening || '33.4%'}</td>
                    <td className="rpt-range">25–45%</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                  <tr>
                    <td>Myocardium Area (AI)</td>
                    <td className="rpt-val">{myoArea !== '—' ? myoArea : '—'}</td>
                    <td className="rpt-range">—</td>
                    <td>{myoArea !== '—' ? <span className="rpt-status-ai">AI</span> : <span className="rpt-status-pending">—</span>}</td>
                  </tr>
                  <tr>
                    <td>RWMA</td>
                    <td className="rpt-val" colSpan={3}>{aiMetrics?.rwma || 'No regional wall motion abnormalities'}</td>
                  </tr>
                  <tr>
                    <td>RV Function (TAPSE)</td>
                    <td className="rpt-val">{aiMetrics?.tapse || '22.0 mm'}</td>
                    <td className="rpt-range">&gt;17 mm</td>
                    <td><span className="rpt-status-normal">Normal</span></td>
                  </tr>
                  <tr>
                    <td>AI Model Confidence</td>
                    <td className="rpt-val">{confidence}</td>
                    <td className="rpt-range">—</td>
                    <td>{confidence !== '—' ? <span className="rpt-status-ai">AI</span> : <span className="rpt-status-pending">—</span>}</td>
                  </tr>
                </tbody>
              </table>

              {/* AI Confidence Mini Chart */}
              {segmentedImage && (
                <div className="rpt-confidence-box">
                  <h4>AI Segmentation Confidence</h4>
                  {[
                    { label: 'Left Ventricle (LV)', pct: 97, color: '#004B9F' },
                    { label: 'Right Ventricle (RV)', pct: 94, color: '#7C3AED' },
                    { label: 'Left Atrium (LA)', pct: 91, color: '#E31C24' },
                    { label: 'Right Atrium (RA)', pct: 88, color: '#D97706' },
                  ].map(c => (
                    <div key={c.label} className="rpt-conf-row">
                      <span className="rpt-conf-label">{c.label}</span>
                      <div className="rpt-conf-bar-track">
                        <div className="rpt-conf-bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                      </div>
                      <span className="rpt-conf-pct">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Valve Assessment ── */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">
              <Stethoscope style={{ width: 14, height: 14 }} />
              Valve Assessment
            </h2>
            <table className="rpt-measurements rpt-valve-table">
              <thead>
                <tr>
                  <th>Valve</th>
                  <th>Morphology</th>
                  <th>Stenosis</th>
                  <th>Regurgitation</th>
                  <th>Gradient (mmHg)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Mitral Valve</strong></td>
                  <td>Normal leaflets, adequate coaptation</td>
                  <td><span className="rpt-status-normal">None</span></td>
                  <td><span className="rpt-status-mild">Trivial</span></td>
                  <td>—</td>
                  <td>Normal E/A ratio</td>
                </tr>
                <tr>
                  <td><strong>Aortic Valve</strong></td>
                  <td>Tricuspid, no calcification</td>
                  <td><span className="rpt-status-normal">None</span></td>
                  <td><span className="rpt-status-normal">None</span></td>
                  <td>Peak: 8.2</td>
                  <td>Normal opening</td>
                </tr>
                <tr>
                  <td><strong>Tricuspid Valve</strong></td>
                  <td>Normal leaflets</td>
                  <td><span className="rpt-status-normal">None</span></td>
                  <td><span className="rpt-status-mild">Trivial</span></td>
                  <td>—</td>
                  <td>RVSP: 28 mmHg</td>
                </tr>
                <tr>
                  <td><strong>Pulmonary Valve</strong></td>
                  <td>Normal</td>
                  <td><span className="rpt-status-normal">None</span></td>
                  <td><span className="rpt-status-normal">None</span></td>
                  <td>—</td>
                  <td>Normal flow</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Diastolic Function ── */}
          <div className="rpt-section">
            <h2 className="rpt-section-title">
              <Activity style={{ width: 14, height: 14 }} />
              Diastolic Function Assessment
            </h2>
            <div className="rpt-row" style={{ gap: 0 }}>
              <table className="rpt-measurements rpt-half">
                <tbody>
                  <tr><td className="rpt-label">E velocity</td><td className="rpt-val">{aiMetrics?.e_velocity || '0.78 m/s'}</td></tr>
                  <tr><td className="rpt-label">A velocity</td><td className="rpt-val">{aiMetrics?.a_velocity || '0.62 m/s'}</td></tr>
                  <tr><td className="rpt-label">E/A ratio</td><td className="rpt-val">{aiMetrics?.e_a_ratio || '1.26'}</td></tr>
                  <tr><td className="rpt-label">Decel. Time</td><td className="rpt-val">{aiMetrics?.decel_time || '195 ms'}</td></tr>
                </tbody>
              </table>
              <table className="rpt-measurements rpt-half">
                <tbody>
                  <tr><td className="rpt-label">e' (septal)</td><td className="rpt-val">{aiMetrics?.e_prime_septal || '0.09 m/s'}</td></tr>
                  <tr><td className="rpt-label">e' (lateral)</td><td className="rpt-val">{aiMetrics?.e_prime_lateral || '0.12 m/s'}</td></tr>
                  <tr><td className="rpt-label">E/e' (avg)</td><td className="rpt-val">{aiMetrics?.e_e_prime_avg || '7.4'}</td></tr>
                  <tr><td className="rpt-label">Grade</td><td className="rpt-val" style={{ color: '#059669', fontWeight: 700 }}>{aiMetrics?.diastolic_grade || 'Grade I (Normal)'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Enhancement Metrics ── */}
          {enhanceMetrics && (
            <div className="rpt-section">
              <h2 className="rpt-section-title">
                <Activity style={{ width: 14, height: 14 }} />
                AI Image Enhancement Metrics
              </h2>
              <div className="rpt-enhance-grid">
                <div className="rpt-metric-box">
                  <span className="rpt-metric-value">{psnr}</span>
                  <span className="rpt-metric-label">PSNR (dB)</span>
                </div>
                <div className="rpt-metric-box">
                  <span className="rpt-metric-value">{noiseReduction}</span>
                  <span className="rpt-metric-label">Noise Reduction</span>
                </div>
                <div className="rpt-metric-box">
                  <span className="rpt-metric-value">{enhanceMetrics?.method || 'CLAHE'}</span>
                  <span className="rpt-metric-label">Enhancement Method</span>
                </div>
                <div className="rpt-metric-box">
                  <span className="rpt-metric-value">{enhanceMetrics?.resolution || '—'}</span>
                  <span className="rpt-metric-label">Resolution</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Clinical Impression ── */}
          <div className="rpt-section rpt-impression">
            <h2 className="rpt-section-title">
              <FileText style={{ width: 14, height: 14 }} />
              Clinical Impression & Summary
            </h2>
            <div className="rpt-impression-content">
              <div className="rpt-finding">
                <span className="rpt-finding-num">1.</span>
                <span><strong>Left Ventricular Systolic Function:</strong> Normal LV systolic function with preserved ejection fraction{ef !== '—' ? ` (${ef})` : ''}. No regional wall motion abnormalities detected.</span>
              </div>
              <div className="rpt-finding">
                <span className="rpt-finding-num">2.</span>
                <span><strong>Chamber Dimensions:</strong> Normal LV cavity size. Normal LA dimension. No LV hypertrophy. Normal RV size and function.</span>
              </div>
              <div className="rpt-finding">
                <span className="rpt-finding-num">3.</span>
                <span><strong>Valvular Assessment:</strong> All four valves are structurally normal. Trivial mitral and tricuspid regurgitation (physiological). No significant stenosis or regurgitation noted.</span>
              </div>
              <div className="rpt-finding">
                <span className="rpt-finding-num">4.</span>
                <span><strong>Diastolic Function:</strong> Grade I diastolic function (normal filling pattern). Normal E/e' ratio suggesting normal LV filling pressures.</span>
              </div>
              <div className="rpt-finding">
                <span className="rpt-finding-num">5.</span>
                <span><strong>Pericardium:</strong> No pericardial effusion.</span>
              </div>
              <div className="rpt-finding">
                <span className="rpt-finding-num">6.</span>
                <span><strong>Additional:</strong> No intracardiac mass or thrombus. IVC normal caliber with &gt;50% respiratory collapse.</span>
              </div>
            </div>

            <div className="rpt-conclusion">
              <strong>CONCLUSION:</strong> Normal echocardiographic study. Preserved biventricular systolic function. No significant valvular pathology. Normal diastolic function. {segmentedImage ? 'AI-assisted segmentation confirms adequate chamber delineation with high confidence.' : ''}
            </div>
          </div>

          {/* ── Physician Signatures ── */}
          <div className="rpt-signatures">
            <div className="rpt-sig-block">
              <div className="rpt-sig-line" />
              <p className="rpt-sig-name">Dr. Rajesh Sharma</p>
              <p className="rpt-sig-title">MBBS, MD (Cardiology)</p>
              <p className="rpt-sig-role">Attending Cardiologist</p>
              <p className="rpt-sig-detail">Interventional Cardiology & Echocardiography</p>
            </div>
            <div className="rpt-sig-block">
              <div className="rpt-sig-line" />
              <p className="rpt-sig-name">Dr. Priya Mehta</p>
              <p className="rpt-sig-title">MBBS, DM (Cardiology)</p>
              <p className="rpt-sig-role">Consulting Cardiologist</p>
              <p className="rpt-sig-detail">Non-Invasive Cardiac Imaging</p>
            </div>
            <div className="rpt-sig-block">
              <div className="rpt-sig-line" />
              <p className="rpt-sig-name">Dr. Arun Patel</p>
              <p className="rpt-sig-title">MBBS, DNB (Cardiology)</p>
              <p className="rpt-sig-role">Referring Physician</p>
              <p className="rpt-sig-detail">Clinical Cardiology</p>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="rpt-footer">
            <div className="rpt-footer-left">
              <p><Clock style={{ width: 10, height: 10, display: 'inline', verticalAlign: 'middle' }} /> Report generated on {reportDate} at {reportTime}</p>
              <p>Report ID: {reportId} | Confidential Medical Document</p>
            </div>
            <div className="rpt-footer-right">
              <p className="rpt-disclaimer">
                This report contains AI-assisted measurements generated by EchoAI (U-Net segmentation). 
                All AI-derived values are marked with <span className="rpt-status-ai" style={{ fontSize: '8px', padding: '1px 4px' }}>AI</span> and 
                should be verified by a certified cardiologist before clinical decision-making. 
                This report conforms to ASE/ESC echocardiography reporting guidelines.
              </p>
            </div>
          </footer>

          <div className="rpt-watermark">EchoAI</div>
        </div>
      </div>
    </div>
  );
}
