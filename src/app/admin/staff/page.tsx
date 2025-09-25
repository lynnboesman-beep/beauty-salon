'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import styles from './staff.module.css';

type Staff = Database['public']['Tables']['staff']['Row'];

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({ full_name: '', role: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDeleteId, setStaffToDeleteId] = useState<string | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('full_name', { ascending: true });
    if (error) {
      console.error('Error fetching staff:', error.message);
      showMessage('Failed to fetch staff members.', 'error');
    } else {
      setStaff(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStaff({ ...newStaff, [name]: value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingStaff) {
      setEditingStaff({ ...editingStaff, [name]: value });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStaff.full_name === '' || newStaff.role === '') {
      showMessage('Full Name and Role cannot be empty.', 'error');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('staff').insert({
      full_name: newStaff.full_name,
      role: newStaff.role
    });

    if (error) {
      console.error('Error adding staff member:', error.message);
      showMessage('Error adding staff member.', 'error');
    } else {
      setNewStaff({ full_name: '', role: '' });
      showMessage('Staff member added successfully!', 'success');
      fetchStaff();
    }
    setIsSubmitting(false);
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
  };

  const handleSaveEdit = async () => {
    if (!editingStaff || editingStaff.full_name === '' || editingStaff.role === '') {
      showMessage('Full Name and Role cannot be empty.', 'error');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase
      .from('staff')
      .update({ full_name: editingStaff.full_name, role: editingStaff.role })
      .eq('id', editingStaff.id);

    if (error) {
      console.error('Error saving staff member:', error.message);
      showMessage('Error saving staff member.', 'error');
    } else {
      setEditingStaff(null);
      showMessage('Staff member updated successfully!', 'success');
      fetchStaff();
    }
    setIsSubmitting(false);
  };

  const handleCancelEdit = () => {
    setEditingStaff(null);
  };

  const showDeleteConfirmation = (staffId: string) => {
    setStaffToDeleteId(staffId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!staffToDeleteId) return;

    const { error } = await supabase.from('staff').delete().eq('id', staffToDeleteId);
    if (error) {
      console.error('Error deleting staff member:', error.message);
      showMessage('Error deleting staff member.', 'error');
    } else {
      showMessage('Staff member deleted successfully!', 'success');
      fetchStaff();
    }

    setShowDeleteModal(false);
    setStaffToDeleteId(null);
  };

  if (loading) {
    return <div className={styles.loading}>Loading staff...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Manage Staff</h1>

      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Add New Staff Member</h2>
        <form onSubmit={handleAddSubmit} className={styles.form}>
          <input
            type="text"
            name="full_name"
            value={newStaff.full_name}
            onChange={handleAddChange}
            placeholder="Full Name"
            required
            className={styles.input}
          />
          <input
            type="text"
            name="role"
            value={newStaff.role}
            onChange={handleAddChange}
            placeholder="Role (e.g., Hair Stylist)"
            required
            className={styles.input}
          />
          <button type="submit" disabled={isSubmitting} className={styles.button}>
            {isSubmitting ? 'Adding...' : 'Add Staff Member'}
          </button>
        </form>
      </section>

      <section className={styles.tableSection}>
        <h2 className={styles.sectionTitle}>Existing Staff</h2>
        {staff.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>Full Name</th>
                <th className={styles.tableHeader}>Role</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((staffMember) => (
                <tr key={staffMember.id}>
                  {editingStaff && editingStaff.id === staffMember.id ? (
                    <>
                      <td className={styles.tableCell}>
                        <input
                          type="text"
                          name="full_name"
                          value={editingStaff.full_name}
                          onChange={handleEditChange}
                          required
                          className={styles.input}
                        />
                      </td>
                      <td className={styles.tableCell}>
                        <input
                          type="text"
                          name="role"
                          value={editingStaff.role || ''}
                          onChange={handleEditChange}
                          placeholder="Role"
                          required
                          className={styles.input}
                        />
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.actions}>
                          <button onClick={handleSaveEdit} disabled={isSubmitting} className={styles.saveButton}>Save</button>
                          <button onClick={handleCancelEdit} disabled={isSubmitting} className={styles.cancelButton}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={styles.tableCell}>{staffMember.full_name}</td>
                      <td className={styles.tableCell}>{staffMember.role}</td>
                      <td className={styles.tableCell}>
                        <div className={styles.actions}>
                          <button onClick={() => handleEdit(staffMember)} className={styles.editButton}>Edit</button>
                          <button onClick={() => showDeleteConfirmation(staffMember.id)} className={styles.deleteButton}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No staff members found.</p>
        )}
      </section>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button 
                onClick={handleDelete} 
                className={`${styles.modalButton} ${styles.confirmButton}`}
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className={`${styles.modalButton} ${styles.cancelButton}`}
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