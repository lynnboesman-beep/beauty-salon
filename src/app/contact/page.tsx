'use client';

import { useState } from 'react';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitStatus('success');
    setIsSubmitting(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>We'd love to hear from you. Get in touch today!</p>
        </div>

        <div className={styles.content}>
          <div className={styles.contactSection}>
            {/* Contact Information */}
            <div className={styles.contactInfo}>
              <h2>Get in Touch</h2>
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <div className={styles.icon}>📍</div>
                  <h3>Visit Us</h3>
                  <p>123 Beauty Street<br />Salon City, SC 12345</p>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.icon}>📞</div>
                  <h3>Call Us</h3>
                  <p>(555) 123-4567</p>
                  <small>Monday - Saturday: 7:00 AM - 6:00 PM</small>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.icon}>✉️</div>
                  <h3>Email Us</h3>
                  <p>info@beautysalon.com</p>
                  <small>We respond within 24 hours</small>
                </div>
              </div>

              {/* Business Hours */}
              <div className={styles.hoursSection}>
                <h3>Business Hours</h3>
                <div className={styles.hours}>
                  <div className={styles.hourItem}>
                    <span>Monday - Friday</span>
                    <span>7:00 AM - 6:00 PM</span>
                  </div>
                  <div className={styles.hourItem}>
                    <span>Saturday</span>
                    <span>8:00 AM - 5:00 PM</span>
                  </div>
                  <div className={styles.hourItem}>
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className={styles.socialSection}>
                <h3>Follow Us</h3>
                <div className={styles.socialLinks}>
                  <a href="#" className={styles.socialLink}>
                    <span className={styles.socialIcon}>📘</span>
                    <span>Facebook</span>
                  </a>
                  <a href="#" className={styles.socialLink}>
                    <span className={styles.socialIcon}>📷</span>
                    <span>Instagram</span>
                  </a>
                  <a href="#" className={styles.socialLink}>
                    <span className={styles.socialIcon}>🐦</span>
                    <span>Twitter</span>
                  </a>
                  <a href="#" className={styles.socialLink}>
                    <span className={styles.socialIcon}>💼</span>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.contactForm}>
              <h2>Send us a Message</h2>
              {submitStatus === 'success' && (
                <div className={styles.successMessage}>
                  <span className={styles.successIcon}>✅</span>
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking Question</option>
                      <option value="services">Services Information</option>
                      <option value="complaint">Complaint</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner}></span>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className={styles.mapSection}>
            <h2>Find Us</h2>
            <div className={styles.mapPlaceholder}>
              <div className={styles.mapContent}>
                <span className={styles.mapIcon}>🗺️</span>
                <p>Interactive Map</p>
                <small>123 Beauty Street, Salon City, SC 12345</small>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={styles.emergencySection}>
            <div className={styles.emergencyCard}>
              <h3>🚨 Need Immediate Assistance?</h3>
              <p>
                For urgent matters or same-day appointments, please call us directly at{' '}
                <strong>(555) 123-4567</strong>. We're here to help!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}