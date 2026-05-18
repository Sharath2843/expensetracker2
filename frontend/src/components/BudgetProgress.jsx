import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const BudgetProgress = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        No category data available
      </div>
    );
  }

  // Show top 8 categories
  const items = data.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.map((item, idx) => (
        <div
          key={item.category}
          className="fade-in"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          {/* Header row: category name + amount */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {item.exceeded
                ? <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                : <CheckCircle2 size={14} style={{ color: 'var(--success)', opacity: 0.7 }} />
              }
              <span style={{
                fontSize: '0.9rem', fontWeight: 600,
                color: item.exceeded ? 'var(--danger)' : 'var(--text-primary)'
              }}>
                {item.category}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{
                fontWeight: 700,
                color: item.exceeded ? 'var(--danger)' : 'var(--text-primary)'
              }}>
                ₹{item.spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              {' / '}
              <span>₹{item.budget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            width: '100%', height: '8px',
            background: 'var(--bg-main)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div
              style={{
                height: '100%',
                width: `${item.percent}%`,
                borderRadius: '10px',
                background: item.exceeded
                  ? 'linear-gradient(90deg, #c27878 0%, #e06060 100%)'
                  : item.percent > 75
                    ? 'linear-gradient(90deg, #b87333 0%, #d4945a 100%)'
                    : 'linear-gradient(90deg, #6b8e6b 0%, #8ab88a 100%)',
                transition: 'width 1s ease-out',
                boxShadow: item.exceeded
                  ? '0 0 8px rgba(194, 120, 120, 0.3)'
                  : 'none'
              }}
            ></div>
          </div>

          {/* Percent label */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            marginTop: '4px'
          }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: item.exceeded ? 'var(--danger)' : item.percent > 75 ? '#d4945a' : 'var(--text-muted)'
            }}>
              {item.exceeded ? 'Over budget!' : `${item.percent}% used`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BudgetProgress;
