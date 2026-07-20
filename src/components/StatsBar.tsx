import { useEffect, useState } from 'react';
import {
  Stethoscope, ClipboardCheck, CheckCircle2,
  BrainCircuit, Timer, Cpu,
  TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';

interface StatCardData {
  icon: React.ElementType;
  label: string;
  value: string;
  numericValue: number;
  suffix: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  trendLabel: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

const stats: StatCardData[] = [
  {
    icon: Stethoscope,
    label: "Today's Studies",
    value: '24',
    numericValue: 24,
    suffix: '',
    trend: 'up',
    trendValue: '+8',
    trendLabel: 'vs yesterday',
    color: '#004B9F',
    bgLight: 'rgba(0,75,159,0.06)',
    borderColor: 'rgba(0,75,159,0.15)',
  },
  {
    icon: ClipboardCheck,
    label: 'Pending Review',
    value: '7',
    numericValue: 7,
    suffix: '',
    trend: 'down',
    trendValue: '-3',
    trendLabel: 'from morning',
    color: '#D97706',
    bgLight: 'rgba(217,119,6,0.06)',
    borderColor: 'rgba(217,119,6,0.15)',
  },
  {
    icon: CheckCircle2,
    label: 'Completed Analysis',
    value: '17',
    numericValue: 17,
    suffix: '',
    trend: 'up',
    trendValue: '+5',
    trendLabel: 'today',
    color: '#059669',
    bgLight: 'rgba(5,150,105,0.06)',
    borderColor: 'rgba(5,150,105,0.15)',
  },
  {
    icon: BrainCircuit,
    label: 'Avg. AI Confidence',
    value: '94.2',
    numericValue: 94.2,
    suffix: '%',
    trend: 'up',
    trendValue: '+1.8%',
    trendLabel: 'this week',
    color: '#7C3AED',
    bgLight: 'rgba(124,58,237,0.06)',
    borderColor: 'rgba(124,58,237,0.15)',
  },
  {
    icon: Timer,
    label: 'Avg. Processing Time',
    value: '2.3',
    numericValue: 2.3,
    suffix: 's',
    trend: 'down',
    trendValue: '-0.4s',
    trendLabel: 'faster',
    color: '#0891B2',
    bgLight: 'rgba(8,145,178,0.06)',
    borderColor: 'rgba(8,145,178,0.15)',
  },
  {
    icon: Cpu,
    label: 'AI System Status',
    value: 'Online',
    numericValue: 0,
    suffix: '',
    trend: 'neutral',
    trendValue: '99.9%',
    trendLabel: 'uptime',
    color: '#059669',
    bgLight: 'rgba(5,150,105,0.06)',
    borderColor: 'rgba(5,150,105,0.15)',
  },
];

function useCountUp(target: number, duration: number = 1200, suffix: string = '') {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (target === 0 && suffix === '') {
      setDisplay('Online');
      return;
    }

    const isFloat = target % 1 !== 0;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      if (step >= steps) {
        clearInterval(timer);
        current = target;
      }
      setDisplay(isFloat ? current.toFixed(1) : Math.round(current).toString());
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, duration, suffix]);

  return display;
}

function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  const animatedValue = useCountUp(stat.numericValue, 1000 + index * 150, stat.suffix);
  const isSystemStatus = stat.label === 'AI System Status';

  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : ArrowRight;
  const trendColor = stat.trend === 'up'
    ? (stat.label === 'Pending Review' ? '#DC2626' : '#059669')
    : stat.trend === 'down'
      ? (stat.label === 'Pending Review' ? '#059669' : '#0891B2')
      : '#059669';

  return (
    <div
      className="animate-slide-up"
      style={{
        animationDelay: `${index * 70}ms`,
        background: 'var(--surface-card)',
        borderRadius: 8,
        padding: '0.5rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = stat.borderColor;
        e.currentTarget.style.boxShadow = `0 4px 16px ${stat.bgLight}`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surface-border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '1rem',
        right: '1rem',
        height: 2,
        background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)`,
        borderRadius: '0 0 2px 2px',
      }} />

      {/* Top row: Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 36,
            height: 36,
            background: stat.bgLight,
            border: `1px solid ${stat.borderColor}`,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <stat.icon style={{ width: 17, height: 17, color: stat.color }} />
          </div>
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.02em',
            lineHeight: 1.2,
            textTransform: 'uppercase',
          }}>
            {stat.label}
          </span>
        </div>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
        {isSystemStatus ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#059669',
              boxShadow: '0 0 0 3px rgba(5,150,105,0.2)',
              animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: 800,
              color: stat.color,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              Online
            </span>
          </div>
        ) : (
          <>
            <span style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {animatedValue}
            </span>
            {stat.suffix && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '1px',
              }}>
                {stat.suffix}
              </span>
            )}
          </>
        )}
      </div>

      {/* Trend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.3rem 0.5rem',
        background: `${trendColor}08`,
        border: `1px solid ${trendColor}18`,
        borderRadius: 6,
        alignSelf: 'flex-start',
      }}>
        <TrendIcon style={{ width: 11, height: 11, color: trendColor }} />
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          color: trendColor,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {stat.trendValue}
        </span>
        <span style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          {stat.trendLabel}
        </span>
      </div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
      gap: '0.5rem',
    }}>
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}
