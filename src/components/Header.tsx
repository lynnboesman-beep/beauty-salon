'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './header.module.css';
import { supabase } from '@/lib/supabase';
import { useAdminCheck } from '@/hooks/useAdminCheck';

export default function Header() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAdmin, isLoading: loading, user } = useAdminCheck();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/');
    }
    setShowUserMenu(false);
  };

  if (loading) {
    return (
      <header className={styles.header}>
        <nav className={styles.nav}>
          <span className={styles.logo}>YourBeautyOurPriority</span>
        </nav>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/">
          <span className={styles.logo}>YourBeautyOurPriority</span>
        </Link>
        
        <div className={styles.links}>
          {user ? (
            <>
              {/* Show booking links only for non-admin users */}
              {!isAdmin && (
                <Link href="/my-bookings" className={styles.link}>
                  My Bookings
                </Link>
              )}
              
              {/* Show admin dashboard only for admin users */}
              {isAdmin && (
                <Link href="/admin" className={styles.link}>
                  Admin Dashboard
                </Link>
              )}
              
              {/* User avatar and menu */}
              <div className={styles.userMenuContainer} ref={menuRef}>
                <button
                  className={styles.userAvatar}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title={user.user_metadata?.full_name || user.email}
                >
                  {(user.email || '').charAt(0).toUpperCase()}
                </button>
                
                {showUserMenu && (
                  <div className={styles.userMenu}>
                    <div className={styles.userInfo}>
                      <strong>{user.user_metadata?.full_name || user.email}</strong>
                    </div>
                    <Link href="/profile" className={styles.userMenuItem}>
                      Profile
                    </Link>
                    <button onClick={handleLogout} className={styles.userMenuItem}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.link}>
                Login
              </Link>
              <Link href="/login" className={styles.link}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
