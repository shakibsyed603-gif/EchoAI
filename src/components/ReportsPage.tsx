import { useStudies } from '../hooks/useStudies';
import { ClipboardList, Download, Eye, Clock, Activity, Loader2, AlertCircle } from 'lucide-react';

interface ReportsPageProps {
  onViewReport: (study: any) => void;
}

export default function ReportsPage({ onViewReport }: ReportsPageProps) {
  const { studies, loading, error, refresh } = useStudies();

  const handleDownloadPDF = async (study: any) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate_pdf', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(study)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF. Is the Python backend running?');
      }

      const data = await response.json();

      if (data.pdf_base64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.pdf_base64}`;
        link.download = `EchoAI_Report_${study.patient_name?.replace(/\s+/g, '_') || 'Patient'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e: any) {
      alert(e.message || "Failed to generate PDF. Please ensure the Python Flask server is running!");
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '2rem', flex: 1, minHeight: '100vh', background: 'var(--background)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 12 }}>
          <ClipboardList style={{ width: 24, height: 24, color: 'var(--accent-indigo)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Clinical Reports</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>View and download completed patient echocardiogram reports.</p>
        </div>
      </div>

      <div style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: 'var(--accent-indigo)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading reports from secure database...</p>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--text-primary)' }}>
            <AlertCircle style={{ width: 48, height: 48, color: 'var(--danger-color)' }} />
            <p style={{ color: 'var(--danger-color)', fontSize: '15px', fontWeight: 600 }}>{error}</p>
            <button onClick={refresh} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--surface-border)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', border: 'none' }}>
              Try Again
            </button>
          </div>
        ) : studies.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Activity style={{ width: 32, height: 32, color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>No reports found</p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Analyzed studies will appear here once completed.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--surface-border)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                {studies.map((study) => (
                  <tr key={study.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 0.2s' }} className="hover-row">
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {study.patient_id || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)', fontWeight: 600, fontSize: '12px' }}>
                          {study.patient_name ? study.patient_name.substring(0, 2).toUpperCase() : 'NA'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{study.patient_name || 'Unknown Patient'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Clock style={{ width: 14, height: 14 }} />
                        {new Date(study.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: 9999, fontSize: '12px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        Completed
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => onViewReport(study)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--surface-base)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                          className="hover-bg-border"
                        >
                          <Eye style={{ width: 14, height: 14 }} />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(study)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--accent-indigo)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(99,102,241,0.2)' }}
                          className="hover-bg-indigo-light"
                        >
                          <Download style={{ width: 14, height: 14 }} />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .hover-bg-border:hover {
          background: var(--surface-border) !important;
        }
        .hover-bg-indigo-light:hover {
          background: #818cf8 !important;
        }
      `}} />
    </div>
  );
}
