import { useState, useEffect, useMemo } from 'react';
import { Activity, CheckCircle2, Brain, Zap, Server, TrendingUp, ArrowUpRight, Upload, FileText, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardOverviewProps {
  onViewReport?: (study: any) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseEF(val: any): number | null {
  if (val == null || val === '' || val === 'N/A' || val === '--') return null;
  const n = parseFloat(String(val).replace('%', '').trim());
  return isNaN(n) ? null : n;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardOverview({ onViewReport }: DashboardOverviewProps) {
  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  // ── Fetch studies ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('studies')
          .select('*')
          .order('created_at', { ascending: false });

        if (!cancelled) {
          if (error) {
            console.error('Dashboard: Supabase query error', error);
            setSupabaseConnected(false);
            setStudies([]);
          } else {
            setSupabaseConnected(true);
            setStudies(data || []);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Dashboard: fetch failed', err);
          setSupabaseConnected(false);
          setStudies([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── Backend health check ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function checkBackend() {
      try {
        const res = await fetch('/api/enhance', { method: 'OPTIONS' });
        if (!cancelled) setBackendStatus(res.ok ? 'online' : 'offline');
      } catch {
        // Try the root endpoint as fallback
        try {
          const res2 = await fetch('http://127.0.0.1:5000/');
          if (!cancelled) setBackendStatus(res2.ok ? 'online' : 'offline');
        } catch {
          if (!cancelled) setBackendStatus('offline');
        }
      }
    }

    checkBackend();
    return () => { cancelled = true; };
  }, []);

  // ── Compute statistics ───────────────────────────────────────────────────
  const computedStats = useMemo(() => {
    const total = studies.length;
    const completed = studies.filter(s => s.status === 'Analysis Complete').length;

    // Average EF — ignore null, empty, "N/A", "--", and non-numeric values
    const efValues = studies.map(s => parseEF(s.ejection_fraction)).filter((v): v is number => v !== null);
    const avgEF = efValues.length > 0 ? efValues.reduce((a, b) => a + b, 0) / efValues.length : null;

    // Average confidence
    const confValues = studies
      .map(s => (s.confidence_score != null ? Number(s.confidence_score) : NaN))
      .filter(v => !isNaN(v) && v > 0);
    const avgConf = confValues.length > 0 ? confValues.reduce((a, b) => a + b, 0) / confValues.length : null;

    // Average processing time
    const ptValues = studies
      .map(s => (s.processing_time != null ? Number(s.processing_time) : NaN))
      .filter(v => !isNaN(v) && v > 0);
    const avgPT = ptValues.length > 0 ? ptValues.reduce((a, b) => a + b, 0) / ptValues.length : null;

    // System status
    let systemValue = 'Checking…';
    let systemTrend = '';
    let systemHealthy = false;

    if (backendStatus === 'checking' || supabaseConnected === null) {
      systemValue = 'Checking…';
      systemTrend = 'Verifying connections';
    } else if (backendStatus === 'online' && supabaseConnected) {
      systemValue = 'System Healthy';
      systemTrend = 'All services connected';
      systemHealthy = true;
    } else if (backendStatus === 'online') {
      systemValue = 'Degraded';
      systemTrend = 'Database unreachable';
    } else if (supabaseConnected) {
      systemValue = 'Degraded';
      systemTrend = 'Backend offline';
    } else {
      systemValue = 'Offline';
      systemTrend = 'Services unreachable';
    }

    return {
      total,
      completed,
      avgEF,
      efCount: efValues.length,
      avgConf,
      confCount: confValues.length,
      avgPT,
      ptCount: ptValues.length,
      systemValue,
      systemTrend,
      systemHealthy,
    };
  }, [studies, backendStatus, supabaseConnected]);

  // ── Build stat cards array ───────────────────────────────────────────────
  const statCards = useMemo(() => [
    {
      title: 'Total Studies',
      value: String(computedStats.total),
      trend: `${computedStats.total} in database`,
      trendUp: true,
      icon: Activity,
      color: 'var(--accent-blue)',
      bg: 'rgba(0, 75, 159, 0.08)',
    },
    {
      title: 'Completed Studies',
      value: String(computedStats.completed),
      trend: computedStats.total > 0 ? `${Math.round((computedStats.completed / computedStats.total) * 100)}% of total` : 'No studies',
      trendUp: true,
      icon: CheckCircle2,
      color: 'var(--success)',
      bg: 'var(--success-bg)',
    },
    {
      title: 'Avg Ejection Fraction',
      value: computedStats.avgEF !== null ? `${computedStats.avgEF.toFixed(1)}%` : '—',
      trend: computedStats.efCount > 0 ? `From ${computedStats.efCount} ${computedStats.efCount === 1 ? 'study' : 'studies'}` : 'No data',
      trendUp: computedStats.avgEF !== null && computedStats.avgEF >= 50,
      icon: Heart,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
    },
    {
      title: 'Avg AI Confidence',
      value: computedStats.avgConf !== null ? `${computedStats.avgConf.toFixed(1)}%` : '—',
      trend: computedStats.confCount > 0 ? `From ${computedStats.confCount} ${computedStats.confCount === 1 ? 'analysis' : 'analyses'}` : 'No data',
      trendUp: computedStats.avgConf !== null && computedStats.avgConf >= 80,
      icon: Brain,
      color: 'var(--accent-purple)',
      bg: 'rgba(124,58,237,0.08)',
    },
    {
      title: 'Avg Processing Time',
      value: computedStats.avgPT !== null ? `${computedStats.avgPT.toFixed(2)}s` : '—',
      trend: computedStats.ptCount > 0 ? `From ${computedStats.ptCount} ${computedStats.ptCount === 1 ? 'study' : 'studies'}` : 'No data',
      trendUp: computedStats.avgPT !== null && computedStats.avgPT < 10,
      icon: Zap,
      color: '#0ea5e9',
      bg: 'rgba(14, 165, 233, 0.08)',
    },
    {
      title: 'AI System Status',
      value: computedStats.systemValue,
      trend: computedStats.systemTrend,
      trendUp: computedStats.systemHealthy,
      icon: Server,
      color: computedStats.systemHealthy ? 'var(--success)' : (computedStats.systemValue === 'Offline' ? 'var(--danger)' : 'var(--warning)'),
      bg: computedStats.systemHealthy ? 'var(--success-bg)' : (computedStats.systemValue === 'Offline' ? 'var(--danger-bg)' : 'var(--warning-bg)'),
    },
  ], [computedStats]);

  // ── Recent studies (top 5) ───────────────────────────────────────────────
  const recentStudies = useMemo(() => studies.slice(0, 5), [studies]);

  // ── Recent activity derived from studies ─────────────────────────────────
  const recentActivity = useMemo(() => {
    const events: { type: string; label: string; detail: string; time: string; color: string; icon: any }[] = [];

    for (const study of studies.slice(0, 15)) {
      const name = study.patient_name || 'Unknown Patient';
      const ts = study.created_at;

      // Every study was uploaded
      events.push({
        type: 'upload',
        label: 'Study Uploaded',
        detail: name,
        time: ts,
        color: 'var(--accent-blue)',
        icon: Upload,
      });

      // If analysis is complete
      if (study.status === 'Analysis Complete') {
        events.push({
          type: 'analysis',
          label: 'Analysis Completed',
          detail: name,
          time: ts,
          color: 'var(--success)',
          icon: CheckCircle2,
        });
      }

      // If AI findings exist, a report was generated
      if (study.ai_findings) {
        events.push({
          type: 'report',
          label: 'Report Generated',
          detail: name,
          time: ts,
          color: 'var(--accent-purple)',
          icon: FileText,
        });
      }
    }

    // Sort by time descending and take top 6
    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return events.slice(0, 6);
  }, [studies]);

  // ── Status badge helper ──────────────────────────────────────────────────
  function statusBadge(status: string) {
    if (status === 'Analysis Complete') {
      return <span className="badge badge-green" style={{ fontSize: '11px' }}>Completed</span>;
    }
    if (status === 'Uploaded') {
      return <span className="badge badge-amber" style={{ fontSize: '11px' }}>Uploaded</span>;
    }
    return <span className="badge" style={{ fontSize: '11px', background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(100,116,139,0.2)' }}>{status || 'Unknown'}</span>;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Hospital Summary Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
            Loading clinical data…
          </p>
        </div>

        {/* Skeleton stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '64px', height: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
              <div style={{ width: '100%' }}>
                <div style={{ width: '80px', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '120px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton bottom panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
          <div className="panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
            <div style={{ width: '120px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', marginBottom: '1.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border-med)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div>
                    <div style={{ width: '140px', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.4rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ width: '100px', height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
                <div style={{ width: '72px', height: '22px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            ))}
          </div>
          <div className="panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
            <div style={{ width: '110px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', marginBottom: '1.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: '100px', height: '11px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', marginBottom: '0.3rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: '70px', height: '9px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (studies.length === 0 && !loading) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Hospital Summary Dashboard
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
            Real-time overview of echocardiography clinical workflows and AI processing metrics.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '1px dashed var(--surface-border)',
          }}>
            <Activity style={{ width: 32, height: 32, color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Studies Yet</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
            Upload your first echocardiogram to begin AI-powered analysis. Dashboard statistics will populate automatically.
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Hospital Summary Dashboard
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
          Real-time overview of echocardiography clinical workflows and AI processing metrics.
        </p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{
                width: '42px', height: '42px',
                borderRadius: '10px',
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>
                <stat.icon style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: stat.trendUp ? 'var(--success-bg)' : 'var(--danger-bg)', padding: '0.25rem 0.5rem', borderRadius: '20px' }}>
                <TrendingUp style={{ width: 14, height: 14, color: stat.trendUp ? 'var(--success)' : 'var(--danger)' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: stat.trendUp ? 'var(--success)' : 'var(--danger)' }}>
                  {stat.trend}
                </span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.title}
              </p>
              <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Panels ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>

        {/* ── Recent Studies ─────────────────────────────────────────────── */}
        <div className="panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Recent Studies</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentStudies.map((study) => (
              <div
                key={study.id}
                onClick={() => onViewReport && onViewReport(study)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--surface-border-med)',
                  cursor: onViewReport ? 'pointer' : 'default',
                  borderRadius: '6px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (onViewReport) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {study.patient_name || 'Unknown Patient'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {study.patient_id || 'No ID'} • {new Date(study.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(study.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {statusBadge(study.status)}
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ────────────────────────────────────────────── */}
        <div className="panel" style={{ padding: '1.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {recentActivity.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((event, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: `color-mix(in srgb, ${event.color} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${event.color} 19%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <event.icon style={{ width: 13, height: 13, color: event.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{event.label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.detail} • {relativeTime(event.time)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
            View All Studies <ArrowUpRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
