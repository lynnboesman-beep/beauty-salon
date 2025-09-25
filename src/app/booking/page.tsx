'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import PaymentForm from '@/components/PaymentForm';
import styles from './booking.module.css';

type SubService = Database['public']['Tables']['sub_services']['Row'] & {
  services?: { name: string };
};

interface StaffMember {
  id: string;
  full_name: string;
  role: string | null;
  experience_level?: string;
}

type BookingStep = 'details' | 'contact' | 'payment' | 'confirmation';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [formData, setFormData] = useState({
    subServiceId: '',
    staffId: '',
    date: '',
    time: '',
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  });
  
  const [subService, setSubService] = useState<SubService | null>(null);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<BookingStep>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [, setPaymentIntentId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Business hours configuration
  const BUSINESS_HOURS = {
    start: '07:00',
    end: '18:00',
    intervalMinutes: 30,
    closedDays: [0], // Sunday = 0
    workDays: [1, 2, 3, 4, 5, 6] // Monday to Saturday
  };
  
  // Generate available time slots
  const generateTimeSlots = (selectedDate: string, serviceDuration: number) => {
    if (!selectedDate) return [];
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Check if it's a working day (Monday to Saturday)
    if (!BUSINESS_HOURS.workDays.includes(dayOfWeek)) {
      return [];
    }
    
    const slots = [];
    const [startHour, startMinute] = BUSINESS_HOURS.start.split(':').map(Number);
    const [endHour, endMinute] = BUSINESS_HOURS.end.split(':').map(Number);
    
    const currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
    
    while (currentTime < endTime) {
      // Calculate if service can be completed before closing time
      const serviceEndTime = new Date(currentTime.getTime() + serviceDuration * 60000);
      
      if (serviceEndTime <= endTime) {
        const timeStr = currentTime.toTimeString().slice(0, 5);
        slots.push(timeStr);
      }
      
      // Move to next slot (30-minute intervals)
      currentTime.setTime(currentTime.getTime() + BUSINESS_HOURS.intervalMinutes * 60000);
    }
    
    return slots;
  };
  
  // Check if selected date is valid (not Sunday, not in the past)
  const isDateValid = (dateString: string) => {
    if (!dateString) return false;
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (selectedDate < today) return false;
    
    // Check if it's Sunday
    const dayOfWeek = selectedDate.getDay();
    return BUSINESS_HOURS.workDays.includes(dayOfWeek);
  };

  // Check authentication on component mount
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login?redirect=/booking');
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    async function fetchData() {
      // Read subServiceId from URL (mandatory path from sub-services page)
      const subServiceId = searchParams.get('subServiceId');
      if (!subServiceId) {
        setBookingError('Please start your booking from a sub-service page.');
        setLoading(false);
        return;
      }

      setFormData(prev => ({ ...prev, subServiceId }));

      // Fetch sub-service details with parent service name
      const { data: subServiceData, error: subServiceError } = await supabase
        .from('sub_services')
        .select('*, services(name)')
        .eq('id', subServiceId)
        .eq('is_active', true)
        .single();

      if (subServiceError || !subServiceData) {
        setBookingError('Selected sub-service is unavailable.');
        setLoading(false);
        return;
      }

      setSubService(subServiceData as SubService);

      // Fetch available staff for this sub-service, filter out admin/manager
      const { data: staffAssignments, error: staffError } = await supabase
        .from('staff_sub_services')
        .select('experience_level, staff:staff_id (id, full_name, role)')
        .eq('sub_service_id', subServiceId);

      if (staffError) {
        console.error('Error fetching staff for sub-service:', staffError);
        setBookingError('Failed to load available staff.');
        setLoading(false);
        return;
      }

      const staffList: StaffMember[] = (staffAssignments || [])
        .map((row: {
          experience_level: string | null;
          staff: {
            id: string;
            full_name: string;
            role: string | null;
          };
        }) => ({
          id: row.staff?.id || '',
          full_name: row.staff?.full_name || '',
          role: row.staff?.role || null,
          experience_level: row.experience_level || undefined,
        }))
        .filter(s => {
          const role = (s.role || '').toLowerCase().trim();
          return !!s.id && role !== 'admin' && role !== 'manager';
        });

      setAvailableStaff(staffList);

      // If exactly one staff member, preselect them
      if (staffList.length === 1) {
        setFormData(prev => ({ ...prev, staffId: staffList[0].id }));
      }

      setLoading(false);
    }
    fetchData();
  }, [user, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Book an Appointment</h1>
          <p className={styles.subtitle}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Authentication Required</h1>
          <p className={styles.subtitle}>Please log in to book an appointment.</p>
        </div>
      </div>
    );
  }

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!subService || !formData.staffId || !formData.date || !formData.time) {
      setBookingError('Please fill in all required fields.');
      return;
    }
    
    // Validate selected date
    if (!isDateValid(formData.date)) {
      setBookingError('Please select a valid date. We are closed on Sundays.');
      return;
    }
    
    // Validate selected time
    const availableSlots = generateTimeSlots(formData.date, subService.duration_minutes);
    if (!availableSlots.includes(formData.time)) {
      setBookingError('Please select a valid time slot. We are open from 7:00 AM to 6:00 PM, Monday to Saturday.');
      return;
    }

    setBookingError(null);
    setCurrentStep('contact');
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate that either email or phone is provided
    if (!formData.clientEmail && !formData.clientPhone) {
      setBookingError('Please provide either an email address or phone number.');
      return;
    }

    setBookingError(null);
    
    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: subService!.price,
          serviceId: subService!.id,
          serviceName: subService!.name,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to initialize payment');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    
    try {
      // Confirm booking after successful payment
      const response = await fetch('/api/confirm-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          bookingData: {
            ...formData,
            userId: user.id,
            clientName: formData.clientName || user.user_metadata?.full_name || user.email,
            clientEmail: formData.clientEmail || user.email,
            clientPhone: formData.clientPhone || null,
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      setBookingSuccess(true);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error confirming booking:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to confirm booking');
    }
  };

  const handlePaymentError = (error: string) => {
    setBookingError(error);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Book an Appointment</h1>
          <p className={styles.subtitle}>Loading sub-service and available staff...</p>
        </div>
      </div>
    );
  }

  if (bookingError && !subService) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Booking Error</h1>
          <p className={styles.subtitle}>{bookingError}</p>
          <button onClick={() => router.push('/')} className={styles.button}>
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Complete Your Booking</h1>
        <p className={styles.subtitle}>Book your appointment with our secure booking system.</p>
        
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${currentStep === 'details' ? styles.active : (currentStep === 'contact' || currentStep === 'payment' || currentStep === 'confirmation') ? styles.completed : ''}`}>
            1. Details
          </div>
          <div className={`${styles.step} ${currentStep === 'contact' ? styles.active : (currentStep === 'payment' || currentStep === 'confirmation') ? styles.completed : ''}`}>
            2. Contact
          </div>
          <div className={`${styles.step} ${currentStep === 'payment' ? styles.active : currentStep === 'confirmation' ? styles.completed : ''}`}>
            3. Payment
          </div>
          <div className={`${styles.step} ${currentStep === 'confirmation' ? styles.active : ''}`}>
            4. Confirmation
          </div>
        </div>

        {bookingError && (
          <div className={styles.error}>
            {bookingError}
          </div>
        )}

      {currentStep === 'details' && subService && (
        <form className={styles.form} onSubmit={handleDetailsSubmit}>
          <div className={styles.serviceInfo}>
            <h3>{subService.name}</h3>
            <p>{subService.services?.name} - R{subService.price.toFixed(2)} ({subService.duration_minutes} min)</p>
            {subService.description && <p>{subService.description}</p>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="staffId">Choose Staff Member:</label>
            <select
              id="staffId"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              required
            >
              <option value="">Select a staff member</option>
              {availableStaff.map((staffMember) => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.full_name} {staffMember.experience_level ? `(${staffMember.experience_level})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={(e) => {
                handleChange(e);
                // Clear time when date changes
                setFormData(prev => ({ ...prev, time: '' }));
              }}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {formData.date && !isDateValid(formData.date) && (
              <p style={{ color: 'red', fontSize: '0.9em', marginTop: '0.5rem' }}>
                ⚠️ We are closed on Sundays. Please select Monday to Saturday.
              </p>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="time">Available Time Slots:</label>
            {formData.date && isDateValid(formData.date) ? (
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Select a time slot</option>
                {generateTimeSlots(formData.date, subService.duration_minutes).map((slot) => {
                  const [hours, minutes] = slot.split(':');
                  const time12 = new Date();
                  time12.setHours(parseInt(hours), parseInt(minutes));
                  const time12Str = time12.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  });
                  
                  return (
                    <option key={slot} value={slot}>
                      {time12Str}
                    </option>
                  );
                })}
              </select>
            ) : (
              <select disabled>
                <option>Please select a valid date first</option>
              </select>
            )}
            {formData.date && isDateValid(formData.date) && (
              <p style={{ color: 'green', fontSize: '0.9em', marginTop: '0.5rem' }}>
                ℹ️ Business hours: 7:00 AM - 6:00 PM (Monday to Saturday)
              </p>
            )}
          </div>
          
          <button type="submit" className={styles.button}>
            Next: Contact Information
          </button>
        </form>
      )}

      {currentStep === 'contact' && (
        <form className={styles.form} onSubmit={handleContactSubmit}>
          <div className={styles.contactInfo}>
            <h3>Contact Information</h3>
            <p>Please provide at least one way for us to contact you about your appointment.</p>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="clientName">Full Name:</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder={user.user_metadata?.full_name || user.email || 'Your full name'}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="clientEmail">Email Address:</label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              placeholder={user.email || 'your.email@example.com'}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="clientPhone">Phone Number:</label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              placeholder="+27 12 345 6789"
            />
          </div>
          
          <p className={styles.note}>* Please provide either an email address or phone number</p>
          
          <div className={styles.formActions}>
            <button 
              type="button"
              onClick={() => setCurrentStep('details')}
              className={styles.backButton}
            >
              Back to Details
            </button>
            <button type="submit" className={styles.button}>
              Proceed to Payment
            </button>
          </div>
        </form>
      )}

      {currentStep === 'payment' && clientSecret && subService && (
        <div className={styles.paymentStep}>
          <h2>Payment</h2>
          <PaymentForm
            clientSecret={clientSecret}
            amount={subService.price}
            serviceName={subService.name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
          <button 
            onClick={() => setCurrentStep('contact')}
            className={styles.backButton}
          >
            Back to Contact
          </button>
        </div>
      )}

      {currentStep === 'confirmation' && bookingSuccess && subService && (
        <div className={styles.confirmation}>
          <h2>Booking Confirmed!</h2>
          <div className={styles.confirmationDetails}>
            <p><strong>Service:</strong> {subService.name} ({subService.services?.name})</p>
            <p><strong>Date:</strong> {formData.date}</p>
            <p><strong>Time:</strong> {formData.time}</p>
            <p><strong>Staff:</strong> {availableStaff.find(s => s.id === formData.staffId)?.full_name}</p>
            <p><strong>Duration:</strong> {subService.duration_minutes} minutes</p>
            <p><strong>Amount Paid:</strong> R{subService.price.toFixed(2)}</p>
            <p><strong>Contact:</strong> {formData.clientEmail || formData.clientPhone}</p>
          </div>
          <p className={styles.success}>Your appointment has been successfully booked and paid for!</p>
          <button onClick={() => router.push('/my-bookings')} className={styles.button}>
            View My Bookings
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Loading...</h1>
          <p className={styles.subtitle}>Please wait...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
