'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Service {
  id: string;
  name: string;
  price: number;
  description: string | null;
  duration_minutes: number;
  image_url: string | null;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name, price, description, duration_minutes, image_url')
          .eq('is_active', true)
          .order('name');
        
        if (servicesError) {
          console.error('Error fetching services:', servicesError.message);
        } else {
          setServices(servicesData as Service[]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <h1 className={styles.welcomeTitle}>Welcome to YourBeautyOurPriority!</h1>
          <p className={styles.loadingText}>Loading our services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.welcomeTitle}>Welcome to YourBeautyOurPriority!</h1>
        <p className={styles.welcomeText}>Browse our selection of top-notch salon services below.</p>
      </div>

      <div className={styles.grid}>
        {services.length > 0 ? (
          services.map((service) => (
            <Link key={service.id} href={`/services/${service.id}/sub-services`} className={styles.categoryLink}>
              <div className={styles.card}>
                {service.image_url ? (
                  <img 
                    src={service.image_url} 
                    alt={service.name} 
                    className={styles.cardImage}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    <span className={styles.categoryIcon}>✨</span>
                  </div>
                )}
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{service.name}</h2>
                  <p className={styles.cardDescription}>{service.description || 'Professional service tailored to your needs'}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.serviceCount}>Duration: {service.duration_minutes} minutes</span>
                    <span className={styles.servicePrice}>Starting from R{service.price.toFixed(2)}</span>
                  </div>
                  <div className={styles.exploreText}>View sub-services →</div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.noServicesCard}>
            <h2>No Services Available</h2>
            <p>Please add some services through the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}

