import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import '../index.css';

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
          setLoading(false);
          return;
        }

        // You might need to create an endpoint to get payment details by session ID
        // For now, we'll just show a generic success message
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
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
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        color: '#f5f5f5'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <CheckCircle size={80} color='#c9a45c' style={{ margin: '0 auto', display: 'block' }} />
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#c9a45c'
        }}>
          {t('payment_success')}
        </h1>

        <p style={{
          fontSize: '1.1rem',
          marginBottom: '30px',
          color: '#b0b0b0',
          lineHeight: '1.6'
        }}>
          {t('payment_confirmed_message')}
        </p>

        <div style={{
          background: 'rgba(201, 164, 92, 0.1)',
          border: '1px solid rgba(201, 164, 92, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '15px', fontSize: '0.95rem' }}>
            <strong style={{ color: '#c9a45c' }}>Transaction ID:</strong>
            <p style={{ color: '#d0d0d0', marginTop: '5px', wordBreak: 'break-all' }}>
              {searchParams.get('sessionId')}
            </p>
          </div>
          <div>
            <strong style={{ color: '#c9a45c' }}>Date & Time:</strong>
            <p style={{ color: '#d0d0d0', marginTop: '5px' }}>
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: '#888',
          marginBottom: '30px'
        }}>
          A confirmation SMS and receipt have been sent to your registered phone number.
        </p>

        <button
          onClick={() => navigate('/user/dashboard')}
          style={{
            background: 'linear-gradient(135deg, #c9a45c 0%, #d4b574 100%)',
            color: '#1a2332',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {t('return_to_dashboard')}
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
