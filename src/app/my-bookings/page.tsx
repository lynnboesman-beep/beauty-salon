'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './my-bookings.module.css';

interface Service {
  name: string;
  price: number;
  duration_minutes: number;
}

interface Staff {
  full_name: string;
}

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  services: Service;
  staff: Staff;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/my-bookings');
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    async function fetchBookings() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          services (name, price, duration_minutes),
          staff (full_name)
        `)
        .eq('client_id', user.id)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error.message);
        setMessage({text: 'Failed to load bookings', type: 'error'});
      } else {
        setBookings(data as Booking[]);
      }
      
      setLoading(false);
    }
    
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', bookingToCancel);

    if (error) {
      console.error('Failed to cancel booking:', error.message);
      setMessage({text: 'Failed to cancel booking', type: 'error'});
    } else {
      setBookings(bookings.map(booking =>
        booking.id === bookingToCancel ? { ...booking, status: 'canceled' } : booking
      ));
      setMessage({text: 'Booking canceled successfully', type: 'success'});
    }

    setBookingToCancel(null);
    setShowCancelModal(false);
    
    setTimeout(() => setMessage(null), 3000);
  };

  const canCancelBooking = (booking: Booking) => {
    const bookingDate = new Date(booking.start_time);
    const now = new Date();
    const hoursDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return booking.status === 'confirmed' && hoursDiff > 24; // Can cancel if more than 24 hours away
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <h1>My Bookings</h1>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <h1>Authentication Required</h1>
        <p>Please log in to view your bookings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>My Bookings</h1>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>My Bookings</h1>
      
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      {bookings.length > 0 ? (
        <div className={styles.bookingsGrid}>
          {bookings.map((booking) => (
            <div key={booking.id} className={`${styles.bookingCard} ${styles[booking.status]}`}>
              <div className={styles.bookingHeader}>
                <h3>{booking.services.name}</h3>
                <span className={styles.status}>{booking.status}</span>
              </div>
              
              <div className={styles.bookingDetails}>
                <p><strong>Staff:</strong> {booking.staff.full_name}</p>
                <p><strong>Date:</strong> {formatDate(booking.start_time)}</p>
                <p><strong>Time:</strong> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                <p><strong>Duration:</strong> {booking.services.duration_minutes} minutes</p>
                <p><strong>Price:</strong> R{booking.services.price.toFixed(2)}</p>
                
                {booking.notes && (
                  <p><strong>Notes:</strong> {booking.notes}</p>
                )}
              </div>
              
              <div className={styles.bookingActions}>
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => {
                      setBookingToCancel(booking.id);
                      setShowCancelModal(true);
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel Booking
                  </button>
                )}
                
                {booking.status === 'canceled' && (
                  <span className={styles.canceledText}>This booking has been canceled</span>
                )}
                
                {booking.status === 'confirmed' && !canCancelBooking(booking) && (
                  <span className={styles.noCancelText}>Cannot cancel (less than 24h away)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h2>No bookings found</h2>
          <p>You haven&apos;t made any bookings yet.</p>
          <a href="/booking" className={styles.bookNowButton}>
            Book Your First Appointment
          </a>
        </div>
      )}

      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Cancel Booking</h2>
            <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button 
                onClick={handleCancelBooking} 
                className={styles.confirmButton}
              >
                Yes, Cancel Booking
              </button>
              <button 
                onClick={() => {
                  setShowCancelModal(false);
                  setBookingToCancel(null);
                }} 
                className={styles.cancelModalButton}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}