'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './sub-services.module.css';

interface Service {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface SubService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  staff_count?: number;
  staff?: StaffMember[];
}

interface StaffMember {
  id: string;
  full_name: string;
  role: string | null;
  experience_level?: string;
}

export default function SubServicesPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the main service details
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('id, name, description, image_url')
          .eq('id', serviceId)
          .eq('is_active', true)
          .single();
        
        if (serviceError || !serviceData) {
          setError('Service not found');
          return;
        }
        
        setService(serviceData);
        
        // Fetch sub-services for this service with staff count
        const { data: subServicesData, error: subServicesError } = await supabase
          .from('sub_services')
          .select(`
            id,
            name,
            description,
            price,
            duration_minutes,
            image_url,
            staff_sub_services!inner (
              staff!inner (
                id,
                full_name,
                role
              )
            )
          `)
          .eq('service_id', serviceId)
          .eq('is_active', true)
          .order('name');
        
        if (subServicesError) {
          console.error('Error fetching sub-services:', subServicesError);
          setError('Failed to load sub-services');
          return;
        }
        
        
        if (!subServicesData || subServicesData.length === 0) {
          setError(`No sub-services available for "${serviceData.name}". Please check back later or contact us.`);
          return;
        }
        
        // Process sub-services data to group staff per sub-service
        const processedSubServices = subServicesData.reduce((acc: SubService[], current: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          image_url: string | null;
          staff_sub_services: {
            staff?: {
              id: string;
              full_name: string;
              role: string | null;
            };
          } | {
            staff?: {
              id: string;
              full_name: string;
              role: string | null;
            };
          }[];
        }) => {
          const existing = acc.find(item => item.id === current.id);

          // Normalize staff_sub_services to an array of rows, each possibly with a staff object
          const sssArray = Array.isArray(current.staff_sub_services)
            ? current.staff_sub_services
            : current.staff_sub_services
              ? [current.staff_sub_services]
              : [];

          // Extract staff members from the normalized array
          const extractedStaff: StaffMember[] = sssArray
            .map((row: { staff?: { id: string; full_name: string; role: string | null } }) => row?.staff)
            .filter((s): s is { id: string; full_name: string; role: string | null } => !!s && !!s.id)
            .map((s: { id: string; full_name: string; role: string | null }) => ({ id: s.id, full_name: s.full_name, role: s.role }));

          if (existing) {
            extractedStaff.forEach((staffMember) => {
              if (!existing.staff?.find(s => s.id === staffMember.id)) {
                existing.staff = [...(existing.staff || []), staffMember];
              }
            });
          } else {
            acc.push({
              id: current.id,
              name: current.name,
              description: current.description,
              price: current.price,
              duration_minutes: current.duration_minutes,
              image_url: current.image_url,
              staff: extractedStaff
            });
          }

          return acc;
        }, []);

        // Compute staff_count from the processed staff array (filter out admin/manager)
        const filteredSubServices = processedSubServices.map(subService => {
          const visibleStaff = (subService.staff || []).filter(st => {
            const role = (st.role || '').toLowerCase().trim();
            return role !== 'admin' && role !== 'manager';
          });
          
          return {
            ...subService,
            staff: visibleStaff,
            staff_count: visibleStaff.length
          };
        });
        
        setSubServices(filteredSubServices);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  const handleBookSubService = (subService: SubService) => {
    router.push(`/booking?subServiceId=${subService.id}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <h1>Loading Sub-Services...</h1>
          <p>Please wait while we fetch the available options.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Back to Services
          </Link>
          <h1 className={styles.serviceTitle}>Service Not Available</h1>
        </div>
        <div className={styles.errorCard}>
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <Link href="/" className={styles.backButton}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Services
        </Link>
        <div className={styles.serviceInfo}>
          {service?.image_url && (
            <img 
              src={service.image_url} 
              alt={service.name} 
              className={styles.serviceImage}
            />
          )}
          <div className={styles.serviceDetails}>
            <h1 className={styles.serviceTitle}>{service?.name}</h1>
            <p className={styles.serviceDescription}>
              {service?.description || 'Choose from our specialized sub-services below'}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.subServicesGrid}>
        {subServices.map((subService) => (
          <div key={subService.id} className={styles.subServiceCard}>
            {subService.image_url ? (
              <img 
                src={subService.image_url} 
                alt={subService.name} 
                className={styles.subServiceImage}
              />
            ) : (
              <div className={styles.placeholderImage}>
                <span className={styles.serviceIcon}>✨</span>
              </div>
            )}
            <div className={styles.subServiceContent}>
              <h3 className={styles.subServiceName}>{subService.name}</h3>
              <p className={styles.subServiceDescription}>
                {subService.description || 'Professional service tailored to your needs'}
              </p>
              <div className={styles.subServiceDetails}>
                <div className={styles.priceAndTime}>
                  <span className={styles.subServicePrice}>
                    R{subService.price.toFixed(2)}
                  </span>
                  <span className={styles.subServiceDuration}>
                    ⏱️ {subService.duration_minutes} min
                  </span>
                </div>
                <div className={styles.staffInfo}>
                  <span className={styles.staffCount}>
                    {subService.staff_count === 0 
                      ? 'No staff available' 
                      : `${subService.staff_count} staff member${subService.staff_count !== 1 ? 's' : ''} available`
                    }
                  </span>
                  {subService.staff && subService.staff.length > 0 && (
                    <div className={styles.staffList}>
                      {subService.staff.map((staff, index) => (
                        <span key={staff.id} className={styles.staffName}>
                          {staff.full_name}{index < subService.staff!.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button 
                className={styles.bookButton}
                onClick={() => handleBookSubService(subService)}
                disabled={subService.staff_count === 0}
              >
                {subService.staff_count === 0 ? 'Not Available' : 'Book This Service'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}