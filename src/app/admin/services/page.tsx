'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import styles from './services.module.css';

interface Service {
  id: string;
  name: string;
  price: number;
  description: string | null;
  duration_minutes: number;
  image_url: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState<number | ''>('');
  const [newServiceImage, setNewServiceImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (servicesError) {
        console.error('Error fetching services:', servicesError.message);
      } else {
        setServices(servicesData as Service[]);
      }
      
      setLoading(false);
    }
    fetchData();
  }, [router]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || newServicePrice === '' || newServiceDuration === '' || !newServiceImage) {
      alert('Please fill out all fields and select an image.');
      return;
    }

    setLoading(true);
    let imageUrl: string | null = null;
    const fileExtension = newServiceImage.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(fileName, newServiceImage);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('service-images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrlData.publicUrl;

      const { data, error: insertError } = await supabase
        .from('services')
        .insert([{ 
          name: newServiceName, 
          price: newServicePrice,
          description: newServiceDescription || null,
          duration_minutes: newServiceDuration,
          image_url: imageUrl
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      setServices([...services, ...(data as Service[])]);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDescription('');
      setNewServiceDuration('');
      setNewServiceImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error adding service:', (error as Error).message);
      alert('Failed to add service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    setLoading(true);

    try {
      // Find the service to get its image URL
      const serviceToDelete = services.find(s => s.id === serviceId);
      
      // Delete the image from storage if it exists
      if (serviceToDelete?.image_url) {
        const urlParts = serviceToDelete.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        const { error: deleteImageError } = await supabase.storage
          .from('service-images')
          .remove([fileName]);
        
        if (deleteImageError) {
          console.warn('Failed to delete image:', deleteImageError.message);
          // Continue with service deletion even if image deletion fails
        }
      }

      // Delete the service from database
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (deleteError) {
        throw deleteError;
      }
      
      setServices(services.filter(s => s.id !== serviceId));
      alert('Service deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting service:', (error as Error).message);
      alert('Failed to delete service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Manage Services</h1>
      
      <div className={styles.formContainer}>
        <h2 className={styles.subheading}>Add New Service</h2>
        <form onSubmit={handleAddService} className={styles.form}>
          <input
            type="text"
            placeholder="Service Name"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newServicePrice}
            onChange={(e) => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newServiceDescription}
            onChange={(e) => setNewServiceDescription(e.target.value)}
            className={styles.input}
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={newServiceDuration}
            onChange={(e) => setNewServiceDuration(e.target.value === '' ? '' : Number(e.target.value))}
            className={styles.input}
            required
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setNewServiceImage(e.target.files ? e.target.files[0] : null)}
            accept="image/*"
            className={styles.input}
            required
          />
          <button
            type="submit" 
            className={styles.submitButton}
          >
            Add Service
          </button>
        </form>
      </div>

      <h2 className={styles.subheading}>Existing Services</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.tableHeader}>Image</th>
              <th className={styles.tableHeader}>Name</th>
              <th className={styles.tableHeader}>Description</th>
              <th className={styles.tableHeader}>Duration (min)</th>
              <th className={styles.tableHeader}>Price</th>
              <th className={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td className={styles.tableCell}>
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name} 
                      className={styles.serviceImage}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                </td>
                <td className={styles.tableCell}>{service.name}</td>
                <td className={styles.tableCell}>{service.description || 'No description'}</td>
                <td className={styles.tableCell}>{service.duration_minutes}</td>
                <td className={styles.tableCell}>R{service.price.toFixed(2)}</td>
                <td className={styles.tableCell}>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
