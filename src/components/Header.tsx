import { Bell, Search, User, ChevronDown } from 'lucide-react';

export default function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <header style={{
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--surface-border)',
      padding: '0 1.5rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '0.45rem 0.875rem', minWidth: '260px' }}>
        <Search style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search patient, study ID..."
          style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-secondary)', fontSize: '13px', width: '100%' }}
        />
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--surface-border)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>⌘K</span>
      </div>

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Date/Time */}
        <div style={{ textAlign: 'right', display: 'none' }} className="topbar-date">
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dateStr}</p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{timeStr}</p>
        </div>

        {/* Notification bell */}
        <button style={{ position: 'relative', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '8px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s' }}>
          <Bell style={{ width: 15, height: 15 }} />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, background: '#ef4444', borderRadius: '50%', border: '2px solid var(--surface-card)' }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--surface-border)' }} />

        {/* User chip */}
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '8px', padding: '0.3rem 0.75rem 0.3rem 0.4rem', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: 14, height: 14, color: 'white' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Dr. Raza</p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.2 }}>Cardiologist</p>
          </div>
          <ChevronDown style={{ width: 12, height: 12, color: 'var(--text-muted)', marginLeft: 2 }} />
        </button>
      </div>
    </header>
  );
}
