import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import '../index.css';

const PaymentProcessing = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const fineId = searchParams.get('fineId');
        if (!fineId) {
          setError('Fine ID not provided');
          return;
        }

        // Call backend to initiate payment
        const response = await api.post('/payment/initiate', {
          fineId: fineId,
          returnUrl: window.location.origin
        });

        // Redirect to Stripe checkout
        if (response.data.checkoutSessionUrl) {
          window.location.href = response.data.checkoutSessionUrl;
        } else {
          setError('Failed to get checkout URL');
        }
      } catch (err) {
        console.error('Payment initiation error:', err);
        setError(err.response?.data?.details || 'Failed to initiate payment');
      }
    };

    initiatePayment();
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(201, 164, 92, 0.3)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        color: '#f5f5f5'
      }}>
        {error ? (
          <>
            <div style={{ color: '#c1502e', marginBottom: '20px', fontSize: '1.1rem' }}>
              ⚠️ {error}
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'linear-gradient(135deg, #c9a45c 0%, #d4b574 100%)',
                color: '#1a2332',
                border: 'none',
                padding: '12px 30px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {t('go_back')}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <Loader
                size={60}
                color='#c9a45c'
                style={{
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto',
                  display: 'block'
                }}
              />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              {t('processing_payment')}
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#b0b0b0',
              lineHeight: '1.5'
            }}>
              Redirecting to payment gateway...
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentProcessing;
