import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, Download, Activity, Loader2, AlertCircle } from 'lucide-react';

export default function PatientHistory() {
    const [studies, setStudies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch the data from our Supabase database on load!
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('studies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudies(data || []);
        } catch (err: any) {
            console.error("Error fetching studies", err);
            setError(err.message || "Failed to load patient history");
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadPDF = async (study: any) => {
        // We hit the brand new Python FPDF endpoint we just built!
        try {
            const response = await fetch('http://127.0.0.1:5000/api/generate_pdf', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(study)
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }
            
            const data = await response.json();

            if (data.pdf_base64) {
                // Automatically download the PDF to the user's computer
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${data.pdf_base64}`;
                link.download = `Patient_Report_${study.patient_name?.replace(/\s+/g, '_') || 'EchoAI'}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (e: any) {
            alert(e.message || "Please ensure the Python Flask server is running!");
            console.error(e);
        }
    };

    return (
        <div style={{ padding: '2rem', flex: 1, minHeight: '100vh', background: 'var(--background)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 12 }}>
                    <Activity style={{ width: 24, height: 24, color: 'var(--accent-indigo)' }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Patient Database</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Securely fetching real-time records from Supabase PostgreSQL</p>
                </div>
            </div>

            <div style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface-base)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ejection Fraction</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: 'var(--accent-indigo)' }} />
                                        <span style={{ color: 'var(--text-muted)' }}>Fetching from Cloud Database...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <AlertCircle style={{ width: 32, height: 32, color: 'var(--danger-color)' }} />
                                        <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>{error}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : studies.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No patients found in database. Upload a study first!</td></tr>
                        ) : (
                            studies.map((s, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--surface-border)', color: 'var(--text-primary)', transition: 'background 0.2s', cursor: 'pointer' }} className="hover:bg-[var(--surface-base)]">
                                    <td style={{ padding: '1rem', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock style={{ width: 12, height: 12 }} /> {new Date(s.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '14px', fontWeight: 700 }}>{s.patient_name}</td>
                                    <td style={{ padding: '1rem', fontSize: '14px', fontWeight: 700, color: 'var(--success)' }}>{s.ejection_fraction}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleDownloadPDF(s)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '11px' }}>
                                            <Download style={{ width: 12, height: 12 }} />
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
