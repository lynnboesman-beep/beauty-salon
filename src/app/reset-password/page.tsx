'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './reset-password.module.css';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const router = useRouter();

  // Check for access token in URL (from email link)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // Validation
    if (password.length < 6) {
      setMessage({text: 'Password must be at least 6 characters long', type: 'error'});
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({text: 'Passwords do not match', type: 'error'});
      setLoading(false);
      return;
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage({text: error.message, type: 'error'});
    } else {
      setMessage({
        text: 'Your password has been successfully updated! Redirecting to login...',
        type: 'success'
      });
      
      // Sign out and redirect to login after successful password reset
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login?message=password_updated');
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Set New Password</h1>
        <p className={styles.subtitle}>
          Please enter your new password below.
        </p>
      </div>
      
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>New Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
          <small className={styles.hint}>Password must be at least 6 characters long</small>
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
        </div>
        
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
      
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Remember your password?{' '}
          <Link href="/login" className={styles.link}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}