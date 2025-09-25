import styles from './help.module.css';

export default function HelpCenterPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Help Center</h1>
          <p className={styles.subtitle}>Get the support you need, when you need it</p>
        </div>

        <div className={styles.content}>
          {/* Quick Actions */}
          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionCards}>
              <a href="/booking" className={styles.actionCard}>
                <div className={styles.actionIcon}>📅</div>
                <h3>Book Appointment</h3>
                <p>Schedule your beauty treatment with our easy booking system</p>
              </a>
              <a href="/my-bookings" className={styles.actionCard}>
                <div className={styles.actionIcon}>📋</div>
                <h3>View Bookings</h3>
                <p>Check, modify, or cancel your existing appointments</p>
              </a>
              <a href="/contact" className={styles.actionCard}>
                <div className={styles.actionIcon}>💬</div>
                <h3>Contact Support</h3>
                <p>Get in touch with our team for personalized assistance</p>
              </a>
              <a href="/faq" className={styles.actionCard}>
                <div className={styles.actionIcon}>❓</div>
                <h3>Browse FAQ</h3>
                <p>Find quick answers to frequently asked questions</p>
              </a>
            </div>
          </section>

          {/* Help Categories */}
          <section className={styles.helpCategories}>
            <h2>Help Categories</h2>
            <div className={styles.categories}>
              {/* Account Help */}
              <div className={styles.category}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryIcon}>👤</div>
                  <h3>Account & Profile</h3>
                </div>
                <div className={styles.categoryContent}>
                  <div className={styles.helpItem}>
                    <h4>🔐 Having trouble logging in?</h4>
                    <p>Use the &quot;Forgot Password&quot; link on the login page to reset your password. If you continue to have issues, contact our support team.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>✏️ How to update your profile</h4>
                    <p>Go to the Profile page after logging in. You can update your personal information, contact details, and preferences.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>🛡️ Account security tips</h4>
                    <p>Never share your login credentials. Use a strong password and log out when using shared computers.</p>
                  </div>
                </div>
              </div>

              {/* Booking Help */}
              <div className={styles.category}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryIcon}>📅</div>
                  <h3>Booking & Appointments</h3>
                </div>
                <div className={styles.categoryContent}>
                  <div className={styles.helpItem}>
                    <h4>🕐 Can&apos;t find available times?</h4>
                    <p>Try selecting a different date or staff member. Popular times fill up quickly, so book as early as possible.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>📧 Booking confirmation emails</h4>
                    <p>Confirmation emails are sent immediately after payment. Check your spam folder if you don&apos;t see it.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>📋 Managing your bookings</h4>
                    <p>View all your bookings in the &quot;My Bookings&quot; section. You can reschedule or cancel appointments there.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>⏰ Appointment reminders</h4>
                    <p>We send reminder emails 24 hours before your appointment. Make sure your email address is up to date.</p>
                  </div>
                </div>
              </div>

              {/* Payment Help */}
              <div className={styles.category}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryIcon}>💳</div>
                  <h3>Payments & Billing</h3>
                </div>
                <div className={styles.categoryContent}>
                  <div className={styles.helpItem}>
                    <h4>🔒 Secure payment processing</h4>
                    <p>All payments are processed securely through Stripe. Your card information is encrypted and never stored on our servers.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>💰 Payment requirements</h4>
                    <p>Payment is required at the time of booking to confirm your appointment. This helps reduce no-shows.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>🔄 Refunds and cancellations</h4>
                    <p>Refunds are processed according to our cancellation policy. Cancellations more than 24 hours in advance receive full refunds.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>🧾 Payment receipts</h4>
                    <p>Payment receipts are automatically emailed to you after successful transactions.</p>
                  </div>
                </div>
              </div>

              {/* Technical Support */}
              <div className={styles.category}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryIcon}>🛠️</div>
                  <h3>Technical Support</h3>
                </div>
                <div className={styles.categoryContent}>
                  <div className={styles.helpItem}>
                    <h4>🔄 Page not loading properly</h4>
                    <p>Try refreshing the page (Ctrl+F5 or Cmd+Shift+R). Clear your browser cache if problems persist.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>📱 Mobile compatibility</h4>
                    <p>Our website works on all modern browsers and mobile devices. Update your browser for the best experience.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>🍪 Cookie and privacy settings</h4>
                    <p>We use cookies to improve your experience. You can manage cookie preferences in your browser settings.</p>
                  </div>
                  <div className={styles.helpItem}>
                    <h4>📧 Email technical support</h4>
                    <p>For technical issues, contact us at <strong>support@beautysalon.com</strong> with details about the problem.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Options */}
          <section className={styles.contactSection}>
            <h2>Still Need Help?</h2>
            <p>Our support team is here to help you with any questions or concerns.</p>
            
            <div className={styles.contactOptions}>
              <div className={styles.contactOption}>
                <div className={styles.contactIcon}>📞</div>
                <h3>Phone Support</h3>
                <p><strong>(555) 123-4567</strong></p>
                <p>Monday - Saturday: 7:00 AM - 6:00 PM</p>
                <a href="tel:(555) 123-4567" className={styles.contactButton}>Call Now</a>
              </div>
              
              <div className={styles.contactOption}>
                <div className={styles.contactIcon}>✉️</div>
                <h3>Email Support</h3>
                <p><strong>support@beautysalon.com</strong></p>
                <p>We respond within 24 hours</p>
                <a href="mailto:support@beautysalon.com" className={styles.contactButton}>Send Email</a>
              </div>
              
              <div className={styles.contactOption}>
                <div className={styles.contactIcon}>💬</div>
                <h3>Contact Form</h3>
                <p>Send us a detailed message</p>
                <p>Include screenshots if needed</p>
                <a href="/contact" className={styles.contactButton}>Contact Form</a>
              </div>
            </div>
          </section>

          {/* Emergency Support */}
          <section className={styles.emergencySection}>
            <div className={styles.emergencyCard}>
              <h3>🚨 Need Immediate Assistance?</h3>
              <p>
                For urgent matters, same-day appointments, or time-sensitive issues, 
                please call us directly at <strong>(555) 123-4567</strong>. We&apos;re here to help!
              </p>
              <div className={styles.emergencyNote}>
                <strong>Note:</strong> For medical emergencies, please contact emergency services immediately.
              </div>
            </div>
          </section>

          {/* Tips Section */}
          <section className={styles.tipsSection}>
            <h2>💡 Helpful Tips</h2>
            <div className={styles.tips}>
              <div className={styles.tip}>
                <h4>📱 Bookmark our site</h4>
                <p>Add our website to your bookmarks for quick access to booking and account management.</p>
              </div>
              <div className={styles.tip}>
                <h4>🔔 Enable notifications</h4>
                <p>Allow browser notifications to receive appointment reminders and updates.</p>
              </div>
              <div className={styles.tip}>
                <h4>📋 Keep information updated</h4>
                <p>Regularly update your profile information to ensure smooth booking and communication.</p>
              </div>
              <div className={styles.tip}>
                <h4>⭐ Leave feedback</h4>
                <p>Share your experience with us to help improve our services for all clients.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}