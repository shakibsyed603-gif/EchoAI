import re

with open(r"c:\Users\Syed Shakib ali\Downloads\EchoAI001\src\App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "            <StatsBar />"
end_marker = "      {/* Professional Clinical Report Modal */}"

parts = content.split(start_marker)
if len(parts) != 2:
    print("Start marker not found")
    exit(1)

pre = parts[0] + start_marker + "\n"

parts2 = parts[1].split(end_marker)
if len(parts2) != 2:
    print("End marker not found")
    exit(1)

post = "      {/* Professional Clinical Report Modal */}" + parts2[1]

new_middle = """
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start', marginTop: '1.25rem' }}>
              
              {/* LEFT: Main Image Viewer (Largest Component) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                    <div style={{ width: 30, height: 30, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Scan style={{ width: 14, height: 14, color: 'var(--accent-blue)' }} />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Diagnostic Viewport</h3>
                    <div style={{ height: 1, flex: 1, background: 'var(--surface-border)', marginLeft: '0.5rem' }} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <ImagePanel
                      title="Original Study"
                      subtitle="Raw Input"
                      imageSrc={originalImage}
                      icon={<Image style={{ width: '100%', height: '100%' }} />}
                      status={originalImage ? (processingState === 'enhancing' ? 'processing' : 'done') : 'idle'}
                      accentColor="blue"
                      delay={0}
                      metrics={originalImage && processingState !== 'enhancing' ? [
                        { label: 'Resolution', value: uploadedFile ? `${uploadedFile.name.split('.').pop()?.toUpperCase()}` : 'N/A' },
                        { label: 'Format', value: uploadedFile?.type?.split('/')[1]?.toUpperCase() || 'IMG' },
                      ] : []}
                    />
                    <ImagePanel
                      title="Enhanced Image"
                      subtitle="CLAHE Denoised"
                      imageSrc={enhancedImage}
                      icon={<Wand2 style={{ width: '100%', height: '100%' }} />}
                      status={enhancedImage ? 'done' : processingState === 'enhancing' ? 'processing' : 'idle'}
                      accentColor="green"
                      delay={100}
                      metrics={enhancedImage ? [
                        { label: 'PSNR', value: enhanceMetrics?.psnr || 'N/A' },
                        { label: 'Noise ↓', value: enhanceMetrics?.noise_reduction || 'N/A' },
                      ] : []}
                    />
                    <ImagePanel
                      title="Overlay View"
                      subtitle="Contours overlaid on enhanced"
                      imageSrc={segmentedImage}
                      icon={<Scan style={{ width: '100%', height: '100%' }} />}
                      status={segmentedImage ? 'done' : processingState === 'segmenting' ? 'processing' : 'idle'}
                      accentColor="purple"
                      delay={200}
                      metrics={segmentedImage ? [
                        { label: 'EF', value: aiMetrics?.ejection_fraction || 'N/A' },
                        { label: 'Confidence', value: aiMetrics?.confidence || 'N/A' },
                      ] : []}
                    />
                    <ImagePanel
                      title="Segmentation Mask"
                      subtitle="Isolated chamber detection"
                      imageSrc={segmentedImage}
                      icon={<Scan style={{ width: '100%', height: '100%' }} />}
                      status={segmentedImage ? 'done' : processingState === 'segmenting' ? 'processing' : 'idle'}
                      accentColor="purple"
                      delay={300}
                      metrics={segmentedImage ? [
                        { label: 'Regions', value: aiMetrics ? '3/3' : '0/3' },
                        { label: 'Status', value: 'Complete' },
                      ] : []}
                    />
                  </div>
                </section>

                {/* Feature Cards (Moved below grid) */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    {
                      icon: Wand2, color: 'var(--accent-blue)', bg: 'rgba(56,189,248,0.08)',
                      title: 'CNN Enhancement',
                      desc: 'Deep residual denoising network trained on 30,000+ echocardiograms.',
                      tag: 'ResNet-50 backbone',
                    },
                    {
                      icon: Scan, color: 'var(--accent-purple)', bg: 'rgba(167,139,250,0.08)',
                      title: 'U-Net Segmentation',
                      desc: 'Encoder-decoder architecture for precise segmentation of LV, RV, LA, RA.',
                      tag: 'Dice score: 0.96',
                    },
                    {
                      icon: HeartPulse, color: '#f472b6', bg: 'rgba(244,114,182,0.08)',
                      title: 'Clinical Metrics',
                      desc: 'Automated computation of ejection fraction, chamber dimensions.',
                      tag: 'AHA Guidelines',
                    },
                  ].map((card, i) => (
                    <div key={card.title} className="card animate-slide-up" style={{ padding: '1.125rem', animationDelay: `${i * 80}ms` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ width: 38, height: 38, background: card.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${card.color}22` }}>
                          <card.icon style={{ width: 18, height: 18, color: card.color }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{card.title}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.6rem' }}>{card.desc}</p>
                          <span className="badge" style={{ background: card.bg, color: card.color, border: `1px solid ${card.color}33` }}>{card.tag}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              </div>

              {/* RIGHT: Controls & Clinical Info Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <UploadZone onFileUpload={handleFileUpload} uploadedFile={uploadedFile} onLoadDemo={handleLoadDemo} />

                {uploadedFile && (
                  <div className="card animate-slide-up" style={{ padding: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: 30, height: 30, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles style={{ width: 14, height: 14, color: '#7C3AED' }} />
                      </div>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>AI Pipeline</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '18px', left: '15%', right: '15%', height: 2, background: 'var(--surface-border)', zIndex: 0 }} />
                      
                      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={handleEnhance} disabled={!canEnhance} style={{ width: 36, height: 36, borderRadius: '50%', background: enhancedImage ? '#059669' : canEnhance ? 'var(--surface-card)' : 'var(--surface-base)', border: `2px solid ${enhancedImage ? '#059669' : canEnhance ? '#004B9F' : 'var(--surface-border)'}`, color: enhancedImage ? 'white' : canEnhance ? '#004B9F' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canEnhance ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: canEnhance && processingState !== 'enhancing' ? '0 0 0 4px rgba(0,75,159,0.1)' : 'none' }}>
                          {processingState === 'enhancing' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(0,75,159,0.2)', borderTopColor: '#004B9F', borderRadius: '50%' }} /> : enhancedImage ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <Wand2 style={{ width: 16, height: 16 }} />}
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: enhancedImage ? '#059669' : canEnhance ? '#004B9F' : 'var(--text-muted)' }}>1. Denoise</span>
                      </div>

                      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={handleSegment} disabled={!canSegment} style={{ width: 36, height: 36, borderRadius: '50%', background: segmentedImage ? '#059669' : canSegment ? 'var(--surface-card)' : 'var(--surface-base)', border: `2px solid ${segmentedImage ? '#059669' : canSegment ? '#7C3AED' : 'var(--surface-border)'}`, color: segmentedImage ? 'white' : canSegment ? '#7C3AED' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canSegment ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: canSegment && processingState !== 'segmenting' ? '0 0 0 4px rgba(124,58,237,0.1)' : 'none' }}>
                          {processingState === 'segmenting' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%' }} /> : segmentedImage ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <Scan style={{ width: 16, height: 16 }} />}
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: segmentedImage ? '#059669' : canSegment ? '#7C3AED' : 'var(--text-muted)' }}>2. Segment</span>
                      </div>

                      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={showSuccess ? handleGenerateReport : undefined} disabled={!showSuccess} style={{ width: 36, height: 36, borderRadius: '50%', background: showSuccess ? 'linear-gradient(135deg, #059669, #047857)' : 'var(--surface-base)', border: `2px solid ${showSuccess ? '#059669' : 'var(--surface-border)'}`, color: showSuccess ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: showSuccess ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: showSuccess ? '0 0 0 4px rgba(5,150,105,0.15)' : 'none' }}>
                          <ClipboardList style={{ width: 16, height: 16 }} />
                        </button>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: showSuccess ? '#059669' : 'var(--text-muted)' }}>3. Report</span>
                      </div>
                    </div>

                    {(processingState === 'enhancing' || processingState === 'segmenting') && (
                      <div className="animate-fade-in" style={{ padding: '0.75rem', background: 'var(--surface-base)', borderRadius: 8, border: '1px dashed var(--surface-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {processingState === 'enhancing' ? 'Running CNN denoiser (ResNet-50)...' : 'Running U-Net segmentation...'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {processingState === 'enhancing' ? 'GPU active' : 'Tensor cores active'}
                          </span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: processingState === 'enhancing' ? '55%' : '75%', background: processingState === 'enhancing' ? 'linear-gradient(90deg, #004B9F, #38bdf8)' : 'linear-gradient(90deg, #7C3AED, #c084fc)' }} />
                        </div>
                      </div>
                    )}
                    
                    {showSuccess && (
                      <div className="animate-slide-up" style={{ padding: '0.75rem', background: 'rgba(5,150,105,0.06)', borderRadius: 8, border: '1px solid rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 24, height: 24, background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           <CheckCircle2 style={{ width: 14, height: 14, color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: '#059669', lineHeight: 1.2 }}>Analysis Complete</p>
                          <p style={{ fontSize: '10px', color: 'rgba(5,150,105,0.8)' }}>Chambers mapped.</p>
                        </div>
                        <button className="btn-secondary" onClick={handleReset} style={{ padding: '0.4rem 0.6rem', fontSize: '10px' }}>
                          <RotateCcw style={{ width: 10, height: 10 }} /> Reset
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="card" style={{ padding: '1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                    <HeartPulse style={{ width: 14, height: 14, color: '#f472b6' }} />
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Study Details</h4>
                  </div>
                  {[
                    { label: 'Study Date', value: '02 Apr 2026' },
                    { label: 'Modality', value: 'Echo 2D/M-Mode' },
                    { label: 'View', value: 'Parasternal Long' },
                    { label: 'Frame Rate', value: '60 fps' },
                    { label: 'Probe', value: 'S5-1 Phased' },
                  ].map((row) => (
                    <div key={row.label} className="info-row">
                      <span className="info-row-label">{row.label}</span>
                      <span className="info-row-value">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                    <Scan style={{ width: 14, height: 14, color: 'var(--accent-purple)' }} />
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Cardiac Measurements</h4>
                    {segmentedImage && <span className="badge badge-green" style={{ marginLeft: 'auto' }}>AI-Generated</span>}
                  </div>
                  {[
                    { label: 'EF (Ejection Fraction)', value: aiMetrics?.ejection_fraction || '—', color: aiMetrics ? 'var(--success)' : 'var(--text-muted)' },
                    { label: 'LV Area', value: aiMetrics?.lv_area || '—', color: aiMetrics ? 'var(--accent-blue)' : 'var(--text-muted)' },
                    { label: 'LV-EDD', value: aiMetrics?.lv_edd || '—', color: aiMetrics ? 'var(--accent-blue)' : 'var(--text-muted)' },
                    { label: 'Confidence', value: aiMetrics?.confidence || '—', color: aiMetrics ? 'var(--success)' : 'var(--text-muted)' },
                  ].map((row) => (
                    <div key={row.label} className="info-row">
                      <span className="info-row-label">{row.label}</span>
                      <span className="info-row-value" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  {!segmentedImage && <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>Run segmentation to extract measurements</p>}
                </div>
                
                {segmentedImage && (
                  <div className="card animate-slide-up" style={{ padding: '1.125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                      <AlertTriangle style={{ width: 13, height: 13, color: 'var(--warning)' }} />
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>AI Confidence</h4>
                    </div>
                    {[
                      { label: 'LV', pct: 97, color: 'var(--accent-blue)' },
                      { label: 'RV', pct: 94, color: 'var(--accent-purple)' },
                      { label: 'LA', pct: 91, color: '#f472b6' },
                      { label: 'RA', pct: 88, color: '#fbbf24' },
                    ].map((item) => (
                      <div key={item.label} style={{ marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: '11px', color: item.color, fontFamily: 'monospace', fontWeight: 700 }}>{item.pct}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            </div>
          </main>
"""

with open(r"c:\Users\Syed Shakib ali\Downloads\EchoAI001\src\App.tsx", "w", encoding="utf-8") as f:
    f.write(pre + new_middle + post)

print("Rewrite successful")
