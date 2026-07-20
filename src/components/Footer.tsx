import { Shield, HeartPulse, Cpu, Lock, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--surface-border)',
      background: 'var(--surface-sidebar)',
      padding: '1rem 1.5rem',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {/* Top row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HeartPulse style={{ width: 14, height: 14, color: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>EchoAI</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--surface-card)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--surface-border)' }}>v1.0.0</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {[
              { icon: Shield, label: 'HIPAA Compliant', color: 'var(--success)' },
              { icon: Lock, label: 'AES-256 Encrypted', color: 'var(--accent-blue)' },
              { icon: Cpu, label: 'GPU Accelerated', color: 'var(--accent-purple)' },
              { icon: Globe, label: 'DICOM Ready', color: '#fb923c' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <item.icon style={{ width: 12, height: 12, color: item.color }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.65 }}>
          ⚠ For research and educational purposes only. Not intended for clinical diagnosis or treatment decisions. Always consult a qualified cardiologist.
        </p>
      </div>
    </footer>
  );
}
