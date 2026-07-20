import React, { useEffect, useState } from 'react';
import {
  HeartPulse, ArrowRight, ShieldCheck, Activity, Brain, Image as ImageIcon,
  Scan, Database, Monitor, FileText, CheckCircle2, Zap, Target, Cpu,
  ChevronRight, Stethoscope, Clock, Maximize, Microscope, ArrowDown,
  Wand2, Ruler
} from 'lucide-react';
import heroMockup from '../assets/hero_mockup_pc.png';

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToWorkflow = () => {
    document.getElementById('ai-workflow')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#0A1628', overflowX: 'hidden' }}>

      {/* ─── HEADER ─── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '76px',
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#FFFFFF',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid #E2E8F0' : '1px solid transparent',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, background: '#003F88', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartPulse style={{ color: '#FFFFFF', width: 22, height: 22 }} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0A1628', letterSpacing: '-0.02em' }}>
            Echo<span style={{ color: '#003F88' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#features" style={{ fontSize: '15px', fontWeight: 600, color: '#475569', textDecoration: 'none', cursor: 'pointer' }}>Platform</a>
          <a href="#ai-workflow" style={{ fontSize: '15px', fontWeight: 600, color: '#475569', textDecoration: 'none', cursor: 'pointer' }}>Workflow</a>
          <a href="#research" style={{ fontSize: '15px', fontWeight: 600, color: '#475569', textDecoration: 'none', cursor: 'pointer' }}>Research</a>
          <button
            onClick={onLaunch}
            style={{
              background: '#003F88', color: '#FFFFFF', border: 'none', padding: '12px 28px',
              borderRadius: '8px', fontWeight: 600, fontSize: '15px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 63, 136, 0.2)'
            }}
          >
            Clinical Login <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </header>

      {/* ─── SECTION 1: HERO ─── */}
      <section style={{ paddingTop: '140px', paddingBottom: '100px', background: 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', padding: '0 5%' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#EFF6FF', borderRadius: '20px', marginBottom: '24px' }}>
              <ShieldCheck style={{ width: 16, height: 16, color: '#2E7DFF' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#003F88', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Clinical Decision Support</span>
            </div>
            <h1 style={{ fontSize: '56px', fontWeight: 800, color: '#0A1628', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '24px' }}>
              AI-Powered <br /> Echocardiography <br /> Clinical Workstation
            </h1>
            <p style={{ fontSize: '20px', color: '#475569', lineHeight: 1.6, marginBottom: '40px', maxWidth: '600px' }}>
              Enhance echocardiogram images, perform AI-powered cardiac segmentation, extract clinical measurements, and assist cardiologists with faster and more accurate cardiac analysis.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={onLaunch}
                style={{
                  background: '#0A1628', color: '#FFFFFF', border: 'none', padding: '16px 32px',
                  borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(10, 22, 40, 0.2)'
                }}>
                Launch EchoAI <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <button
                onClick={scrollToWorkflow}
                style={{
                  background: 'transparent', color: '#003F88', border: '2px solid #003F88',
                  padding: '16px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                View AI Workflow
              </button>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            {/* Soft background glow */}
            <div style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(circle, rgba(46,125,255,0.15) 0%, transparent 70%)', zIndex: 0 }} />
            <img
              src={heroMockup}
              alt="EchoAI Workstation Mockup"
              style={{ width: '100%', height: 'auto', borderRadius: '16px', boxShadow: '0 24px 48px -12px rgba(10,22,40,0.15)', position: 'relative', zIndex: 1, border: '1px solid #E2E8F0' }}
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: THE CLINICAL PROBLEM ─── */}
      <section style={{ padding: '100px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%', textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#0A1628', marginBottom: '24px', letterSpacing: '-0.02em' }}>The Diagnostic Challenge</h2>
          <p style={{ fontSize: '18px', color: '#475569', maxWidth: '800px', margin: '0 auto 60px', lineHeight: 1.6 }}>
            Echocardiography analysis is often hindered by low image quality, subjective measurements, and time-consuming manual workflows. EchoAI bridges the gap between raw data and clinical insights.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { text: "Low-quality Echo", icon: ImageIcon },
              { text: "Manual Analysis", icon: Clock },
              { text: "EchoAI Processing", icon: Cpu, highlight: true },
              { text: "Final Diagnosis", icon: Stethoscope }
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div style={{
                  background: step.highlight ? '#003F88' : '#F8FAFC',
                  color: step.highlight ? '#FFFFFF' : '#0A1628',
                  padding: '16px 24px', borderRadius: '12px', border: step.highlight ? 'none' : '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', gap: '12px', boxShadow: step.highlight ? '0 8px 16px rgba(0,63,136,0.2)' : 'none'
                }}>
                  <step.icon style={{ width: 20, height: 20, color: step.highlight ? '#FFFFFF' : '#475569' }} />
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>{step.text}</span>
                </div>
                {idx < arr.length - 1 && <ArrowRight style={{ width: 20, height: 20, color: '#CBD5E1' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: KEY FEATURES ─── */}
      <section id="features" style={{ padding: '100px 0', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#0A1628', marginBottom: '60px', textAlign: 'center', letterSpacing: '-0.02em' }}>Enterprise Clinical Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
            {[
              { title: "AI Image Enhancement", desc: "Automated CLAHE contrast enhancement and noise reduction for superior diagnostic clarity.", icon: Zap },
              { title: "Automated Cardiac Segmentation", desc: "U-Net deep learning models instantly isolate left ventricle, myocardium, and left atrium.", icon: Scan },
              { title: "Clinical Measurements", desc: "Automated extraction of vital functional parameters including ejection fraction and chamber volumes.", icon: Activity },
              { title: "AI Decision Support", desc: "Provides confidence scores and automated findings to assist cardiologists during review.", icon: Brain },
              { title: "Secure Study Management", desc: "Enterprise-grade study archiving, patient data management, and report generation.", icon: Database },
              { title: "Research-Ready Platform", desc: "Built on the CAMUS dataset, designed for transparency, reproducibility, and academic rigor.", icon: Microscope }
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: '#FFFFFF', padding: '32px', borderRadius: '16px',
                border: '1px solid #E2E8F0', transition: 'all 0.3s', cursor: 'default',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,30,80,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ width: 48, height: 48, background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <feature.icon style={{ width: 24, height: 24, color: '#003F88' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1628', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: AI WORKFLOW ─── */}
      <section id="ai-workflow" style={{ padding: '100px 0', background: '#0A1628', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '16px' }}>AI Clinical Workflow</h2>
            <p style={{ fontSize: '18px', color: '#94A3B8', maxWidth: '700px', margin: '0 auto' }}>A seamless, automated pipeline transforming raw echocardiograms into actionable clinical insights.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { step: 1, title: "Import Study", icon: Monitor },
              { step: 2, title: "Quality Assessment", icon: ShieldCheck },
              { step: 3, title: "AI Enhancement", icon: ImageIcon },
              { step: 4, title: "LV Detection", icon: Target },
              { step: 5, title: "Cardiac Segmentation", icon: Scan },
              { step: 6, title: "Clinical Measurements", icon: Activity },
              { step: 7, title: "AI Findings", icon: Brain },
              { step: 8, title: "Report Generation", icon: FileText },
              { step: 9, title: "Cardiologist Review", icon: CheckCircle2 }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: '#112240', padding: '24px', borderRadius: '12px', border: '1px solid #1E293B',
                display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#003F88', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon style={{ width: 16, height: 16, color: '#FFFFFF' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>0{item.step}</span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#E2E8F0' }}>{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHY ECHOAI ─── */}
      <section style={{ padding: '100px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%', display: 'grid', gridTemplateColumns: '4fr 5fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#0A1628', marginBottom: '32px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Why Choose EchoAI
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                "Faster Workflow",
                "Enhanced Image Quality",
                "Automated LV Segmentation",
                "Clinical Measurements",
                "AI Decision Support",
                "Research Ready"
              ].map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 style={{ width: 16, height: 16, color: '#16A34A' }} />
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 500, color: '#334155' }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '48px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(46,125,255,0.1)', borderRadius: '20px', marginBottom: '24px' }}>
              <Brain style={{ width: 16, height: 16, color: '#2E7DFF' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#003F88', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Decision Support</span>
            </div>
            
            <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#0A1628', marginBottom: '16px' }}>AI-Assisted Cardiac Analysis</h3>
            
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: 1.6, marginBottom: '40px' }}>
              EchoAI enhances echocardiogram images, automatically segments the left ventricle, generates clinical measurements, and provides AI-assisted decision support for cardiologists.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
              {[
                { name: 'Enhancement', icon: Wand2 },
                { name: 'Segmentation', icon: Scan },
                { name: 'Measurements', icon: Ruler },
                { name: 'Clinical Report', icon: FileText }
              ].map((step, idx, arr) => (
                <React.Fragment key={idx}>
                  <div style={{ 
                    padding: '12px 24px', 
                    background: '#FFFFFF', 
                    color: '#0A1628', 
                    borderRadius: '8px', 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    width: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}>
                    <step.icon style={{ width: 18, height: 18, color: '#003F88' }} />
                    <span>{step.name}</span>
                  </div>
                  {idx < arr.length - 1 && <ArrowDown style={{ width: 20, height: 20, color: '#94A3B8' }} />}
                </React.Fragment>
              ))}
            </div>

            <div style={{ marginTop: '36px', fontSize: '13.5px', color: '#94A3B8', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
              EchoAI provides AI-assisted clinical analysis. Final diagnosis remains the responsibility of the cardiologist.
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: TECHNOLOGY STACK ─── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#64748B', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '40px' }}>
            Powered By Enterprise Technology
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
            {[
              { category: 'AI Engine', items: ['PyTorch', 'U-Net', 'OpenCV'] },
              { category: 'Platform', items: ['React', 'Flask', 'Supabase'] },
              { category: 'Dataset', items: ['CAMUS'] },
            ].map((group, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', padding: '24px 32px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{group.category}</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {group.items.map((tech) => (
                    <span key={tech} style={{ fontSize: '18px', fontWeight: 700, color: '#0A1628' }}>{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: WORKSTATION PREVIEW ─── */}
      <section style={{ padding: '100px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%', textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#0A1628', marginBottom: '16px', letterSpacing: '-0.02em' }}>Professional Clinical Interface</h2>
          <p style={{ fontSize: '18px', color: '#475569', marginBottom: '60px' }}>Designed for cardiologists. Intuitive, fast, and secure.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {[
              { title: 'Dashboard', icon: Monitor },
              { title: 'Analysis Workspace', icon: Maximize },
              { title: 'Clinical Report', icon: FileText },
              { title: 'Study Archive', icon: Database }
            ].map((preview, idx) => (
              <div key={idx} style={{ background: '#F8FAFC', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <preview.icon style={{ width: 40, height: 40, color: '#2E7DFF', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1628' }}>{preview.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: RESEARCH & DATASET ─── */}
      <section id="research" style={{ padding: '100px 0', background: '#0A1628', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(46,125,255,0.1)', borderRadius: '20px', marginBottom: '24px' }}>
                <Microscope style={{ width: 16, height: 16, color: '#2E7DFF' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Credibility</span>
              </div>
              <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#FFFFFF', marginBottom: '24px', letterSpacing: '-0.02em' }}>The CAMUS Dataset</h2>
              <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px' }}>
                EchoAI is trained and validated on the CAMUS dataset, the gold standard for cardiac ultrasound segmentation. It provides expert annotations for 2D echocardiographic images.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { label: "Purpose", value: "Cardiac Ultrasound Seg." },
                  { label: "Ground Truth", value: "Expert Validated Masks" },
                  { label: "Model", value: "U-Net Architecture" },
                  { label: "Enhancement", value: "CNN / OpenCV CLAHE" }
                ].map((stat, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#112240', borderRadius: '12px', border: '1px solid #1E293B' }}>
                    <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#112240', padding: '40px', borderRadius: '24px', border: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database style={{ width: 120, height: 120, color: '#003F88', opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: WHY CARDIOLOGISTS NEED ECHOAI ─── */}
      <section style={{ padding: '100px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%', textAlign: 'center' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#0A1628', marginBottom: '60px', letterSpacing: '-0.02em' }}>Clinical Value Chain</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {['Patient', 'Ultrasound Machine', 'EchoAI', 'Enhancement', 'Segmentation', 'Measurements', 'Cardiologist', 'Clinical Report'].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div style={{ padding: '12px 20px', background: step === 'EchoAI' ? '#003F88' : '#F8FAFC', color: step === 'EchoAI' ? '#FFFFFF' : '#0A1628', borderRadius: '8px', fontSize: '14px', fontWeight: 600, border: step === 'EchoAI' ? 'none' : '1px solid #E2E8F0' }}>
                  {step}
                </div>
                {idx < arr.length - 1 && <ChevronRight style={{ width: 16, height: 16, color: '#94A3B8' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: STATISTICS ─── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { value: "CAMUS", label: "Dataset" },
              { value: "U-Net", label: "AI Model" },
              { value: "Real-Time", label: "Image Processing" },
              { value: "AI-Assisted", label: "Clinical Workflow" }
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '32px 24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: '32px', fontWeight: 800, color: '#003F88', marginBottom: '8px' }}>{stat.value}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: CTA ─── */}
      <section style={{ padding: '120px 0', background: 'linear-gradient(135deg, #0A1628, #003F88)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 5%' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 800, color: '#FFFFFF', marginBottom: '32px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Experience AI-Assisted Echocardiography
          </h2>
          <button
            onClick={onLaunch}
            style={{
              background: '#FFFFFF', color: '#003F88', border: 'none', padding: '20px 40px',
              borderRadius: '8px', fontSize: '18px', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
            Launch EchoAI Clinical Workstation <ArrowRight style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </section>

      {/* ─── SECTION 12: FOOTER ─── */}
      <footer style={{ background: '#050B14', padding: '80px 0 40px', color: '#94A3B8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '60px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <HeartPulse style={{ color: '#FFFFFF', width: 24, height: 24 }} />
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>EchoAI</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', maxWidth: '300px' }}>
                Final Year Engineering Major Project.<br />
                Department of Computer Science & Engineering.
              </p>
              <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>
                EchoAI v1.0 • Research Edition
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>About</a>
                <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Documentation</a>
                <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Research</a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Team</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '14px' }}>Project Guide: (Add Name)</span>
                <span style={{ fontSize: '14px' }}>Team Members: (Add Names)</span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '14px' }}>(Add College Email)</span>
                <span style={{ fontSize: '14px' }}>Computer Science Dept</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '14px' }}>&copy; {new Date().getFullYear()} EchoAI Research Project. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
