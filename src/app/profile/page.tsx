'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  // const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
  });

  // Check authentication on component mount
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/profile');
        return;
      }
      setUser(session.user);
      
      // Load user profile data
      setProfileData({
        fullName: session.user.user_metadata?.full_name || '',
        email: session.user.email || '',
      });
      
      setAuthLoading(false);
    }
    checkAuth();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
        }
      });

      if (error) {
        throw error;
      }

      // Update the client record as well
      await supabase
        .from('clients')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          email: profileData.email,
        });

      setMessage({text: 'Profile updated successfully!', type: 'success'});
      
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error updating profile:', error.message);
      setMessage({text: error.message || 'Failed to update profile', type: 'error'});
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <h1>Profile</h1>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <h1>Authentication Required</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>My Profile</h1>
      
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      <div className={styles.profileCard}>
        <form onSubmit={handleUpdateProfile} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              disabled
              className={`${styles.input} ${styles.disabled}`}
            />
            <small className={styles.helpText}>
              Email cannot be changed. Contact support if you need to change your email address.
            </small>
          </div>

          <button 
            type="submit" 
            disabled={updating} 
            className={styles.updateButton}
          >
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        <div className={styles.accountInfo}>
          <h3>Account Information</h3>
          <p><strong>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}