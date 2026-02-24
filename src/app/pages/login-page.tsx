import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowLeft, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { login, getAuthState } from '../lib/store';
import { toast } from 'sonner';
import logo from '../../assets/Logo_Ravnx.png';

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"'&]/g, '')
    .trim()
    .slice(0, 254);
}

function useRateLimit(maxAttempts: number, windowMs: number) {
  const [attempts, setAttempts] = useState<number[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const recentAttempts = attempts.filter(time => now - time < windowMs);
      setAttempts(recentAttempts);
      setIsBlocked(recentAttempts.length >= maxAttempts);
    }, 1000);
    return () => clearInterval(interval);
  }, [attempts, maxAttempts, windowMs]);

  const recordAttempt = useCallback(() => {
    setAttempts(prev => [...prev, Date.now()]);
    setIsBlocked(true);
  }, []);

  const resetAttempts = useCallback(() => {
    setAttempts([]);
    setIsBlocked(false);
  }, []);

  return { isBlocked, recordAttempt, resetAttempts };
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { isBlocked, recordAttempt, resetAttempts } = useRateLimit(5, 60000);

  useEffect(() => {
    const auth = getAuthState();
    if (auth.isAuthenticated) {
      navigate('/rapi', { replace: true });
    }
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setEmail(sanitized);
    setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setPassword(sanitized);
    setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error('Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.');
      return;
    }

    setEmailError('');
    setPasswordError('');
    setLoading(true);

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
      setEmailError('Email tidak valid');
      setLoading(false);
      return;
    }

    if (!sanitizedPassword || sanitizedPassword.length < 4) {
      setPasswordError('Password minimal 4 karakter');
      setLoading(false);
      return;
    }

    await new Promise(r => setTimeout(r, 800));

    if (login(sanitizedEmail, sanitizedPassword)) {
      resetAttempts();
      toast.success('Login berhasil! Mengalihkan...');
      navigate('/rapi', { replace: true });
    } else {
      recordAttempt();
      setPasswordError('Email atau password salah');
      toast.error('Login gagal. Silakan coba lagi.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
      <div className="absolute top-4 left-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <img src={logo} alt="Ravnx" className="h-12 w-auto object-contain" />
            <span className="text-foreground tracking-tight" style={{ fontSize: '2rem', fontWeight: 700 }}>
              Ravnx<span className="text-primary">.</span>
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div> */}
            <h1 className="!text-xl sm:!text-2xl text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Masuk untuk mengelola konten
            </p>
          </motion.div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="api@portfolio.dev"
                value={email}
                onChange={handleEmailChange}
                className={`pl-10 rounded-xl bg-background ${emailError ? 'border-destructive focus:border-destructive' : ''}`}
                required
                autoComplete="email"
                disabled={loading}
                maxLength={254}
              />
            </div>
            {emailError && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={handlePasswordChange}
                className={`pl-10 pr-10 rounded-xl bg-background ${passwordError ? 'border-destructive focus:border-destructive' : ''}`}
                required
                autoComplete="current-password"
                disabled={loading}
                maxLength={128}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>
            {passwordError && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {passwordError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={loading || isBlocked}
          >
            {loading ? 'Memproses...' : isBlocked ? 'Terlalu banyak percobaan' : 'Masuk'}
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6 p-4 rounded-xl bg-muted/50 border border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            <span className="text-foreground font-medium">Demo credentials:</span>
            <br className="my-1" />
            Email: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">api@portfolio.dev</code>
            <br className="my-1" />
            Password: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">admin123</code>
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/60 mt-6"
        >
          Hanya untuk akses terbatas. Semua aktivitas tercatat.
        </motion.p>
      </motion.div>
    </div>
  );
}
