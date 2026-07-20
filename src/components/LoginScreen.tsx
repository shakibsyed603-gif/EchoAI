import { useState } from 'react';
import { HeartPulse, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    const [doctorId, setDoctorId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Authenticating User...');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthenticating(true);

        const messages = [
            'Loading Clinical Workspace...',
            'Initializing AI Modules...',
            'Redirecting...'
        ];
        
        let msgIndex = 0;
        const interval = setInterval(() => {
            if (msgIndex < messages.length) {
                setLoadingMessage(messages[msgIndex]);
                msgIndex++;
            }
        }, 500);

        setTimeout(() => {
            clearInterval(interval);
            setIsAuthenticating(false);
            onLogin();
        }, 2000);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top, #FFFFFF 0%, #E6EDF5 100%)',
            backgroundImage: 'radial-gradient(circle at top, #FFFFFF 0%, #E6EDF5 100%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23004B9F\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            position: 'relative',
        }}>
            <div className="animate-slide-up" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '3rem 2.5rem',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 10px 20px -15px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                zIndex: 10,
                border: '1px solid #F0F4F8'
            }}>
                {isAuthenticating && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '16px', zIndex: 50,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                         <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#004B9F', borderRadius: '50%', marginBottom: '20px' }} />
                         <span style={{ fontSize: '15px', fontWeight: 600, color: '#102A43' }}>{loadingMessage}</span>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(0, 75, 159, 0.2)', background: 'rgba(0, 75, 159, 0.05)', marginBottom: '1.5rem' }}>
                        <ShieldCheck style={{ width: 14, height: 14, color: '#004B9F' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#004B9F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Clinical Access</span>
                    </div>
                    <div style={{
                        width: '64px', height: '64px',
                        background: '#ffffff',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(0, 75, 159, 0.12)',
                        margin: '0 auto 1.25rem',
                        border: '1px solid #F0F4F8'
                    }}>
                        <HeartPulse style={{ width: '32px', height: '32px', color: '#004B9F' }} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#102A43', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        EchoAI Clinical Platform
                    </h1>
                    <p style={{ fontSize: '13px', color: '#627D98', lineHeight: 1.5 }}>
                        AI-Powered Echocardiography<br/>Clinical Decision Support
                    </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334E68', marginBottom: '0.4rem' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9FB3C8' }} />
                            <input
                                type="text"
                                placeholder="doctor@hospital.com"
                                value={doctorId}
                                onChange={(e) => setDoctorId(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    background: '#F0F4F8', border: '1px solid #D9E2EC',
                                    borderRadius: '8px', color: '#102A43', fontSize: '14px',
                                    transition: 'all 0.2s', outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#004B9F'}
                                onBlur={(e) => e.target.style.borderColor = '#D9E2EC'}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334E68', marginBottom: '0.4rem' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9FB3C8' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                                    background: '#F0F4F8', border: '1px solid #D9E2EC',
                                    borderRadius: '8px', color: '#102A43', fontSize: '14px',
                                    transition: 'all 0.2s', outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#004B9F'}
                                onBlur={(e) => e.target.style.borderColor = '#D9E2EC'}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <EyeOff style={{ width: '16px', height: '16px', color: '#9FB3C8' }} />
                                ) : (
                                    <Eye style={{ width: '16px', height: '16px', color: '#9FB3C8' }} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-0.25rem', marginBottom: '0.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: '#004B9F', width: 14, height: 14, cursor: 'pointer' }} />
                            <span style={{ fontSize: '13px', color: '#627D98', fontWeight: 500 }}>Remember Me</span>
                        </label>
                        <a href="#" style={{ fontSize: '13px', color: '#004B9F', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isAuthenticating}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 75, 159, 0.25)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 75, 159, 0.15)'; }}
                        style={{
                            width: '100%', padding: '0.875rem',
                            background: '#004B9F', border: 'none',
                            borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(0, 75, 159, 0.15)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        Sign In <ArrowRight style={{ width: 16, height: 16 }} />
                    </button>
                    
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                            🔒 Secure Authentication
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#94A3B8' }}>
                            <span>• Encrypted Session</span>
                            <span>• Research Edition v1.0</span>
                        </div>
                    </div>
                </form>
            </div>
            
            <div style={{ position: 'absolute', bottom: '2.5rem', textAlign: 'center', width: '100%', zIndex: 1 }}>
                <p style={{ fontSize: '12px', color: '#627D98', lineHeight: 1.8, margin: 0 }}>
                    <span style={{ fontWeight: 600 }}>EchoAI Clinical Platform</span> • Research Edition<br/>
                    Department of Computer Science & Engineering<br/>
                    Academic Major Project • Version 1.0
                </p>
            </div>
        </div>
    );
}
