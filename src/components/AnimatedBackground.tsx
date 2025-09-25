'use client';

import styles from './AnimatedBackground.module.css';

const AnimatedBackground = () => {
  return (
    <div className={styles.animatedBackground}>
      {/* Gradient waves */}
      <div className={styles.wave1}></div>
      <div className={styles.wave2}></div>
      <div className={styles.wave3}></div>
      
      {/* Floating particles */}
      <div className={styles.particles}>
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              '--delay': `${i * 0.5}s`,
              '--duration': `${8 + (i % 4) * 2}s`,
              '--size': `${4 + (i % 3) * 2}px`,
              '--x': `${(i * 7) % 100}%`,
              '--opacity': `${0.1 + (i % 3) * 0.1}`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Salon-themed floating elements */}
      <div className={styles.floatingElements}>
        <div className={styles.element} style={{ '--delay': '0s', '--duration': '12s' } as React.CSSProperties}>✨</div>
        <div className={styles.element} style={{ '--delay': '2s', '--duration': '15s' } as React.CSSProperties}>💫</div>
        <div className={styles.element} style={{ '--delay': '4s', '--duration': '10s' } as React.CSSProperties}>⭐</div>
        <div className={styles.element} style={{ '--delay': '6s', '--duration': '14s' } as React.CSSProperties}>✨</div>
        <div className={styles.element} style={{ '--delay': '8s', '--duration': '11s' } as React.CSSProperties}>💫</div>
      </div>
    </div>
  );
};

export default AnimatedBackground;