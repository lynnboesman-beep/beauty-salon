'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import styles from './sub-services.module.css';

interface Service {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  full_name: string;
  role: string | null;
}

interface SubService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  service_id: string;
  service_name?: string;
  staff_count?: number;
}

export default function AdminSubServicesPage() {
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newSubServiceName, setNewSubServiceName] = useState('');
  const [newSubServiceDescription, setNewSubServiceDescription] = useState('');
  const [newSubServicePrice, setNewSubServicePrice] = useState<number | ''>('');
  const [newSubServiceDuration, setNewSubServiceDuration] = useState<number | ''>('');
  const [newSubServiceServiceId, setNewSubServiceServiceId] = useState('');
  const [newSubServiceImage, setNewSubServiceImage] = useState<File | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [staffExperienceLevels, setStaffExperienceLevels] = useState<{[staffId: string]: string}>({});
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServices(servicesData || []);
      }

      // Fetch staff (exclude admin/manager for assignment)
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, full_name, role')
        .order('full_name');

      if (staffError) {
        console.error('Error fetching staff:', staffError);
      } else {
        // Filter out admin/manager roles for staff assignment
        const availableStaff = (staffData || []).filter(s => 
          s.role !== 'admin' && s.role !== 'manager'
        );
        setStaff(availableStaff);
      }

      // Fetch sub-services with service names and staff counts
      const { data: subServicesData, error: subServicesError } = await supabase
        .from('sub_services')
        .select(`
          *,
          services!inner (name)
        `)
        .order('name');

      if (subServicesError) {
        console.error('Error fetching sub-services:', subServicesError);
      } else {
        // Get staff counts for each sub-service
        const subServicesWithCounts = await Promise.all(
          (subServicesData || []).map(async (subService) => {
            const { count } = await supabase
              .from('staff_sub_services')
              .select('*', { count: 'exact', head: true })
              .eq('sub_service_id', subService.id);
            
            return {
              ...subService,
              service_name: subService.services?.name,
              staff_count: count || 0
            };
          })
        );
        setSubServices(subServicesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubServiceName || !newSubServiceServiceId || newSubServicePrice === '' || 
        newSubServiceDuration === '' || !newSubServiceImage || selectedStaff.length === 0) {
      showMessage('Please fill out all fields, select an image, and assign at least one staff member.', 'error');
      return;
    }

    setLoading(true);
    let imageUrl: string | null = null;
    const fileExtension = newSubServiceImage.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('sub-service-images')
        .upload(fileName, newSubServiceImage);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('sub-service-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrlData.publicUrl;

      // Insert sub-service
      const { data: subServiceData, error: insertError } = await supabase
        .from('sub_services')
        .insert({
          name: newSubServiceName,
          description: newSubServiceDescription || null,
          price: newSubServicePrice,
          duration_minutes: newSubServiceDuration,
          service_id: newSubServiceServiceId,
          image_url: imageUrl
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Assign staff to sub-service
      const staffAssignments = selectedStaff.map(staffId => ({
        staff_id: staffId,
        sub_service_id: subServiceData.id,
        experience_level: staffExperienceLevels[staffId] || 'beginner'
      }));

      const { error: staffError } = await supabase
        .from('staff_sub_services')
        .insert(staffAssignments);

      if (staffError) {
        throw staffError;
      }

      // Reset form
      setNewSubServiceName('');
      setNewSubServiceDescription('');
      setNewSubServicePrice('');
      setNewSubServiceDuration('');
      setNewSubServiceServiceId('');
      setNewSubServiceImage(null);
      setSelectedStaff([]);
      setStaffExperienceLevels({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      showMessage('Sub-service added successfully!', 'success');
      fetchData();
      
    } catch (error) {
      console.error('Error adding sub-service:', error);
      showMessage('Failed to add sub-service. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubService = async (subServiceId: string) => {
    if (!confirm('Are you sure you want to delete this sub-service? This will also remove staff assignments.')) return;
    
    setLoading(true);
    try {
      // Find the sub-service to get its image URL
      const subServiceToDelete = subServices.find(s => s.id === subServiceId);
      
      // Delete the image from storage if it exists
      if (subServiceToDelete?.image_url) {
        const urlParts = subServiceToDelete.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        const { error: deleteImageError } = await supabase.storage
          .from('sub-service-images')
          .remove([fileName]);
        
        if (deleteImageError) {
          console.warn('Failed to delete image:', deleteImageError.message);
        }
      }

      // Delete sub-service (staff assignments will be deleted due to CASCADE)
      const { error: deleteError } = await supabase
        .from('sub_services')
        .delete()
        .eq('id', subServiceId);

      if (deleteError) {
        throw deleteError;
      }
      
      showMessage('Sub-service deleted successfully!', 'success');
      fetchData();
      
    } catch (error) {
      console.error('Error deleting sub-service:', error);
      showMessage('Failed to delete sub-service. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSelection = (staffId: string, checked: boolean) => {
    setSelectedStaff(prev => 
      checked 
        ? [...prev, staffId]
        : prev.filter(id => id !== staffId)
    );
    
    // Initialize experience level when staff is selected
    if (checked) {
      setStaffExperienceLevels(prev => ({
        ...prev,
        [staffId]: prev[staffId] || 'beginner'
      }));
    } else {
      // Remove experience level when staff is deselected
      setStaffExperienceLevels(prev => {
        const newLevels = { ...prev };
        delete newLevels[staffId];
        return newLevels;
      });
    }
  };

  const handleExperienceLevelChange = (staffId: string, level: string) => {
    setStaffExperienceLevels(prev => ({
      ...prev,
      [staffId]: level
    }));
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Manage Sub-Services</h1>
      
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.formContainer}>
        <h2 className={styles.subheading}>Add New Sub-Service</h2>
        <form onSubmit={handleAddSubService} className={styles.form}>
          <select
            value={newSubServiceServiceId}
            onChange={(e) => setNewSubServiceServiceId(e.target.value)}
            className={styles.input}
            required
          >
            <option value="">Select Main Service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Sub-Service Name"
            value={newSubServiceName}
            onChange={(e) => setNewSubServiceName(e.target.value)}
            className={styles.input}
            required
          />

          <textarea
            placeholder="Description (optional)"
            value={newSubServiceDescription}
            onChange={(e) => setNewSubServiceDescription(e.target.value)}
            className={styles.textarea}
            rows={3}
          />

          <input
            type="number"
            placeholder="Price"
            min="0"
            step="0.01"
            value={newSubServicePrice}
            onChange={(e) => setNewSubServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.input}
            required
          />

          <input
            type="number"
            placeholder="Duration (minutes)"
            min="1"
            value={newSubServiceDuration}
            onChange={(e) => setNewSubServiceDuration(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.input}
            required
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setNewSubServiceImage(e.target.files ? e.target.files[0] : null)}
            accept="image/*"
            className={styles.input}
            required
          />

          <div className={styles.staffSelection}>
            <h3>Assign Staff Members</h3>
            <div className={styles.staffGrid}>
              {staff.map((staffMember) => (
                <label key={staffMember.id} className={styles.staffCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(staffMember.id)}
                    onChange={(e) => handleStaffSelection(staffMember.id, e.target.checked)}
                  />
                  <span>{staffMember.full_name}</span>
                </label>
              ))}
            </div>
            
            {selectedStaff.length > 0 && (
              <div className={styles.experienceLevels}>
                <h4>Set Experience Levels</h4>
                {selectedStaff.map((staffId) => {
                  const staffMember = staff.find(s => s.id === staffId);
                  return (
                    <div key={staffId} className={styles.experienceRow}>
                      <span className={styles.staffName}>{staffMember?.full_name}</span>
                      <select
                        value={staffExperienceLevels[staffId] || 'beginner'}
                        onChange={(e) => handleExperienceLevelChange(staffId, e.target.value)}
                        className={styles.experienceSelect}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Adding...' : 'Add Sub-Service'}
          </button>
        </form>
      </div>

      <h2 className={styles.subheading}>Existing Sub-Services</h2>
      <div className={styles.tableContainer}>
        {subServices.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>Image</th>
                <th className={styles.tableHeader}>Name</th>
                <th className={styles.tableHeader}>Main Service</th>
                <th className={styles.tableHeader}>Description</th>
                <th className={styles.tableHeader}>Price</th>
                <th className={styles.tableHeader}>Duration</th>
                <th className={styles.tableHeader}>Staff Assigned</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subServices.map((subService) => (
                <tr key={subService.id}>
                  <td className={styles.tableCell}>
                    {subService.image_url ? (
                      <img 
                        src={subService.image_url} 
                        alt={subService.name} 
                        className={styles.subServiceImage}
                      />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                  </td>
                  <td className={styles.tableCell}>{subService.name}</td>
                  <td className={styles.tableCell}>{subService.service_name}</td>
                  <td className={styles.tableCell}>{subService.description || 'No description'}</td>
                  <td className={styles.tableCell}>R{subService.price.toFixed(2)}</td>
                  <td className={styles.tableCell}>{subService.duration_minutes} min</td>
                  <td className={styles.tableCell}>{subService.staff_count} staff</td>
                  <td className={styles.tableCell}>
                    <button 
                      onClick={() => handleDeleteSubService(subService.id)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>No sub-services found. Add your first sub-service above!</p>
          </div>
        )}
      </div>
    </div>
  );
}