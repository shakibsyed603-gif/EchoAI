import { useState, useCallback } from 'react';
import {
  X, CheckCircle2, Eye,
  ScanLine, HardDrive, FlaskConical, FolderOpen
} from 'lucide-react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  onLoadDemo?: () => void;
}

export default function UploadZone({ onFileUpload, uploadedFile, onLoadDemo }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = ''; // Reset input to allow re-uploading the same file
    }
  };

  const handleRemove = () => {
    onFileUpload(null as unknown as File);
  };

  // ─── File Already Loaded ───────────────────────────────────────────
  if (uploadedFile) {
    return (
      <div className="animate-fade-in">
        {/* Loaded file card */}
        <div style={{
          padding: '1rem 1.25rem',
          background: 'var(--surface-card)',
          border: '1px solid rgba(5,150,105,0.2)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: 44, height: 44,
            background: 'rgba(5,150,105,0.08)',
            border: '1px solid rgba(5,150,105,0.15)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <CheckCircle2 style={{ width: 22, height: 22, color: '#059669' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {uploadedFile.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </span>
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                background: 'rgba(0,75,159,0.08)', color: '#004B9F', border: '1px solid rgba(0,75,159,0.15)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {uploadedFile.type.split('/')[1].toUpperCase()}
              </span>
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                background: 'rgba(5,150,105,0.08)', color: '#059669', border: '1px solid rgba(5,150,105,0.15)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                ✓ Ready for Analysis
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              style={{
                width: 32, height: 32,
                background: 'var(--surface-base)', border: '1px solid var(--surface-border)',
                borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
              }}
              title="Preview"
            >
              <Eye style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={handleRemove}
              style={{
                width: 32, height: 32,
                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
                borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#DC2626', transition: 'all 0.15s',
              }}
              title="Remove Study"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* Cloud storage notice */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginTop: '0.625rem', padding: '0.5rem 0.875rem',
          background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.12)',
          borderRadius: 8,
        }}>
          <HardDrive style={{ width: 12, height: 12, color: '#059669', flexShrink: 0 }} />
          <p style={{ fontSize: '11px', color: '#059669', opacity: 0.85 }}>
            <strong>Cloud Synced</strong> — Study securely stored in encrypted Supabase storage
          </p>
        </div>
      </div>
    );
  }

  // ─── Import Panel (No file uploaded) ───────────────────────────────
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--surface-border-med)',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      {/* Clinical Header */}
      <div style={{
        padding: '0.75rem 1rem',
        background: '#0B1F3A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #004B9F'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HardDrive style={{ width: 16, height: 16, color: '#38BDF8' }} />
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Import Study Data
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
          <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>SYSTEM IDLE</span>
        </div>
      </div>

      {/* Viewport Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
        style={{
          background: '#060A0F',
          height: '240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
          borderBottom: '1px solid var(--surface-border-med)',
        }}
      >
        {/* Grid Background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }} />

        {isDragging && (
          <div style={{
            position: 'absolute', inset: '10px',
            border: '2px dashed #38BDF8',
            background: 'rgba(56, 189, 248, 0.05)',
            pointerEvents: 'none'
          }} />
        )}

        <ScanLine style={{
          width: 48, height: 48, 
          color: isDragging ? '#38BDF8' : '#334155',
          marginBottom: '1rem',
          transition: 'color 0.2s'
        }} />
        
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          color: isDragging ? '#38BDF8' : '#64748B',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          {isDragging ? 'RELEASE TO MOUNT DATA' : 'DRAG & DROP ECHOCARDIOGRAM'}
        </p>
        <p style={{ fontSize: '10px', color: '#475569', marginTop: '0.5rem', fontFamily: "'JetBrains Mono', monospace" }}>
          SUPPORTED FORMATS: DICOM / JPG / PNG (MAX 50MB)
        </p>

        <input
          id="file-upload"
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Control Panel Buttons */}
      <div style={{
        padding: '1rem',
        background: 'var(--surface-base)',
        display: 'flex',
        gap: '0.75rem'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById('file-upload')?.click();
          }}
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center', height: '36px', borderRadius: '4px' }}
        >
          <FolderOpen style={{ width: 14, height: 14 }} />
          BROWSE LOCAL FILES
        </button>

        {onLoadDemo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoadDemo();
            }}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', height: '36px', borderRadius: '4px' }}
          >
            <FlaskConical style={{ width: 14, height: 14 }} />
            LOAD DEMO STUDY
          </button>
        )}
      </div>
    </div>
  );
}
