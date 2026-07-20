import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, FileUp, Wand2, Scan, HeartPulse, ClipboardList, Loader2 } from 'lucide-react';

interface AIProcessingTimelineProps {
  uploadedFile: File | null;
  processingState: string;
  enhancedImage: string | null;
  segmentedImage: string | null;
  aiMetrics: any | null;
  showSuccess: boolean;
}

export function AIProcessingTimeline({
  uploadedFile,
  processingState,
  enhancedImage,
  segmentedImage,
  aiMetrics,
  showSuccess
}: AIProcessingTimelineProps) {
  const [baseTime, setBaseTime] = useState<Date | null>(null);

  useEffect(() => {
    if (uploadedFile && !baseTime) {
      setBaseTime(new Date());
    }
  }, [uploadedFile, baseTime]);

  // Format time helper (HH:MM:SS)
  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const steps = [
    {
      id: 'import',
      label: 'Study Imported',
      icon: FileUp,
      status: uploadedFile ? 'completed' : 'pending',
      timeOffset: 0
    },
    {
      id: 'enhance',
      label: 'Image Enhancement',
      icon: Wand2,
      status: enhancedImage ? 'completed' : (processingState === 'enhancing' ? 'processing' : 'pending'),
      timeOffset: 1200 // 1.2s
    },
    {
      id: 'segment',
      label: 'Segmentation Complete',
      icon: Scan,
      status: segmentedImage ? 'completed' : (processingState === 'segmenting' ? 'processing' : 'pending'),
      timeOffset: 2500 // 2.5s
    },
    {
      id: 'metrics',
      label: 'Measurements Generated',
      icon: HeartPulse,
      status: aiMetrics ? 'completed' : (processingState === 'segmenting' ? 'processing' : 'pending'),
      timeOffset: 2800 // 2.8s
    },
    {
      id: 'report',
      label: 'Clinical Report Created',
      icon: ClipboardList,
      status: showSuccess ? 'completed' : (processingState === 'generating_report' ? 'processing' : 'pending'),
      timeOffset: 3200 // 3.2s
    }
  ];

  return (
    <div className="card animate-fade-in" style={{ padding: '1.25rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 30, height: 30, background: 'rgba(56,189,248,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56,189,248,0.2)' }}>
          <Clock style={{ width: 14, height: 14, color: 'var(--accent-blue)' }} />
        </div>
        <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>AI Processing Timeline</h3>
        {showSuccess && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>All Stages Complete</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: '1rem', position: 'relative' }}>
        {/* Connecting Line Background */}
        <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: 'var(--surface-border)', zIndex: 0 }} />

        {steps.map((step) => {
          const isCompleted = step.status === 'completed';
          const isProcessing = step.status === 'processing';
          
          let timestamp = null;
          if (isCompleted && baseTime) {
            timestamp = new Date(baseTime.getTime() + step.timeOffset);
          }

          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1, opacity: isCompleted || isProcessing ? 1 : 0.4 }}>
              
              <div 
                className={`step-icon ${isProcessing ? 'active pulse' : ''}`}
                style={{ 
                  width: 34, 
                  height: 34, 
                  borderRadius: '50%', 
                  background: isCompleted ? 'var(--surface-card)' : isProcessing ? 'rgba(56, 189, 248, 0.1)' : 'var(--surface-base)',
                  border: `2px solid ${isCompleted ? '#059669' : isProcessing ? 'var(--accent-blue)' : 'var(--surface-border)'}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: isCompleted ? '#059669' : isProcessing ? 'var(--accent-blue)' : 'var(--text-muted)',
                  boxShadow: isCompleted ? '0 0 10px rgba(5,150,105,0.1)' : 'none',
                  position: 'relative'
                }}
              >
                {isProcessing && <Loader2 className="animate-spin" style={{ position: 'absolute', width: 44, height: 44, color: 'var(--accent-blue)', opacity: 0.2 }} />}
                {isCompleted ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <step.icon style={{ width: 14, height: 14 }} />}
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: isCompleted ? 700 : 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {isCompleted ? formatTime(timestamp) : (isProcessing ? 'Processing...' : '--:--:--')}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
