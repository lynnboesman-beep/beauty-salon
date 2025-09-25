'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const messageParam = searchParams.get('message');

  // Show messages based on URL parameters
  useEffect(() => {
    if (messageParam === 'admin_required') {
      setMessage({text: 'Admin privileges required. Please login with an administrator account.', type: 'error'});
    } else if (messageParam === 'password_updated') {
      setMessage({text: 'Your password has been successfully updated! Please login with your new password.', type: 'success'});
    }
  }, [messageParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setMessage({text: 'Passwords do not match', type: 'error'});
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setMessage({text: 'Password must be at least 6 characters long', type: 'error'});
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        setMessage({text: error.message, type: 'error'});
      } else if (data.user && !data.session) {
        setMessage({text: 'Please check your email to confirm your account', type: 'success'});
      } else {
        // Auto-create client record
        if (data.user) {
          await supabase.from('clients').insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
          });
        }
        router.push(redirectTo);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({text: error.message, type: 'error'});
      } else {
        router.push(redirectTo);
      }
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (error) {
      setMessage({text: error.message, type: 'error'});
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
      
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {isSignUp && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={styles.input}
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        
        {isSignUp && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={styles.input}
          />
        )}
        
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? (isSignUp ? 'Creating Account...' : 'Logging in...') : (isSignUp ? 'Create Account' : 'Login')}
        </button>
      </form>
      
      {!isSignUp && (
        <div className={styles.forgotPassword}>
          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot your password?
          </Link>
        </div>
      )}
      
      <div className={styles.divider}>Or</div>
      
      <button onClick={handleGoogleLogin} className={styles.googleButton}>
        {isSignUp ? 'Sign up' : 'Login'} with Google
      </button>
      
      <div className={styles.toggleContainer}>
        <button 
          type="button" 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage(null);
            setPassword('');
            setConfirmPassword('');
            setFullName('');
          }} 
          className={styles.toggleButton}
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <h1>Loading...</h1>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
