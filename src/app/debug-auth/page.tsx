'use client';

import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const [urls, setUrls] = useState({
    origin: '',
    resetUrl: '',
    environment: '',
  });

  useEffect(() => {
    setUrls({
      origin: window.location.origin,
      resetUrl: `${window.location.origin}/reset-password`,
      environment: process.env.NODE_ENV || 'development',
    });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <h1>🔧 Authentication Debug Information</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Current Configuration</h2>
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <p><strong>Environment:</strong> {urls.environment}</p>
          <p><strong>Current Origin:</strong> {urls.origin}</p>
          <p><strong>Reset Password URL:</strong> {urls.resetUrl}</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>🎯 Supabase Configuration Required</h2>
        <p>Add these URLs to your Supabase project&apos;s <strong>Authentication → URL Configuration → Redirect URLs</strong>:</p>
        
        <div style={{ backgroundColor: '#e7f3ff', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <h3>Development URL:</h3>
          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>http://localhost:3000/reset-password</span>
            <button 
              onClick={() => copyToClipboard('http://localhost:3000/reset-password')}
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
            >
              Copy
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: '#e8f5e8', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <h3>Production URL (Vercel deployment):</h3>
          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>https://yourbeautyourpriority.vercel.app/reset-password</span>
            <button 
              onClick={() => copyToClipboard('https://yourbeautyourpriority.vercel.app/reset-password')}
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>📋 Step-by-Step Setup</h2>
        <ol style={{ lineHeight: '1.6' }}>
          <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a></li>
          <li>Select your salon project</li>
          <li>Navigate to <strong>Authentication</strong> → <strong>URL Configuration</strong></li>
          <li>In the <strong>&quot;Redirect URLs&quot;</strong> field, add both URLs above (one per line)</li>
          <li>Click <strong>Save</strong></li>
          <li>Test the forgot password flow</li>
        </ol>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>🧪 Test the Flow</h2>
        <ol style={{ lineHeight: '1.6' }}>
          <li><a href="/forgot-password">Go to Forgot Password page</a></li>
          <li>Enter your email address</li>
          <li>Check your email</li>
          <li>Click the reset link in the email</li>
          <li>It should redirect you to <code>/reset-password</code></li>
        </ol>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
        <h3>⚠️ Important Notes:</h3>
        <ul>
          <li>The email link will only work if the redirect URL is properly configured in Supabase</li>
          <li>Make sure you&apos;re testing with an email that actually exists</li>
          <li>Check your spam folder for the reset email</li>
          <li>The reset link expires after a certain time (usually 1 hour)</li>
        </ul>
      </div>
    </div>
  );
}