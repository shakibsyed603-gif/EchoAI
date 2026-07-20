import { useState, useEffect, useRef } from 'react';
import { X, Save, UserRound, Hash, Calendar, Heart, Activity, Droplets, Phone, Mail, MapPin, AlertCircle, Check } from 'lucide-react';

export interface PatientData {
  name: string;
  id: string;
  age: string;
  gender: string;
  hr: string;
  bp: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  status: 'Active' | 'Discharged' | 'Critical' | 'Follow-up';
}

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  onSave: (patient: PatientData) => void;
}

/* ── Standalone InputField to avoid re-mount on every keystroke ── */
function InputField({
  icon: Icon,
  label,
  value,
  error,
  placeholder,
  type = 'text',
  onChange,
}: {
  icon: any;
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{
        fontSize: '10px', fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: '0.35rem',
      }}>
        <Icon style={{ width: 11, height: 11, color: '#94a3b8' }} />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          fontSize: '13px',
          fontWeight: 500,
          color: '#1e293b',
          background: error ? 'rgba(220,38,38,0.04)' : '#f8fafc',
          border: `1px solid ${error ? 'rgba(220,38,38,0.4)' : '#e2e8f0'}`,
          borderRadius: 8,
          outline: 'none',
          transition: 'all 0.2s',
          fontFamily: "'Inter', sans-serif",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#004B9F';
          e.target.style.boxShadow = '0 0 0 3px rgba(0,75,159,0.1)';
          e.target.style.background = '#fff';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'rgba(220,38,38,0.4)' : '#e2e8f0';
          e.target.style.boxShadow = 'none';
          e.target.style.background = error ? 'rgba(220,38,38,0.04)' : '#f8fafc';
        }}
      />
      {error && (
        <span style={{ fontSize: '10px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertCircle style={{ width: 10, height: 10 }} />
          {error}
        </span>
      )}
    </div>
  );
}

export default function PatientEditModal({ isOpen, onClose, patient, onSave }: PatientEditModalProps) {
  const [formData, setFormData] = useState<PatientData>(patient);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientData, string>>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(patient);
      setErrors({});
      setSaveSuccess(false);
    }
  }, [isOpen, patient]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (field: keyof PatientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PatientData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Patient name is required';
    if (!formData.id.trim()) newErrors.id = 'Patient ID is required';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaveSuccess(true);
    setTimeout(() => {
      onSave(formData);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    Active: { bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.3)', text: '#D97706' },
    Discharged: { bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.3)', text: '#059669' },
    Critical: { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)', text: '#DC2626' },
    'Follow-up': { bg: 'rgba(0,75,159,0.12)', border: 'rgba(0,75,159,0.3)', text: '#004B9F' },
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        animation: 'fade-in 0.2s ease-out',
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%', maxWidth: 560,
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
          animation: 'slide-up 0.35s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #003070, #004B9F)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserRound style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                Edit Patient Details
              </h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                Update patient demographics & vitals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
              color: 'rgba(255,255,255,0.7)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          {/* Personal Info */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontSize: '10px', fontWeight: 700, color: '#004B9F',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: '#004B9F', display: 'inline-block',
              }} />
              Personal Information
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField icon={UserRound} label="Full Name" value={formData.name} error={errors.name} placeholder="e.g. Mohammed Khan" onChange={(v) => handleChange('name', v)} />
              </div>
              <InputField icon={Hash} label="Patient ID" value={formData.id} error={errors.id} placeholder="e.g. #EC-2024-1182" onChange={(v) => handleChange('id', v)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{
                  fontSize: '10px', fontWeight: 600, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}>
                  <Activity style={{ width: 11, height: 11, color: '#94a3b8' }} />
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  style={{
                    width: '100%', padding: '0.55rem 0.75rem',
                    fontSize: '13px', fontWeight: 600,
                    color: statusColors[formData.status]?.text || '#1e293b',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0', borderRadius: 8,
                    outline: 'none', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    appearance: 'auto',
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Critical">Critical</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>
              <InputField icon={Calendar} label="Age" value={formData.age} error={errors.age} placeholder="e.g. 54 yrs" onChange={(v) => handleChange('age', v)} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{
                  fontSize: '10px', fontWeight: 600, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}>
                  <UserRound style={{ width: 11, height: 11, color: '#94a3b8' }} />
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  style={{
                    width: '100%', padding: '0.55rem 0.75rem',
                    fontSize: '13px', fontWeight: 500,
                    color: '#1e293b', background: '#f8fafc',
                    border: `1px solid ${errors.gender ? 'rgba(220,38,38,0.4)' : '#e2e8f0'}`,
                    borderRadius: 8, outline: 'none', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    appearance: 'auto',
                  }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <span style={{ fontSize: '10px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle style={{ width: 10, height: 10 }} />
                    {errors.gender}
                  </span>
                )}
              </div>
              <InputField icon={Droplets} label="Blood Group" value={formData.bloodGroup} error={errors.bloodGroup} placeholder="e.g. B+" onChange={(v) => handleChange('bloodGroup', v)} />
            </div>
          </div>

          {/* Vitals */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{
              fontSize: '10px', fontWeight: 700, color: '#004B9F',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: '#004B9F', display: 'inline-block',
              }} />
              Vital Signs
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <InputField icon={Heart} label="Heart Rate" value={formData.hr} error={errors.hr} placeholder="e.g. 78 bpm" onChange={(v) => handleChange('hr', v)} />
              <InputField icon={Activity} label="Blood Pressure" value={formData.bp} error={errors.bp} placeholder="e.g. 125/82" onChange={(v) => handleChange('bp', v)} />
            </div>
          </div>

          {/* Contact */}
          <div>
            <p style={{
              fontSize: '10px', fontWeight: 700, color: '#004B9F',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: '#004B9F', display: 'inline-block',
              }} />
              Contact Information
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <InputField icon={Phone} label="Phone" value={formData.phone} error={errors.phone} placeholder="e.g. +91 98765 43210" type="tel" onChange={(v) => handleChange('phone', v)} />
              <InputField icon={Mail} label="Email" value={formData.email} error={errors.email} placeholder="e.g. patient@email.com" type="email" onChange={(v) => handleChange('email', v)} />
              <div style={{ gridColumn: '1 / -1' }}>
                <InputField icon={MapPin} label="Address" value={formData.address} error={errors.address} placeholder="e.g. 42 MG Road, Bangalore" onChange={(v) => handleChange('address', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '0.75rem',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem', fontSize: '13px', fontWeight: 500,
              color: '#475569', background: '#fff',
              border: '1px solid #cbd5e1', borderRadius: 8,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#94a3b8';
              e.currentTarget.style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.background = '#fff';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveSuccess}
            style={{
              padding: '0.55rem 1.5rem', fontSize: '13px', fontWeight: 600,
              color: '#fff',
              background: saveSuccess
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, #004B9F, #003070)',
              border: 'none', borderRadius: 8,
              cursor: saveSuccess ? 'default' : 'pointer',
              transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: saveSuccess
                ? '0 2px 8px rgba(5,150,105,0.25)'
                : '0 2px 8px rgba(0,75,159,0.25)',
            }}
            onMouseEnter={(e) => {
              if (!saveSuccess) {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,75,159,0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = saveSuccess
                ? '0 2px 8px rgba(5,150,105,0.25)'
                : '0 2px 8px rgba(0,75,159,0.25)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {saveSuccess ? (
              <>
                <Check style={{ width: 14, height: 14 }} />
                Saved!
              </>
            ) : (
              <>
                <Save style={{ width: 14, height: 14 }} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
