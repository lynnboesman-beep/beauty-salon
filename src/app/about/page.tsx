import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>About Our Beauty Salon</h1>
          <p className={styles.subtitle}>Where luxury meets expertise in beauty care</p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <div className={styles.textContent}>
              <h2>Our Story</h2>
              <p>
                Welcome to our premier beauty salon, where we&apos;ve been transforming lives through
                exceptional beauty services for over a decade. Founded in 2013 with a simple mission: 
                to provide world-class beauty treatments in a luxurious, relaxing environment.
              </p>
              <p>
                What started as a small neighborhood salon has grown into a trusted destination 
                for beauty enthusiasts seeking professional, personalized care. Our journey has been 
                built on the foundation of excellence, innovation, and genuine care for each client.
              </p>
            </div>
            <div className={styles.imageContent}>
              <div className={styles.placeholder}>
                <span>🏢 Our Beautiful Salon</span>
              </div>
            </div>
          </section>

          <section className={styles.statsSection}>
            <h2>Our Achievements</h2>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>10+</div>
                <div className={styles.statLabel}>Years of Excellence</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>2,500+</div>
                <div className={styles.statLabel}>Happy Clients</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>15+</div>
                <div className={styles.statLabel}>Expert Professionals</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>50+</div>
                <div className={styles.statLabel}>Premium Services</div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.imageContent}>
              <div className={styles.placeholder}>
                <span>👥 Our Professional Team</span>
              </div>
            </div>
            <div className={styles.textContent}>
              <h2>Our Team</h2>
              <p>
                Our team consists of highly trained, certified professionals who are passionate 
                about beauty and wellness. Each member brings unique skills and expertise, 
                ensuring that we can cater to diverse beauty needs and preferences.
              </p>
              <p>
                We continuously invest in training and education to stay current with the latest 
                trends, techniques, and technologies in the beauty industry. This commitment to 
                professional development ensures our clients always receive cutting-edge treatments.
              </p>
            </div>
          </section>

          <section className={styles.valuesSection}>
            <h2>Our Values</h2>
            <div className={styles.values}>
              <div className={styles.value}>
                <div className={styles.valueIcon}>✨</div>
                <h3>Excellence</h3>
                <p>We strive for perfection in every service we provide, using only premium products and proven techniques.</p>
              </div>
              <div className={styles.value}>
                <div className={styles.valueIcon}>❤️</div>
                <h3>Care</h3>
                <p>Every client is treated with genuine care, respect, and personalized attention to their unique needs.</p>
              </div>
              <div className={styles.value}>
                <div className={styles.valueIcon}>🌟</div>
                <h3>Innovation</h3>
                <p>We embrace new technologies and techniques to offer the most advanced beauty treatments available.</p>
              </div>
              <div className={styles.value}>
                <div className={styles.valueIcon}>🤝</div>
                <h3>Trust</h3>
                <p>Building lasting relationships with our clients through transparency, reliability, and consistent quality.</p>
              </div>
            </div>
          </section>

          <section className={styles.missionSection}>
            <div className={styles.missionContent}>
              <h2>Our Mission</h2>
              <blockquote className={styles.mission}>
                &quot;To enhance natural beauty and boost confidence through exceptional service,
                creating a sanctuary where every client feels pampered, valued, and beautiful.&quot;
              </blockquote>
              <p>
                We believe that beauty is about more than just appearance – it&apos;s about feeling
                confident, radiant, and comfortable in your own skin. Our mission drives everything 
                we do, from the services we offer to the atmosphere we create.
              </p>
            </div>
          </section>

          <section className={styles.certificationSection}>
            <h2>Certifications & Standards</h2>
            <div className={styles.certifications}>
              <div className={styles.certification}>
                <h3>🏆 Licensed Professionals</h3>
                <p>All our staff members are fully licensed and certified in their respective specialties.</p>
              </div>
              <div className={styles.certification}>
                <h3>🧪 Premium Products</h3>
                <p>We use only high-quality, professional-grade products from trusted brands.</p>
              </div>
              <div className={styles.certification}>
                <h3>🛡️ Safety Standards</h3>
                <p>We maintain the highest hygiene and safety standards, exceeding industry requirements.</p>
              </div>
              <div className={styles.certification}>
                <h3>📜 Industry Recognition</h3>
                <p>Awarded &quot;Best Beauty Salon&quot; by the Local Beauty Association for 3 consecutive years.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}