import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStudies } from '../hooks/useStudies';
import {
  Search, Filter, Calendar, Trash2, Download, Eye,
  ChevronLeft, ChevronRight, Activity, Clock, User, AlertTriangle, Archive
} from 'lucide-react';
import echoSample from '../assets/echo_sample.png';

interface ArchivePageProps {
  onViewReport?: (study: any) => void;
}

export default function ArchivePage({ onViewReport }: ArchivePageProps) {
  const { studies, loading, refresh } = useStudies();

  // Filtering and Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Delete Confirmation State
  const [studyToDelete, setStudyToDelete] = useState<any>(null);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate_pdf', { method: 'POST' });
      const data = await response.json();

      if (data.pdf_base64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.pdf_base64}`;
        link.download = 'Patient_Report_EchoAI.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      alert("Please ensure the Python Flask server is running!");
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!studyToDelete) return;

    try {
      const { error } = await supabase
        .from('studies')
        .delete()
        .eq('id', studyToDelete.id);

      if (error) {
        console.error('[ArchivePage] Delete error:', {
          message: error.message,
          code:    error.code,
          details: error.details,
          hint:    error.hint,
        });
        alert('Failed to delete study.');
      } else {
        setStudyToDelete(null);
        // Re-sync the shared studies cache after deletion
        refresh();
      }
    } catch (e) {
      console.error('[ArchivePage] Unexpected delete error:', e);
    }
  };

  // Memoized filtered and sorted studies
  const filteredStudies = useMemo(() => {
    let result = [...studies];

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(s => {
        const pName = (s.patient_name || '').toLowerCase();
        const pId = (s.patient_id || 'Not Assigned').toLowerCase();
        const rId = (`REP-${(s.id || '').substring(0, 4)}`).toLowerCase();
        const dateStr = new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase();
        const status = (s.status || '').toLowerCase();
        return pName.includes(lowerQuery) ||
          pId.includes(lowerQuery) ||
          rId.includes(lowerQuery) ||
          dateStr.includes(lowerQuery) ||
          status.includes(lowerQuery);
      });
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'All Time') {
      const now = new Date();
      result = result.filter(s => {
        const studyDate = new Date(s.created_at);
        const diffTime = Math.abs(now.getTime() - studyDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === 'Last 7 Days') return diffDays <= 7;
        if (dateFilter === 'Last 30 Days') return diffDays <= 30;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'Oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'Patient Name (A-Z)') {
        return (a.patient_name || '').localeCompare(b.patient_name || '');
      }
      return 0;
    });

    return result;
  }, [studies, searchQuery, statusFilter, dateFilter, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
  const currentStudies = filteredStudies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 if filters change and we are out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredStudies, currentPage, totalPages]);

  return (
    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Study Archive
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
            Secure repository of completed patient analyses
          </p>
        </div>
        <div style={{ padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 12, border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <Archive style={{ width: 24, height: 24, color: 'var(--accent-blue)' }} />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Patient Name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.2rem',
              background: 'var(--surface-base)', border: '1px solid var(--surface-border)',
              borderRadius: 8, color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
            }}
          />
        </div>

        {/* Filters & Sort */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-base)', padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
            <Calendar style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All Time">All Time</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-base)', padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
            <Filter style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Statuses</option>
              <option value="Analysis Complete">Analysis Complete</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-base)', padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Patient Name (A-Z)">Patient Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 400 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div className="animate-spin" style={{ width: 24, height: 24, border: '3px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', marginRight: '0.75rem' }} />
            Fetching Archive...
          </div>
        ) : filteredStudies.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px dashed var(--surface-border)' }}>
              <Archive style={{ width: 28, height: 28, color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Studies Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.5 }}>
              Upload your first echocardiogram to begin AI analysis.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {currentStudies.map((study) => (
              <div key={study.id} className="card hover:shadow-lg animate-fade-in" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.2s', border: '1px solid var(--surface-border)' }}>
                {/* Thumbnail */}
                <div
                  style={{ height: 160, background: '#0a0e14', position: 'relative', borderBottom: '1px solid var(--surface-border)', cursor: onViewReport ? 'pointer' : 'default' }}
                  onClick={() => onViewReport && onViewReport(study)}
                >
                  <img
                    src={study.overlay_image_url || study.enhanced_image_url || study.image_url || echoSample}
                    alt="Echocardiogram"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User style={{ width: 14, height: 14, color: 'var(--accent-indigo)' }} />
                        {study.patient_name}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'monospace' }}>ID: {study.patient_id || 'Not Assigned'}</p>
                    </div>
                    {study.status === 'Analysis Complete' ? (
                      <span className="badge badge-green" style={{ fontSize: '9px' }}>COMPLETE</span>
                    ) : (
                      <span className="badge badge-amber" style={{ fontSize: '9px' }}>PENDING</span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {new Date(study.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {new Date(study.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Activity style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AI Confidence</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {study.confidence_score ? `${study.confidence_score}%` : study.confidence || '94%'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Ejection Fraction</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{study.ejection_fraction || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Processing Time</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {study.processing_time ? `Processing: ${study.processing_time} s` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed var(--surface-border)', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => onViewReport ? onViewReport(study) : alert("Report view not fully implemented in this demo.")} className="btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '11px', display: 'flex', justifyContent: 'center' }}>
                      <Eye style={{ width: 12, height: 12 }} /> View
                    </button>
                    <button onClick={handleDownloadPDF} className="btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '11px', display: 'flex', justifyContent: 'center' }}>
                      <Download style={{ width: 12, height: 12 }} /> PDF
                    </button>
                    <button onClick={() => setStudyToDelete(study)} className="btn-secondary" style={{ padding: '0.4rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', marginTop: 'auto' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudies.length)} of {filteredStudies.length} studies
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.6rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.6rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studyToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{ padding: '2rem', maxWidth: 400, width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle style={{ width: 20, height: 20, color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Delete Study</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this study?<br /><br />
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStudyToDelete(null)} style={{ padding: '0.6rem 1.25rem' }}>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '0.6rem 1.25rem', background: '#ef4444', color: 'white',
                  border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '13px', cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
