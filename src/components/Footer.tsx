import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Main Footer Content */}
        <div className={styles.mainContent}>
          {/* Company Info */}
          <div className={styles.section}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>✨</span>
              <span className={styles.logoText}>Beauty Salon</span>
            </div>
            <p className={styles.description}>
              Your premier destination for luxury beauty services. We've been transforming 
              lives through exceptional beauty treatments for over a decade.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">📘</a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">📷</a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">🐦</a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">💼</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/booking">Book Appointment</Link></li>
              <li><Link href="/my-bookings">My Bookings</Link></li>
              <li><Link href="/profile">My Profile</Link></li>
              <li><Link href="/admin">Admin Panel</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Support</h3>
            <ul className={styles.linkList}>
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><a href="tel:(555) 123-4567">Call Support</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact Info</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <div>
                  <p>123 Beauty Street</p>
                  <p>Salon City, SC 12345</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <div>
                  <p>(555) 123-4567</p>
                  <small>Mon-Sat: 7:00 AM - 6:00 PM</small>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <div>
                  <p>info@beautysalon.com</p>
                  <small>We respond within 24 hours</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.bottomContent}>
            <div className={styles.legal}>
              <p>&copy; 2025 Beauty Salon. All rights reserved.</p>
              <div className={styles.policies}>
                <a href="/privacy">Privacy Policy</a>
                <span className={styles.separator}>•</span>
                <a href="/terms">Terms of Service</a>
                <span className={styles.separator}>•</span>
                <a href="/cookies">Cookie Policy</a>
              </div>
            </div>
            <div className={styles.businessHours}>
              <h4>Business Hours</h4>
              <p>Monday - Saturday: 7:00 AM - 6:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;