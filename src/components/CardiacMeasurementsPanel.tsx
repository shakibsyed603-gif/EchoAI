
import { HeartPulse } from 'lucide-react';

interface CircularGaugeProps {
  label: string;
  value: number;
  unit?: string;
  max: number;
  normalRange: [number, number]; // [min, max]
  inverse?: boolean; // if true, lower is better (not typically used here, but for flexibility)
}

function CircularGauge({ label, value, unit = '', max, normalRange, inverse = false }: CircularGaugeProps) {
  const radius = 26;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Calculate percentage for the stroke
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  // Determine color based on normal range
  let color = '#059669'; // Green (Normal)
  if (value < normalRange[0]) {
    color = inverse ? '#059669' : '#f59e0b'; // Amber or Red depending on severity, let's use Amber for slightly low
  } else if (value > normalRange[1]) {
    color = inverse ? '#ef4444' : '#f59e0b'; // Red if high and inverse, else Amber
  }

  // Extreme abnormality check (optional, simplifies to red if very far off)
  if (!inverse && (value < normalRange[0] * 0.8 || value > normalRange[1] * 1.2)) {
    color = '#ef4444'; // Red
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="rgba(255, 255, 255, 0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
        {unit && <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{unit}</div>}
      </div>
    </div>
  );
}

interface CardiacMeasurementsPanelProps {
  aiMetrics: any;
}

export function CardiacMeasurementsPanel({ aiMetrics }: CardiacMeasurementsPanelProps) {
  if (!aiMetrics) return null;

  // Parse strings to numbers or use mock defaults if not available
  const efValue = parseFloat(aiMetrics.ejection_fraction) || 62;
  const areaValue = parseFloat(aiMetrics.lv_area) || 34; // cm²
  const volValue = 110; // mock volume in mL
  const hrValue = 72; // mock HR bpm
  const confValue = parseFloat(aiMetrics.confidence) || 98; // percentage

  return (
    <div className="card animate-fade-in" style={{ padding: '1.25rem', overflow: 'hidden', position: 'relative', marginTop: '1.5rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f472b6, #fb7185)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 28, height: 28, background: 'rgba(244, 114, 182, 0.1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(244, 114, 182, 0.2)' }}>
          <HeartPulse style={{ width: 14, height: 14, color: '#f472b6' }} />
        </div>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>Cardiac Measurements</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <CircularGauge label="EF" value={efValue} unit="%" max={100} normalRange={[55, 75]} />
        <CircularGauge label="LV Area" value={areaValue} unit="mm²" max={3000} normalRange={[1000, 2500]} />
        <CircularGauge label="LV Vol" value={volValue} unit="mL" max={200} normalRange={[60, 150]} />

        <CircularGauge label="Heart Rate" value={hrValue} unit="bpm" max={150} normalRange={[60, 100]} />
        <CircularGauge label="Confidence" value={confValue} unit="%" max={100} normalRange={[90, 100]} />
      </div>
    </div>
  );
}
