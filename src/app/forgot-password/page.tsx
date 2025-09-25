'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    // Determine the correct redirect URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourbeautyourpriority.vercel.app'
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (error) {
      setMessage({text: error.message, type: 'error'});
    } else {
      setMessage({
        text: 'Password reset instructions have been sent to your email address. Please check your inbox and spam folder.',
        type: 'success'
      });
      setEmail('');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reset Your Password</h1>
        <p className={styles.subtitle}>
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>
      
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Sending Instructions...
            </>
          ) : (
            'Send Reset Instructions'
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
        <p className={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link href="/login" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}