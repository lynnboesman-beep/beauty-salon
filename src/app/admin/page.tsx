'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './admin-dashboard.module.css';

interface Client {
  full_name: string;
}

interface Service {
  name: string;
}

interface Staff {
  full_name: string;
}

interface Appointment {
  id: string;
  start_time: string;
  status: string;
  clients: Client;
  services: Service;
  staff: Staff;
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          status,
          clients (full_name),
          services (name),
          staff (full_name)
        `)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error.message);
      } else {
        setAppointments(data as Appointment[]);
      }

      setLoading(false);
    }
    fetchAppointments();
  }, [router]);

  const handleShowCancelModal = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', appointmentToCancel);

    if (error) {
      console.error('Failed to cancel appointment:', error.message);
      setMessage({ text: 'Failed to cancel appointment.', type: 'error' });
    } else {
      setAppointments(appointments.map(appt =>
        appt.id === appointmentToCancel ? { ...appt, status: 'canceled' } : appt
      ));
      setMessage({ text: 'Appointment successfully canceled!', type: 'success' });
    }

    setAppointmentToCancel(null);
    setShowModal(false);
    
    setTimeout(() => {
      setMessage(null);
    }, 3000); // Clear the message after 3 seconds
  };

  const handleCloseModal = () => {
    setAppointmentToCancel(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div>Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <div className={styles.navLinks}>
        <a href="/admin/services">Manage Services</a>
        <a href="/admin/sub-services">Manage Sub-Services</a>
        <a href="/admin/staff">Manage Staff</a>
      </div>
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}
      <h2>All Appointments</h2>
      {appointments.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>Client Name</th>
                <th className={styles.tableHeader}>Service</th>
                <th className={styles.tableHeader}>Staff</th>
                <th className={styles.tableHeader}>Date</th>
                <th className={styles.tableHeader}>Time</th>
                <th className={styles.tableHeader}>Status</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className={styles.tableCell}>{appointment.clients?.full_name}</td>
                  <td className={styles.tableCell}>{appointment.services?.name}</td>
                  <td className={styles.tableCell}>{appointment.staff?.full_name}</td>
                  <td className={styles.tableCell}>{new Date(appointment.start_time).toLocaleDateString()}</td>
                  <td className={styles.tableCell}>{new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className={styles.tableCell}>{appointment.status}</td>
                  <td className={styles.tableCell}>
                    {appointment.status !== 'canceled' && (
                      <button
                        onClick={() => handleShowCancelModal(appointment.id)}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No appointments found.</p>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirm Cancellation</h2>
            <p>Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button 
                onClick={handleConfirmCancel} 
                className={`${styles.modalButton} ${styles.confirmButton}`}
              >
                Yes, Cancel
              </button>
              <button 
                onClick={handleCloseModal} 
                className={`${styles.modalButton} ${styles.cancelModalButton}`}
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
