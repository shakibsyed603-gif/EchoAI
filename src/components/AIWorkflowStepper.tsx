import React from 'react';
import { 
  FileUp, 
  Search, 
  Wand2, 
  Target, 
  Scan, 
  HeartPulse, 
  ClipboardList, 
  Stethoscope, 
  CheckCircle2, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface AIWorkflowStepperProps {
  uploadedFile: File | null;
  processingState: 'idle' | 'enhancing' | 'segmenting' | 'generating_report' | 'done';
  enhancedImage: string | null;
  segmentedImage: string | null;
  aiMetrics: any | null;
  showSuccess: boolean;
}

export function AIWorkflowStepper({
  uploadedFile,
  processingState,
  enhancedImage,
  segmentedImage,
  aiMetrics,
  showSuccess
}: AIWorkflowStepperProps) {

  // Derive step states based on App state
  const steps = [
    {
      id: 'import',
      label: 'Study Imported',
      icon: FileUp,
      completed: !!uploadedFile,
      active: false
    },
    {
      id: 'quality',
      label: 'Image Quality Assessment',
      icon: Search,
      completed: !!uploadedFile && processingState !== 'idle' || !!enhancedImage,
      active: !!uploadedFile && processingState === 'idle' && !enhancedImage
    },
    {
      id: 'enhance',
      label: 'Image Enhancement',
      icon: Wand2,
      completed: !!enhancedImage,
      active: processingState === 'enhancing'
    },
    {
      id: 'detection',
      label: 'Left Ventricle Detection',
      icon: Target,
      completed: !!segmentedImage,
      active: processingState === 'segmenting'
    },
    {
      id: 'segmentation',
      label: 'Segmentation',
      icon: Scan,
      completed: !!segmentedImage,
      active: processingState === 'segmenting'
    },
    {
      id: 'measurements',
      label: 'Clinical Measurements',
      icon: HeartPulse,
      completed: !!aiMetrics,
      active: processingState === 'segmenting'
    },
    {
      id: 'report',
      label: 'AI Report Generation',
      icon: ClipboardList,
      completed: showSuccess,
      active: processingState === 'generating_report'
    },
    {
      id: 'review',
      label: 'Ready for Cardiologist Review',
      icon: Stethoscope,
      completed: showSuccess,
      active: false
    }
  ];

  // Logic tweak: If a step is completed, it shouldn't be active.
  // Actually, let's refine the active step logic to just be the *current* focal point if not completed.
  const activeIndex = steps.findIndex(s => !s.completed);

  return (
    <div className="card animate-fade-in" style={{ padding: '1rem', overflowX: 'auto', marginBottom: '1.5rem', whiteSpace: 'nowrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '900px' }}>
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isActive = !isCompleted && index === activeIndex;
          const Icon = isCompleted ? CheckCircle2 : step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '0.5rem',
                opacity: (isCompleted || isActive) ? 1 : 0.4,
                width: '100px',
                position: 'relative'
              }}>
                <div 
                  className={`step-icon ${isActive ? 'active pulse' : ''} ${isCompleted ? 'completed' : ''}`}
                  style={{
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: isCompleted ? 'rgba(5, 150, 105, 0.15)' : isActive ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-base)',
                    border: `1px solid ${isCompleted ? '#059669' : isActive ? 'var(--accent-blue)' : 'var(--surface-border)'}`,
                    color: isCompleted ? '#059669' : isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  {isActive && <Loader2 className="animate-spin" style={{ position: 'absolute', width: 40, height: 40, color: 'var(--accent-blue)', opacity: 0.2 }} />}
                  <Icon style={{ width: 14, height: 14 }} />
                </div>
                
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: isCompleted || isActive ? 700 : 500, 
                  color: isCompleted ? '#059669' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  textAlign: 'center',
                  whiteSpace: 'normal',
                  lineHeight: 1.2
                }}>
                  {step.label}
                </span>
              </div>

              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <div style={{ 
                  flex: 1, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 0.25rem',
                  opacity: (isCompleted || isActive) ? 1 : 0.2,
                  marginTop: '-20px' // Align with icons
                }}>
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: isCompleted ? '#059669' : 'var(--surface-border)',
                    transition: 'background 0.3s'
                  }} />
                  <ChevronRight style={{ 
                    width: 14, 
                    height: 14, 
                    color: isCompleted ? '#059669' : 'var(--surface-border)',
                    marginLeft: '-4px',
                    transition: 'color 0.3s'
                  }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
