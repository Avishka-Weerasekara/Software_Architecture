import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../index.css';

const PaymentCancelled = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        border: '1px solid rgba(193, 80, 46, 0.3)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        color: '#f5f5f5'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <AlertCircle size={80} color='#c1502e' style={{ margin: '0 auto', display: 'block' }} />
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#c1502e'
        }}>
          {t('payment_cancelled')}
        </h1>

        <p style={{
          fontSize: '1.1rem',
          marginBottom: '30px',
          color: '#b0b0b0',
          lineHeight: '1.6'
        }}>
          {t('payment_cancelled_message')}
        </p>

        <div style={{
          background: 'rgba(193, 80, 46, 0.1)',
          border: '1px solid rgba(193, 80, 46, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <p style={{ color: '#d0d0d0', fontSize: '0.95rem' }}>
            Your fine remains in PENDING status. You can try paying again at any time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(201, 164, 92, 0.2)',
              color: '#c9a45c',
              border: '1px solid #c9a45c',
              padding: '12px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(201, 164, 92, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(201, 164, 92, 0.2)';
            }}
          >
            <ArrowLeft size={18} style={{ display: 'inline', marginRight: '8px' }} />
            {t('go_back')}
          </button>

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
              flex: 1,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {t('return_to_dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
