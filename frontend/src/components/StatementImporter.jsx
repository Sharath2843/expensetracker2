import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const StatementImporter = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Quick validation
    if (!file.name.endsWith('.csv')) {
      return setError("Please upload a valid .csv file.");
    }

    setLoading(true);
    setError('');

    try {
      const text = await file.text();
      // Split by newline to get rows
      const rows = text.split('\n').filter(row => row.trim() !== '');
      
      // Simple parser assuming generic format: Date, Description, Amount, Type(income/expense)
      // Real bank statements require complex regex, so we use a simplified loop here!
      let parsedTransactions = [];
      
      // Skip header row usually at index 0
      for (let i = 1; i < rows.length; i++) {
        // Split by comma handling basic quotes
        const cols = rows[i].split(',');
        if (cols.length < 3) continue;

        // Mock extracting columns (Assuming structure matches our standard dummy)
        // 0: Date, 1: Description, 2: Amount, 3: Type
        const rawAmount = cols[2] ? parseFloat(cols[2].replace(/[^0-9.-]+/g,"")) : 0;
        
        // If not a valid number, skip
        if (isNaN(rawAmount) || rawAmount === 0) continue;
        
        let type = 'expense';
        let amount = rawAmount;
        
        // Basic credit/debit determination
        if (cols[3] && cols[3].toLowerCase().includes('income') || rawAmount > 0) {
           type = 'income';
        } else {
           amount = Math.abs(rawAmount); // ensure positive for db
        }

        parsedTransactions.push({
          description: cols[1] ? cols[1].trim() : 'Bank Sync',
          amount: amount,
          type: type,
          category: type === 'income' ? 'Investments' : 'Other' // Default assignment
        });
      }

      if (parsedTransactions.length === 0) {
         setLoading(false);
         return setError("No valid transactions found in file.");
      }

      // Bulk push to DB securely bridging frontend to backend
      for (let i = 0; i < parsedTransactions.length; i++) {
        await api.post('/transactions', parsedTransactions[i]);
        setProgress(Math.round(((i + 1) / parsedTransactions.length) * 100));
      }

      // Done
      setTimeout(() => {
        onSuccess(parsedTransactions); 
        onClose();
      }, 800);

    } catch (err) {
      console.error(err);
      setError("Failed to parse document format.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="rzp-mockup">
        
        <div className="rzp-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#fff', color: '#1c1c1e', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                ET
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Auto-Sync</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Import Bank Statement</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="rzp-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
          
          {!loading ? (
             <>
              <div style={{ marginBottom: '20px' }}>
                <FileText size={48} color="var(--accent-primary)" />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1c1c1e' }}>Upload your .CSV file</h4>
              <p style={{ fontSize: '0.85rem', color: '#6e6e6e', marginBottom: '24px' }}>
                Download your statement from SBI or PhonePe and upload it here. We'll extract your history securely.
              </p>

              {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</p>}

              <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', justifyContent: 'center' }}>
                <UploadCloud size={20} /> Select Statement
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
             </>
          ) : (
             <>
               <div style={{ marginBottom: '20px' }}>
                {progress === 100 ? <CheckCircle size={48} color="var(--success)" /> : <UploadCloud size={48} color="var(--accent-light)" className="pulse" />}
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1c1c1e' }}>
                {progress === 100 ? 'Sync Complete!' : 'Analyzing File...'}
              </h4>
              <div style={{ background: '#eaeaea', height: '6px', borderRadius: '4px', width: '100%', overflow: 'hidden', margin: '20px 0' }}>
                 <div style={{ width: `${progress}%`, background: 'var(--accent-gradient)', height: '100%', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6e6e6e' }}>
                {progress}% Processed
              </p>
             </>
          )}

        </div>

      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .rzp-mockup {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          font-family: -apple-system, sans-serif;
        }

        .rzp-header {
          background: linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%);
          padding: 24px;
          color: white;
        }

        .pulse {
          animation: pulseAnim 1.5s infinite;
        }

        @keyframes pulseAnim {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default StatementImporter;
