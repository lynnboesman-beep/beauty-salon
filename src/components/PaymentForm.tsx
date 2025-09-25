'use client';

import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import styles from './payment-form.module.css';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  serviceName: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

function PaymentFormContent({ clientSecret, amount, serviceName, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      const error = 'Card element not found';
      setErrorMessage(error);
      onError(error);
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      const errorMsg = error.message || 'Payment failed';
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
      setProcessing(false);
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentSummary}>
        <h3 className={styles.summaryTitle}>Payment Summary</h3>
        <div className={styles.summaryDetails}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Service:</span>
            <span className={styles.summaryValue}>{serviceName}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Amount:</span>
            <span className={styles.summaryAmount}>R{amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <div className={styles.cardElement}>
          <label className={styles.cardLabel}>Card Information</label>
          <div className={styles.cardElementWrapper}>
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#dc2626',
                  },
                },
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          className={styles.submitButton}
        >
          {processing ? (
            <span className={styles.processingText}>
              <span className={styles.spinner}></span>
              Processing...
            </span>
          ) : (
            `Pay R${amount.toFixed(2)}`
          )}
        </button>

        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}