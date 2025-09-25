'use client';

import { useState } from 'react';
import styles from './faq.module.css';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Booking & Appointments',
    question: 'How do I book an appointment?',
    answer: 'Simply create an account on our website, browse our services, select your preferred staff member and time slot, then complete the secure payment process. You\'ll receive a confirmation email immediately.'
  },
  {
    category: 'Booking & Appointments',
    question: 'Can I cancel or reschedule my appointment?',
    answer: 'Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time through your "My Bookings" page. Cancellations made less than 24 hours in advance may be subject to a cancellation fee.'
  },
  {
    category: 'Booking & Appointments',
    question: 'How far in advance can I book?',
    answer: 'You can book appointments up to 3 months in advance. We recommend booking popular time slots (weekends and evenings) as early as possible to ensure availability.'
  },
  {
    category: 'Booking & Appointments',
    question: 'What if I\'m running late?',
    answer: 'Please call us immediately if you\'re running late. We can accommodate delays of up to 15 minutes, but longer delays may require rescheduling to avoid disrupting other clients\' appointments.'
  },
  {
    category: 'Services & Pricing',
    question: 'What services do you offer?',
    answer: 'We offer a comprehensive range of beauty services including hair styling, cutting and coloring, facial treatments, manicures, pedicures, eyebrow and eyelash services, and specialized treatments. Browse our services page for the complete list.'
  },
  {
    category: 'Services & Pricing',
    question: 'How much do your services cost?',
    answer: 'Our prices vary depending on the service and the experience level of the staff member. All prices are clearly displayed when booking online. We also offer package deals for multiple services.'
  },
  {
    category: 'Services & Pricing',
    question: 'Do you offer group bookings or packages?',
    answer: 'Yes! We offer special group rates for bridal parties, corporate events, and special occasions. Contact us directly to discuss your needs and we\'ll create a customized package for you.'
  },
  {
    category: 'Services & Pricing',
    question: 'Do you use organic/natural products?',
    answer: 'We use a mix of premium professional-grade products, including organic and natural options where available. If you have specific product preferences or allergies, please inform us when booking.'
  },
  {
    category: 'Payment & Policies',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and digital payments through our secure Stripe integration. Payment is required at the time of booking to secure your appointment.'
  },
  {
    category: 'Payment & Policies',
    question: 'What is your refund policy?',
    answer: 'Cancellations made more than 24 hours in advance receive a full refund. Cancellations within 24 hours are subject to a 50% cancellation fee. No-shows are charged the full service amount.'
  },
  {
    category: 'Payment & Policies',
    question: 'Do you offer loyalty programs or discounts?',
    answer: 'Yes! We offer a loyalty program where you earn points with each visit. We also provide discounts for students, seniors, and first-time clients. Sign up for our newsletter to stay informed about special offers.'
  },
  {
    category: 'Salon Information',
    question: 'Where are you located?',
    answer: 'We\'re located at 123 Beauty Street, Salon City, SC 12345. We have convenient parking available right in front of our salon, and we\'re easily accessible by public transportation.'
  },
  {
    category: 'Salon Information',
    question: 'What are your business hours?',
    answer: 'We\'re open Monday through Saturday from 7:00 AM to 6:00 PM. We\'re closed on Sundays. Extended hours may be available for special events or group bookings.'
  },
  {
    category: 'Salon Information',
    question: 'Is parking available?',
    answer: 'Yes, we provide free parking for all our clients in the lot directly in front of our salon. There\'s also street parking available if our lot is full.'
  },
  {
    category: 'Health & Safety',
    question: 'What health and safety measures do you have?',
    answer: 'We maintain the highest hygiene standards, including sterilizing all tools between clients, using disposable items when possible, and following all local health department guidelines. Our staff is trained in proper sanitization procedures.'
  },
  {
    category: 'Health & Safety',
    question: 'What should I do if I have allergies?',
    answer: 'Please inform us of any allergies or sensitivities when booking your appointment. We can perform patch tests and use hypoallergenic products when necessary to ensure your safety and comfort.'
  },
  {
    category: 'Staff & Expertise',
    question: 'Are your staff members licensed?',
    answer: 'Yes, all our staff members are fully licensed, certified professionals with extensive training in their specialties. We regularly invest in continuing education to ensure they stay current with the latest techniques and trends.'
  },
  {
    category: 'Staff & Expertise',
    question: 'Can I request a specific staff member?',
    answer: 'Absolutely! When booking online, you can select your preferred staff member. If they\'re not available at your desired time, we\'ll suggest alternative times or recommend another qualified team member.'
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>Find answers to common questions about our services and policies</p>
        </div>

        <div className={styles.content}>
          {/* Search and Filter */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.categories}>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Results */}
          <div className={styles.resultsInfo}>
            <p>Showing {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''}</p>
          </div>

          {/* FAQ Items */}
          <div className={styles.faqList}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, index) => (
                <div key={index} className={styles.faqItem}>
                  <div 
                    className={styles.faqQuestion}
                    onClick={() => toggleExpanded(index)}
                  >
                    <div className={styles.questionContent}>
                      <span className={styles.categoryTag}>{item.category}</span>
                      <h3>{item.question}</h3>
                    </div>
                    <span className={`${styles.expandIcon} ${expandedItems.has(index) ? styles.expanded : ''}`}>
                      ▼
                    </span>
                  </div>
                  <div className={`${styles.faqAnswer} ${expandedItems.has(index) ? styles.expanded : ''}`}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <span className={styles.noResultsIcon}>❓</span>
                <h3>No questions found</h3>
                <p>Try adjusting your search terms or category filter</p>
              </div>
            )}
          </div>

          {/* Still Need Help */}
          <div className={styles.helpSection}>
            <div className={styles.helpCard}>
              <h2>Still need help?</h2>
              <p>Can't find the answer you're looking for? We're here to help!</p>
              <div className={styles.helpOptions}>
                <a href="/contact" className={styles.helpButton}>
                  <span>📧</span>
                  Contact Us
                </a>
                <a href="tel:(555) 123-4567" className={styles.helpButton}>
                  <span>📞</span>
                  Call Us
                </a>
                <a href="/help" className={styles.helpButton}>
                  <span>🛟</span>
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}