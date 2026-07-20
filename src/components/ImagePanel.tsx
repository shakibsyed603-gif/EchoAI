import { useState, useRef, useEffect } from 'react';
import { Download, ZoomIn, Activity, Maximize, ZoomOut, Move, UploadCloud } from 'lucide-react';

export interface FileMetadata {
  name: string;
  type: string;
  size: string;
  time: string;
}

interface ImagePanelProps {
  title: string;
  subtitle: string;
  imageSrc: string | null;
  comparisonImageSrc?: string | null; // For before/after slider
  icon: React.ReactNode;
  status: 'idle' | 'processing' | 'done';
  accentColor: 'blue' | 'green' | 'purple';
  delay?: number;
  metrics?: { label: string; value: string }[];
  fileMetadata?: FileMetadata | null;
  empty?: boolean;
}

const colorMap = {
  blue: {
    accent: '#38bdf8',
    bg: 'rgba(56,189,248,0.06)',
    border: 'rgba(56,189,248,0.2)',
    badgeClass: 'badge-blue',
  },
  green: {
    accent: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.2)',
    badgeClass: 'badge-green',
  },
  purple: {
    accent: '#a78bfa',
    bg: 'rgba(167,139,250,0.06)',
    border: 'rgba(167,139,250,0.2)',
    badgeClass: 'badge-purple',
  },
};

export default function ImagePanel({
  title, subtitle, imageSrc, comparisonImageSrc, icon, status, accentColor, delay = 0, metrics = [], fileMetadata
}: ImagePanelProps) {
  const c = colorMap[accentColor];
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Before/After Slider state
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Fullscreen using Browser API
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPan({ x: 0, y: 0 });
      return newScale;
    });
  };
  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingSlider(true);
  };

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    }
  };

  const handleSliderMouseUp = () => {
    setIsDraggingSlider(false);
  };

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener('mouseup', handleSliderMouseUp);
      window.addEventListener('mousemove', handleSliderMouseMove as any);
    } else {
      window.removeEventListener('mouseup', handleSliderMouseUp);
      window.removeEventListener('mousemove', handleSliderMouseMove as any);
    }
    return () => {
      window.removeEventListener('mouseup', handleSliderMouseUp);
      window.removeEventListener('mousemove', handleSliderMouseMove as any);
    };
  }, [isDraggingSlider]);

  return (
    <div
      className="panel animate-slide-up"
      style={{
        animationDelay: `${delay}ms`,
        border: '1px solid var(--surface-border)',
        boxShadow: status === 'done' ? `0 2px 12px ${c.bg}` : undefined,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 12,
        background: 'var(--surface-card)',
      }}
    >
      {/* Panel Header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface-base)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 28, height: 28,
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 14, height: 14, color: c.accent }}>{icon}</div>
          </div>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {status === 'done' && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 0 2px rgba(52,211,153,0.2)' }} />
              READY
            </span>
          )}
          {status === 'processing' && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity style={{ width: 10, height: 10 }} className="animate-pulse" />
              PROCESSING
            </span>
          )}
        </div>
      </div>

      {/* PACS Viewer Area */}
      <div 
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={handleResetZoom}
        style={{
          flex: 1,
          background: '#030712', // Deep medical black for PACS feel
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid var(--surface-border)`,
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        {/* Corner Accents (Medical UI look) */}
        <div style={{ position: 'absolute', top: 12, left: 12, borderTop: '2px solid rgba(255,255,255,0.2)', borderLeft: '2px solid rgba(255,255,255,0.2)', width: 16, height: 16, zIndex: 20 }} />
        <div style={{ position: 'absolute', top: 12, right: 12, borderTop: '2px solid rgba(255,255,255,0.2)', borderRight: '2px solid rgba(255,255,255,0.2)', width: 16, height: 16, zIndex: 20 }} />
        <div style={{ position: 'absolute', bottom: 12, left: 12, borderBottom: '2px solid rgba(255,255,255,0.2)', borderLeft: '2px solid rgba(255,255,255,0.2)', width: 16, height: 16, zIndex: 20 }} />
        <div style={{ position: 'absolute', bottom: 12, right: 12, borderBottom: '2px solid rgba(255,255,255,0.2)', borderRight: '2px solid rgba(255,255,255,0.2)', width: 16, height: 16, zIndex: 20 }} />

        {status === 'processing' ? (
          <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
            <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: 2, background: c.accent, opacity: 0.5, boxShadow: `0 0 10px ${c.accent}`, animation: 'scanline 2s infinite ease-in-out' }} />
            <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '2px' }}>ANALYZING STUDY</span>
            </div>
          </div>
        ) : imageSrc ? (
          <>
            <div style={{
              width: '100%', height: '100%',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s',
              position: 'relative'
            }}>
              {/* Main Image */}
              <img
                src={imageSrc}
                alt={title}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'contrast(1.1)' }}
              />
              
              {/* Comparison Slider Image */}
              {comparisonImageSrc && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                }}>
                  <img
                    src={comparisonImageSrc}
                    alt="Original"
                    draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'contrast(1.1)' }}
                  />
                  {/* Slider Line inside the zoomed area */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, width: 2,
                    background: 'rgba(255,255,255,0.8)', boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                  }} />
                </div>
              )}
            </div>

            {/* Slider Handle overlay (independent of zoom) */}
            {comparisonImageSrc && (
                <div 
                  onMouseDown={handleSliderMouseDown}
                  style={{
                    position: 'absolute', top: '50%', left: `${sliderPos}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 24, height: 24, background: 'white', borderRadius: '50%',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)', cursor: 'ew-resize',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 30
                  }}
                >
                  <div style={{ display: 'flex', gap: 2 }}>
                    <div style={{ width: 2, height: 10, background: '#cbd5e1', borderRadius: 1 }} />
                    <div style={{ width: 2, height: 10, background: '#cbd5e1', borderRadius: 1 }} />
                  </div>
                </div>
            )}
            
            {/* Toolbar Overlay on Hover */}
            <div className="pacs-toolbar" style={{
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '0.4rem', opacity: 0, transition: 'opacity 0.2s', zIndex: 40,
              background: 'rgba(3, 7, 18, 0.6)', padding: '4px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)'
            }}>
              <button onClick={handleZoomOut} title="Zoom Out" style={toolbarButtonStyle}>
                <ZoomOut style={{ width: 14, height: 14 }} />
              </button>
              <button onClick={handleResetZoom} title="Reset Zoom" style={toolbarButtonStyle}>
                <span style={{ fontSize: '10px', fontWeight: 600 }}>{Math.round(scale * 100)}%</span>
              </button>
              <button onClick={handleZoomIn} title="Zoom In" style={toolbarButtonStyle}>
                <ZoomIn style={{ width: 14, height: 14 }} />
              </button>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
              <button onClick={() => setPan({x:0, y:0})} title="Center Pan" style={toolbarButtonStyle}>
                <Move style={{ width: 14, height: 14 }} />
              </button>
              <button onClick={handleFullscreen} title="Fullscreen" style={toolbarButtonStyle}>
                <Maximize style={{ width: 14, height: 14 }} />
              </button>
              <button onClick={handleDownload} title="Download" style={toolbarButtonStyle}>
                <Download style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', opacity: 0.5 }}>
            <UploadCloud style={{ width: 36, height: 36, color: 'white' }} />
            <p style={{ fontSize: '12px', color: 'white', fontWeight: 500 }}>Upload an echocardiogram study to begin AI analysis.</p>
          </div>
        )}

        {/* Global style for hover effect & animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .panel:hover .pacs-toolbar { opacity: 1 !important; }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes scanline {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
          `
        }} />
      </div>

      {/* Real File Metadata Footer */}
      {(imageSrc || status === 'processing') && fileMetadata && (
        <div style={{ padding: '0.5rem 1rem', background: 'var(--surface-base)', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            <span>FILE: {fileMetadata.name}</span>
            <span>TYPE: {fileMetadata.type || 'image/jpeg'}</span>
            <span>SIZE: {fileMetadata.size}</span>
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {fileMetadata.time}
          </div>
        </div>
      )}

      {/* Metrics Footer (existing layout) */}
      {status === 'done' && metrics.length > 0 && (
        <div style={{ padding: '0.75rem', background: 'var(--surface-card)', display: 'flex', gap: '1rem' }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ flex: 1, background: 'var(--surface-base)', padding: '0.5rem', borderRadius: 6, border: '1px solid var(--surface-border)' }}>
              <p style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{m.label}</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: c.accent, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const toolbarButtonStyle = {
  width: 28, height: 28, 
  background: 'transparent', border: 'none', borderRadius: 4, 
  display: 'flex', alignItems: 'center', justifyContent: 'center', 
  color: 'white', cursor: 'pointer', opacity: 0.8
};

