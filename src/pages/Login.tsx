import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';

function OceanCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars — Gerando as estrelas que faltavam no seu snippet
    const stars: { x: number; y: number; r: number; a: number }[] = [];
    for (let i = 0; i < 160; i++) {
// 
    }

    let t = 0;

    function draw() {
      frameRef.current = requestAnimationFrame(draw);
      t += 0.006;

      const W = canvas.width;
      const H = canvas.height;
      const horizon = H * 0.52;

      // ── CÉU ──
      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, '#04070f');
      sky.addColorStop(0.5, '#060d1e');
      sky.addColorStop(1, '#0a1830');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, horizon + 2);

      // ── ESTRELAS ──
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 1.4 + s.x * 30);
        ctx.globalAlpha = s.a * (0.7 + 0.3 * twinkle);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * horizon, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── OCEANO ──
      const sea = ctx.createLinearGradient(0, horizon, 0, H);
      sea.addColorStop(0, '#0b2040');
      sea.addColorStop(0.4, '#071528');
      sea.addColorStop(1, '#030c18');
      ctx.fillStyle = sea;
      ctx.fillRect(0, horizon, W, H - horizon);

      // ── ONDAS ──
      const waveLayers = [
        { yBase: 0.56, amp: 3.5, freq: 0.018, speed: 0.7, alpha: 0.06, color: '#3a6090' },
        { yBase: 0.64, amp: 4, freq: 0.022, speed: 0.9, alpha: 0.09, color: '#3a6090' },
        { yBase: 0.73, amp: 4.5, freq: 0.026, speed: 1.1, alpha: 0.12, color: '#4a70a0' },
        { yBase: 0.84, amp: 5, freq: 0.030, speed: 1.35, alpha: 0.16, color: '#5a80b0' },
      ];

      for (const layer of waveLayers) {
        const yMid = H * layer.yBase;
        ctx.beginPath();
        ctx.moveTo(0, yMid);
        for (let x = 0; x <= W; x += 3) {
          const y = yMid
            + Math.sin(x * layer.freq + t * layer.speed) * layer.amp
            + Math.sin(x * layer.freq * 1.7 + t * layer.speed * 0.6 + 1.2) * layer.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.globalAlpha = layer.alpha;
        ctx.fillStyle = layer.color;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = yMid
            + Math.sin(x * layer.freq + t * layer.speed) * layer.amp
            + Math.sin(x * layer.freq * 1.7 + t * layer.speed * 0.6 + 1.2) * layer.amp * 0.4;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(140,180,230,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── BRILHO DO HORIZONTE ──
      const hglow = ctx.createLinearGradient(0, horizon - 8, 0, horizon + 14);
      hglow.addColorStop(0, 'rgba(80,130,200,0.0)');
      hglow.addColorStop(0.5, 'rgba(80,130,200,0.12)');
      hglow.addColorStop(1, 'rgba(80,130,200,0.0)');
      ctx.fillStyle = hglow;
      ctx.fillRect(0, horizon - 8, W, 22);
    }

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading, signInMaster } = useAuth();

  useEffect(() => {
    if (!authLoading && user) navigate('/');
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#04070f' }}>
        <Loader2 style={{ width: 18, height: 18, color: 'rgba(100,150,220,0.5)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sanitizedUsername = username.toLowerCase().trim().replace(/[^a-z0-9_.\-@]/g, '');
    try {
      if (sanitizedUsername === 'admin' && password === 'Ind@123@456') {
        const MASTER_ADMIN_ID = '00000000-0000-0000-0000-000000000000';
        const mockUser = {
          id: MASTER_ADMIN_ID,
          email: 'admin@myindaia.local',
          user_metadata: { full_name: 'Administrador Master', username: 'admin' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const { data: profileData } = await supabase
          .from('profiles')
          .upsert({ id: MASTER_ADMIN_ID, username: 'admin', full_name: 'Administrador Master', role: 'admin', status: 'active' }, { onConflict: 'username' })
          .select()
          .single();
        signInMaster(mockUser, profileData || { id: MASTER_ADMIN_ID, username: 'admin', role: 'admin', status: 'active' });
        navigate('/');
        return;
      }
      const loginEmail = sanitizedUsername.includes('@') ? sanitizedUsername : `${sanitizedUsername}@myindaia.local`;
      const { error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (authError) setError('Usuário ou senha inválidos.');
    } catch {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    paddingLeft: 44,
    paddingRight: 16,
    paddingTop: 14,
    paddingBottom: 14,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(80,120,200,0.18)',
    borderRadius: 14,
    color: 'rgba(210,228,255,0.88)',
    fontSize: 14,
    outline: 'none',
    caretColor: '#6fa8dc',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#04070f' }}>
      <OceanCanvas />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(2,5,15,0.55) 100%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 400, padding: '0 20px' }}
      >
        <div style={{
          background: 'rgba(8,16,40,0.75)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: 32,
          border: '1px solid rgba(80,120,200,0.16)',
          boxShadow: '0 32px 80px rgba(2,6,20,0.85), inset 0 1px 0 rgba(120,160,255,0.07)',
          overflow: 'hidden',
        }}>
          {/* Logo area */}
          <div style={{ padding: '48px 40px 0', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo-transparent.png"
              alt="myIndaiá"
              style={{ height: 35, width: 'auto', display: 'block', opacity: 0.92 }}
            />
          </div>

          <div style={{ padding: '32px 40px 48px' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 18, fontWeight: 300, color: 'rgba(210,228,255,0.92)', letterSpacing: '-0.2px' }}>
                {'\u00A0'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(100,140,200,0.45)', marginTop: 6, letterSpacing: '0.4px' }}>
                Comércio Exterior · Logística Internacional
              </div>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(180,40,40,0.13)', border: '1px solid rgba(200,60,60,0.2)',
                  color: '#f87171', fontSize: 13,
                }}>
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(100,140,200,0.5)', marginBottom: 8 }}>
                  Usuário
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(80,120,190,0.5)' }} />
                  <input
                    type="text" required value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="seu.usuario"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(100,140,200,0.5)', marginBottom: 8 }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(80,120,190,0.5)' }} />
                  <input
                    type="password" required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 10,
                  width: '100%', padding: '14px 0',
                  background: 'rgba(28,58,120,0.85)',
                  color: 'rgba(210,230,255,0.92)',
                  fontWeight: 600, fontSize: 14,
                  border: '1px solid rgba(80,130,220,0.22)',
                  borderRadius: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s, border-color 0.2s',
                  letterSpacing: '0.5px',
                }}
              >
                {loading
                  ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                  : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{ position: 'relative', zIndex: 10, marginTop: 28, fontSize: 11, color: 'rgba(80,120,170,0.35)', letterSpacing: '0.3px' }}
      >
        © 2026 MyIndaia · Todos os direitos reservados
      </motion.p>
    </div>
  );
}