import { useState } from 'react';
import {
  BookOpen, Upload, Wand2, Scan, HeartPulse,
  ChevronDown, ChevronRight, HelpCircle, Database, Users, Mail, Shield,
  FileText, Stethoscope, Brain, Eye, Activity, Microscope,
  GraduationCap, Globe, Award, CheckCircle2
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   HELP & DOCUMENTATION PAGE
   Professional clinical software documentation for EchoAI Workstation
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Collapsible Section ──────────────────────────────────────────────────────
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      border: '1px solid #E8EDF5',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.125rem 1.25rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{
          width: 34, height: 34,
          background: 'rgba(46,125,255,0.08)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ width: 16, height: 16, color: '#2E7DFF' }} />
        </div>
        <span style={{ flex: 1, fontSize: '15px', fontWeight: 700, color: '#0B1F3A', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        {isOpen
          ? <ChevronDown style={{ width: 16, height: 16, color: '#7F93A8' }} />
          : <ChevronRight style={{ width: 16, height: 16, color: '#7F93A8' }} />
        }
      </button>
      {isOpen && (
        <div style={{
          padding: '0 1.25rem 1.25rem',
          borderTop: '1px solid #F0F3F8',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid #F0F3F8',
      padding: '0',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.875rem 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <HelpCircle style={{ width: 14, height: 14, color: '#2E7DFF', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#0B1F3A' }}>{question}</span>
        {isOpen
          ? <ChevronDown style={{ width: 14, height: 14, color: '#7F93A8' }} />
          : <ChevronRight style={{ width: 14, height: 14, color: '#7F93A8' }} />
        }
      </button>
      {isOpen && (
        <div style={{
          padding: '0 0 0.875rem 1.625rem',
          fontSize: '12.5px',
          color: '#4A5E78',
          lineHeight: 1.7,
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}

// ── Workflow Step ─────────────────────────────────────────────────────────────
function WorkflowStep({ icon: Icon, label, description, stepNum, isLast }: {
  icon: React.ElementType;
  label: string;
  description: string;
  stepNum: number;
  isLast: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
      {/* Vertical Connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2E7DFF, #1A5FD1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(46,125,255,0.25)',
          zIndex: 1,
        }}>
          <Icon style={{ width: 18, height: 18, color: '#FFFFFF' }} />
        </div>
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 28,
            background: 'linear-gradient(to bottom, #2E7DFF, #E8EDF5)',
          }} />
        )}
      </div>
      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : '1.5rem', paddingTop: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: '#2E7DFF',
            background: 'rgba(46,125,255,0.08)',
            padding: '2px 8px', borderRadius: 4,
          }}>
            STEP {stepNum}
          </span>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0B1F3A', marginBottom: '0.25rem' }}>{label}</h4>
        <p style={{ fontSize: '12px', color: '#4A5E78', lineHeight: 1.6 }}>{description}</p>
      </div>
    </div>
  );
}

// ── User Guide Step ──────────────────────────────────────────────────────────
function GuideStep({ stepNum, icon: Icon, title, description }: {
  stepNum: number;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1rem 1.125rem',
      background: '#FAFBFD',
      borderRadius: 10,
      border: '1px solid #EEF1F6',
      transition: 'all 0.15s',
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: '#0B1F3A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(11,31,58,0.15)',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{stepNum}</span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Icon style={{ width: 14, height: 14, color: '#2E7DFF' }} />
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0B1F3A' }}>{title}</h4>
        </div>
        <p style={{ fontSize: '12px', color: '#4A5E78', lineHeight: 1.65 }}>{description}</p>
      </div>
    </div>
  );
}

// ── Dataset Info Row ─────────────────────────────────────────────────────────
function DatasetRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '0.625rem 0',
      borderBottom: '1px solid #F0F3F8',
      gap: '1rem',
    }}>
      <span style={{ fontSize: '12px', color: '#7F93A8', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '12px', color: '#0B1F3A', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function HelpPage() {
  return (
    <div style={{
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      background: '#F4F6FA',
    }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '11px', color: '#7F93A8', fontWeight: 600 }}>System</span>
          <ChevronRight style={{ width: 12, height: 12, color: '#7F93A8' }} />
          <span style={{ fontSize: '11px', color: '#2E7DFF', fontWeight: 600 }}>Help & Documentation</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0B1F3A', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          Help & Documentation
        </h2>
        <p style={{ fontSize: '13px', color: '#7F93A8', marginTop: '0.35rem' }}>
          Comprehensive reference guide for the EchoAI Clinical Workstation
        </p>
      </div>

      {/* ── Quick Links ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.75rem',
      }}>
        {[
          { icon: BookOpen, label: 'User Guide', color: '#2E7DFF' },
          { icon: Brain, label: 'AI Workflow', color: '#7C3AED' },
          { icon: Database, label: 'Dataset Info', color: '#059669' },
          { icon: HelpCircle, label: 'FAQ', color: '#D97706' },
          { icon: Mail, label: 'Contact & Support', color: '#DC2626' },
        ].map((link, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.75rem 1rem',
            background: '#FFFFFF',
            borderRadius: 10,
            border: '1px solid #E8EDF5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{
              width: 32, height: 32,
              borderRadius: 8,
              background: `${link.color}10`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <link.icon style={{ width: 15, height: 15, color: link.color }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F3A' }}>{link.label}</span>
          </div>
        ))}
      </div>

      {/* ── Sections ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

        {/* ═══ 1. USER GUIDE ═══ */}
        <CollapsibleSection title="User Guide" icon={BookOpen} defaultOpen={true}>
          <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '12.5px', color: '#4A5E78', lineHeight: 1.65, marginBottom: '0.5rem' }}>
              Follow these step-by-step instructions to navigate the EchoAI Clinical Workstation and complete a full cardiac analysis workflow.
            </p>
            <GuideStep
              stepNum={1}
              icon={Upload}
              title="Import an Echocardiography Study"
              description="Navigate to the Analysis Workspace from the sidebar. Click the upload area or drag and drop a DICOM or PNG echocardiography image. The system accepts standard 2D echocardiography views. Once uploaded, the original image is displayed in the diagnostic viewport."
            />
            <GuideStep
              stepNum={2}
              icon={Wand2}
              title="Perform Image Enhancement"
              description="After importing the study, click the 'Enhance' button. The AI engine applies CLAHE-based contrast enhancement and noise reduction algorithms to improve image clarity. Enhancement metrics including noise reduction percentage and PSNR are displayed upon completion."
            />
            <GuideStep
              stepNum={3}
              icon={Scan}
              title="Run AI Segmentation"
              description="Once enhancement is complete, click 'Segment' to activate the deep learning segmentation model. The AI identifies and delineates cardiac structures including the left ventricle, right ventricle, left atrium, and myocardium. Results appear as a color-coded segmentation mask."
            />
            <GuideStep
              stepNum={4}
              icon={Eye}
              title="Review AI Findings"
              description="Examine the AI Clinical Summary panel on the right side. Review image quality assessment, segmentation confidence scores (Dice, IoU), and extracted cardiac measurements including ejection fraction, ventricular volumes, and heart rate. All AI findings are highlighted for quick review."
            />
            <GuideStep
              stepNum={5}
              icon={FileText}
              title="Generate the Clinical Report"
              description="Click 'Generate Report' to create a comprehensive clinical echocardiography report. The report includes patient demographics, study information, segmented images, cardiac measurements, AI findings, and space for cardiologist notes and electronic signatures. Export as PDF for clinical records."
            />
          </div>
        </CollapsibleSection>

        {/* ═══ 2. AI WORKFLOW ═══ */}
        <CollapsibleSection title="AI Processing Workflow" icon={Brain}>
          <div style={{ paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '12.5px', color: '#4A5E78', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              The EchoAI system follows a structured, multi-stage deep learning pipeline to transform raw echocardiography images into actionable clinical insights.
            </p>
            <WorkflowStep
              icon={Upload}
              label="Import Echocardiography Study"
              description="Raw echocardiography image is uploaded and validated. The system checks file format compatibility and image dimensions."
              stepNum={1}
              isLast={false}
            />
            <WorkflowStep
              icon={Shield}
              label="Image Quality Assessment"
              description="Automated quality check evaluates image resolution, contrast levels, and noise characteristics to determine suitability for AI analysis."
              stepNum={2}
              isLast={false}
            />
            <WorkflowStep
              icon={Wand2}
              label="Image Enhancement"
              description="CLAHE (Contrast Limited Adaptive Histogram Equalization) is applied alongside noise reduction filters to optimize image clarity for downstream processing."
              stepNum={3}
              isLast={false}
            />
            <WorkflowStep
              icon={Stethoscope}
              label="Left Ventricle Detection"
              description="The AI model identifies and localizes the left ventricle boundary using trained convolutional neural network feature maps."
              stepNum={4}
              isLast={false}
            />
            <WorkflowStep
              icon={Scan}
              label="Cardiac Structure Segmentation"
              description="U-Net based deep learning model performs pixel-level segmentation of cardiac chambers: left ventricle (endocardium), myocardium, left atrium, and right ventricle."
              stepNum={5}
              isLast={false}
            />
            <WorkflowStep
              icon={HeartPulse}
              label="Clinical Measurements"
              description="Automated extraction of quantitative measurements: ejection fraction, ventricular area and volume, wall thickness, and chamber dimensions from segmented regions."
              stepNum={6}
              isLast={false}
            />
            <WorkflowStep
              icon={Activity}
              label="AI Findings"
              description="The system generates clinical observations and confidence-scored findings based on segmentation quality and measurement analysis."
              stepNum={7}
              isLast={false}
            />
            <WorkflowStep
              icon={FileText}
              label="Clinical Report Generation"
              description="A comprehensive clinical echocardiography report is assembled with patient data, segmented images, measurements, and AI-assisted findings."
              stepNum={8}
              isLast={false}
            />
            <WorkflowStep
              icon={CheckCircle2}
              label="Ready for Cardiologist Review"
              description="The complete analysis package is presented for final review, annotation, and electronic signature by the attending cardiologist."
              stepNum={9}
              isLast={true}
            />
          </div>
        </CollapsibleSection>

        {/* ═══ 3. DATASET INFORMATION ═══ */}
        <CollapsibleSection title="Dataset Information" icon={Database}>
          <div style={{ paddingTop: '1rem' }}>
            {/* Dataset Header Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0B1F3A, #163A63)',
              borderRadius: 10,
              padding: '1.25rem',
              marginBottom: '1.25rem',
              color: '#FFFFFF',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Database style={{ width: 20, height: 20, color: '#FFFFFF' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.01em' }}>CAMUS Dataset</h4>
                  <p style={{ fontSize: '11px', color: '#B8C7D9' }}>Cardiac Acquisitions for Multi-structure Ultrasound Segmentation</p>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#B8C7D9', lineHeight: 1.65 }}>
                CAMUS is a large-scale, publicly available dataset specifically designed for cardiac ultrasound image segmentation research. It provides expert-annotated echocardiographic images from clinical examinations, making it the gold standard for training and validating AI models in echocardiography.
              </p>
            </div>

            {/* Dataset Details */}
            <div style={{
              background: '#FAFBFD',
              borderRadius: 10,
              border: '1px solid #EEF1F6',
              padding: '0.25rem 1.125rem',
              marginBottom: '1rem',
            }}>
              <DatasetRow label="Purpose" value="Training & validation of cardiac segmentation AI models" />
              <DatasetRow label="Number of Patients" value="500 clinical patients" />
              <DatasetRow label="Number of Annotated Images" value="~2,000 annotated frames" />
              <DatasetRow label="Echocardiography Views" value="Apical 2-Chamber (A2C) & Apical 4-Chamber (A4C)" />
              <DatasetRow label="Cardiac Phases" value="End-Diastole (ED) & End-Systole (ES)" />
              <DatasetRow label="Ground Truth Masks" value="Left Ventricle, Myocardium, Left Atrium" />
              <DatasetRow label="Annotation Quality" value="Expert cardiologist annotations with inter-observer agreement" />
              <DatasetRow label="Image Format" value="MHD/RAW format, converted to PNG for processing" />
              <div style={{ padding: '0.625rem 0' }}>
                <span style={{ fontSize: '12px', color: '#7F93A8', fontWeight: 600 }}>Source</span>
                <span style={{ fontSize: '12px', color: '#2E7DFF', fontWeight: 600, marginLeft: '0.5rem' }}>
                  humanheart-project.creatis.insa-lyon.fr
                </span>
              </div>
            </div>

            {/* Why CAMUS */}
            <div style={{
              background: '#FAFBFD',
              borderRadius: 10,
              border: '1px solid #EEF1F6',
              padding: '1rem 1.125rem',
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0B1F3A', marginBottom: '0.75rem' }}>
                Why CAMUS was selected for this project
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  'Largest publicly available echocardiography segmentation dataset',
                  'Expert-level annotations validated by experienced cardiologists',
                  'Clinically representative patient population with diverse pathologies',
                  'Supports both 2-chamber and 4-chamber echocardiographic views',
                  'Includes both end-diastolic and end-systolic cardiac phases',
                  'Widely used as a benchmark in medical imaging research',
                  'Enables reproducible and comparable AI model evaluation',
                ].map((reason, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: '#4A5E78', lineHeight: 1.55 }}>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ 4. FAQ ═══ */}
        <CollapsibleSection title="Frequently Asked Questions" icon={HelpCircle}>
          <div style={{ paddingTop: '0.5rem' }}>
            <FAQItem
              question="What is an echocardiogram?"
              answer="An echocardiogram is a non-invasive medical test that uses ultrasound waves to create real-time images of the heart. It allows cardiologists to evaluate cardiac structure, function, and blood flow. Common views include the apical 2-chamber (A2C), apical 4-chamber (A4C), and parasternal long-axis views. Echocardiography is one of the most widely used diagnostic tools in cardiology due to its safety, portability, and ability to provide immediate clinical information."
            />
            <FAQItem
              question="What is image enhancement in this system?"
              answer="Image enhancement is the process of improving the visual quality of echocardiography images using computational algorithms. EchoAI applies CLAHE (Contrast Limited Adaptive Histogram Equalization) to enhance local contrast, followed by noise reduction filters to minimize speckle noise inherent in ultrasound images. This preprocessing step significantly improves the accuracy of downstream AI segmentation by making cardiac boundaries more visible and distinct."
            />
            <FAQItem
              question="What is cardiac segmentation?"
              answer="Cardiac segmentation is the process of identifying and delineating specific anatomical structures within an echocardiography image. Using a U-Net deep learning architecture, EchoAI performs pixel-level classification to identify the left ventricle (endocardial border), myocardium (heart muscle), left atrium, and right ventricle. The resulting segmentation mask enables automated quantification of cardiac dimensions and function parameters such as ejection fraction."
            />
            <FAQItem
              question="How does the AI model work?"
              answer="EchoAI employs a U-Net convolutional neural network architecture, a widely adopted model for medical image segmentation. The model was trained on the CAMUS dataset with expert-annotated ground truth masks. During inference, the input echocardiography image passes through encoder blocks that capture spatial features, followed by decoder blocks that reconstruct pixel-level segmentation maps. Skip connections preserve fine-grained anatomical details. The model outputs a multi-class segmentation mask with confidence scores."
            />
            <FAQItem
              question="What is the CAMUS dataset?"
              answer="CAMUS (Cardiac Acquisitions for Multi-structure Ultrasound Segmentation) is a publicly available dataset containing 2D echocardiographic images from 500 patients. It includes expert annotations for the left ventricle endocardium, myocardium, and left atrium across both apical 2-chamber and 4-chamber views. The dataset covers end-diastolic and end-systolic cardiac phases, making it the most comprehensive benchmark for evaluating cardiac ultrasound segmentation algorithms."
            />
            <FAQItem
              question="Can this system replace a cardiologist?"
              answer="No. EchoAI is designed as a clinical decision support tool, not a replacement for cardiologist expertise. The system assists by automating time-consuming image processing tasks, extracting quantitative measurements, and generating preliminary findings. However, all AI-generated results require review and validation by a qualified cardiologist before any clinical decisions are made. The system is labeled 'Research Use Only' and is intended to augment—not replace—clinical judgment."
            />
            <FAQItem
              question="Who is this software designed for?"
              answer="EchoAI is designed for cardiologists, cardiac sonographers, radiology technicians, and medical imaging researchers. It serves as a clinical decision support system for echocardiography analysis in hospital environments, research laboratories, and academic medical centers. The system is also suitable for medical education and training purposes, helping students understand cardiac anatomy and AI-assisted diagnostic workflows."
            />
            <FAQItem
              question="What image formats are supported?"
              answer="EchoAI currently supports standard image formats including PNG, JPEG, and BMP for echocardiography uploads. The system is optimized for 2D echocardiography images with typical clinical resolutions. Future versions may include native DICOM support for seamless integration with hospital PACS systems."
            />
            <FAQItem
              question="How accurate is the AI segmentation?"
              answer="The AI segmentation model achieves Dice scores above 0.90 on the CAMUS validation set for left ventricle segmentation, which is comparable to inter-observer variability among expert cardiologists. Confidence scores are displayed alongside each analysis to help clinicians gauge the reliability of the AI output. Lower confidence results are flagged for additional manual review."
            />
          </div>
        </CollapsibleSection>

        {/* ═══ 5. CONTACT & SUPPORT ═══ */}
        <CollapsibleSection title="Contact & Support" icon={Mail}>
          <div style={{ paddingTop: '1rem' }}>
            {/* Project Identity Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0B1F3A, #163A63)',
              borderRadius: 10,
              padding: '1.5rem',
              marginBottom: '1rem',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Watermark */}
              <div style={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                opacity: 0.04,
                fontSize: '120px',
                fontWeight: 900,
                lineHeight: 1,
                pointerEvents: 'none',
              }}>
                ♥
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <HeartPulse style={{ width: 22, height: 22, color: '#FFFFFF' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.015em' }}>
                    Echo<span style={{ color: '#93C5FD' }}>AI</span>
                  </h3>
                  <p style={{ fontSize: '11px', color: '#B8C7D9' }}>AI-Powered Echocardiography Clinical Workstation</p>
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.3rem 0.75rem',
                background: 'rgba(46,125,255,0.2)',
                borderRadius: 6,
                fontSize: '10px', fontWeight: 700, color: '#93C5FD',
                letterSpacing: '0.05em',
              }}>
                <Award style={{ width: 12, height: 12 }} />
                FINAL YEAR ENGINEERING MAJOR PROJECT
              </div>
            </div>

            {/* Info Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}>
              {[
                { icon: GraduationCap, label: 'Project Type', value: 'Final Year Engineering\nMajor Project', color: '#2E7DFF' },
                { icon: Microscope, label: 'Department', value: 'Computer Science\n& Engineering', color: '#7C3AED' },
                { icon: Users, label: 'Project Guide', value: '(Add Guide Name)', color: '#059669' },
                { icon: Globe, label: 'Version', value: 'EchoAI v1.0\nResearch Edition', color: '#D97706' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: '#FAFBFD',
                  borderRadius: 10,
                  border: '1px solid #EEF1F6',
                  padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <item.icon style={{ width: 14, height: 14, color: item.color }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#7F93A8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {item.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F3A', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Development Team */}
            <div style={{
              background: '#FAFBFD',
              borderRadius: 10,
              border: '1px solid #EEF1F6',
              padding: '1rem 1.125rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Users style={{ width: 14, height: 14, color: '#2E7DFF' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#7F93A8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Development Team
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  '(Add Team Member 1)',
                  '(Add Team Member 2)',
                  '(Add Team Member 3)',
                  '(Add Team Member 4)',
                ].map((member, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    background: '#FFFFFF',
                    borderRadius: 8,
                    border: '1px solid #EEF1F6',
                  }}>
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: `hsl(${210 + idx * 30}, 60%, 92%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: '#0B1F3A',
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F3A' }}>{member}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Contact */}
            <div style={{
              background: '#FAFBFD',
              borderRadius: 10,
              border: '1px solid #EEF1F6',
              padding: '1rem 1.125rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Mail style={{ width: 14, height: 14, color: '#2E7DFF' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#7F93A8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Support Contact
                </span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #EEF1F6',
              }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: 'rgba(46,125,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mail style={{ width: 16, height: 16, color: '#2E7DFF' }} />
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#0B1F3A' }}>(Add College Email)</p>
                  <p style={{ fontSize: '10px', color: '#7F93A8' }}>For technical support and inquiries</p>
                </div>
              </div>
            </div>

            {/* Compliance Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginTop: '1rem',
              padding: '0.625rem 0.875rem',
              background: 'rgba(5,150,105,0.06)',
              border: '1px solid rgba(5,150,105,0.12)',
              borderRadius: 8,
            }}>
              <Shield style={{ width: 13, height: 13, color: '#059669' }} />
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                This software is for research and educational purposes only. Not approved for clinical diagnostic use.
              </span>
            </div>
          </div>
        </CollapsibleSection>

      </div>

      {/* Bottom Padding */}
      <div style={{ height: '2rem' }} />
    </div>
  );
}
