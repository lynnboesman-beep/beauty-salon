'use client';

import { useAdminProtection } from '@/hooks/useAdminCheck';
import styles from './admin-layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading, user, error } = useAdminProtection();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Verifying admin privileges...</p>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h1>🚫 Access Denied</h1>
          <p className={styles.errorMessage}>
            {error === 'Not authenticated' 
              ? 'You must be logged in to access the admin area.'
              : error === 'User is not a staff member'
              ? 'You must be a staff member to access the admin area.'
              : error === 'User does not have admin privileges'
              ? 'You do not have administrator privileges.'
              : 'You are not authorized to access this area.'
            }
          </p>
          <p className={styles.redirectMessage}>
            Redirecting you to the login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <div className={styles.adminHeader}>
        <h1>Admin Dashboard</h1>
        <p className={styles.welcomeMessage}>
          Welcome, {user?.user_metadata?.full_name || user?.email}
        </p>
      </div>
      <div className={styles.adminContent}>
        {children}
      </div>
    </div>
  );
}
