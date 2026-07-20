import { useState } from 'react';
import {
  HeartPulse, Home, Microscope, Activity,
  ClipboardList, Archive, Settings, ChevronRight, Shield,
  Pencil, HelpCircle
} from 'lucide-react';
import PatientEditModal, { PatientData } from './PatientEditModal';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'analysis', icon: Microscope, label: 'Studies' },
  { id: 'upload', icon: Activity, label: 'Analysis Workspace' },
  { id: 'reports', icon: ClipboardList, label: 'Clinical Reports' },
  { id: 'archive', icon: Archive, label: 'Archive' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'help', icon: HelpCircle, label: 'Help & Docs' },
];

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  patientData: PatientData;
  onPatientUpdate: (patient: PatientData) => void;
}

export default function Sidebar({ currentView, setCurrentView, patientData, onPatientUpdate }: SidebarProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const initials = patientData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: 44, height: 44,
              background: '#FFFFFF',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(227, 28, 36, 0.2)',
              flexShrink: 0,
            }}>
              <HeartPulse style={{ width: 24, height: 24, color: '#E31C24' }} className="animate-heartbeat" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                EchoAI
              </h1>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: 400 }}>Cardiac Intelligence</p>
            </div>
          </div>

        </div>

        {/* Patient Info Card */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Patient</p>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.25rem 0.6rem',
                fontSize: '11px', fontWeight: 600,
                color: '#93C5FD',
                background: 'rgba(147,197,253,0.1)',
                border: '1px solid rgba(147,197,253,0.2)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <Pencil style={{ width: 12, height: 12 }} />
              Edit
            </button>
          </div>
          <div style={{
            background: '#0F294D', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 12, padding: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patientData.name}</p>
                <p style={{ fontSize: '11px', color: '#94A3B8' }}>ID: {patientData.id}</p>
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(249,115,22,0.15)',
                    color: '#F97316',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '9px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {patientData.status}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Age', value: patientData.age },
                { label: 'Gender', value: patientData.gender },
                { label: 'HR', value: patientData.hr },
                { label: 'BP', value: patientData.bp },
              ].map((item) => (
                <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                  <p style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blood Group</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#F43F5E' }}>{patientData.bloodGroup}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Clinical Navigation</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
              >
                <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span style={{ fontSize: '14px' }}>{item.label}</span>
                {currentView === item.id && <ChevronRight style={{ width: 16, height: 16, marginLeft: 'auto' }} />}
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />
        </nav>

        {/* Bottom compliance badge */}
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
            <Shield style={{ width: 13, height: 13, color: '#34D399' }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#34D399' }}>HIPAA Compliant</p>
              <p style={{ fontSize: '9px', color: '#B8C7D9' }}>End-to-end encrypted</p>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: '#7F93A8', marginTop: '0.5rem', textAlign: 'center' }}>EchoAI v1.0 · Research Use Only</p>
        </div>
      </aside>

      {/* Patient Edit Modal */}
      <PatientEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        patient={patientData}
        onSave={onPatientUpdate}
      />
    </>
  );
}
