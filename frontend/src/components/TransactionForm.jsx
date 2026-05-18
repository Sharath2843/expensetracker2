import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import api from '../utils/api';

const TransactionForm = ({ onAddTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
    expense: ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other']
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || !category || !type) {
      return setError('Please fill in all required fields');
    }

    try {
      const res = await api.post('/transactions', {
        description,
        amount: Number(amount),
        type,
        category
      });
      
      onAddTransaction(res.data);
      
      // Reset form
      setDescription('');
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding transaction');
    }
  };

  return (
    <div className="card fade-in">
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Execute Trade / Record Asset</h3>
      
      {error && <div className="mb-3" style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Transaction Type</label>
            <select 
              className="form-control" 
              value={type} 
              onChange={(e) => { setType(e.target.value); setCategory(''); }}
            >
              <option value="expense">Expense (Outflow)</option>
              <option value="income">Income (Inflow)</option>
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <label className="form-label">Amount (₹)</label>
            <input 
              type="number" 
              className="form-control" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Category</label>
          <select 
            className="form-control" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled>Select Segment</option>
            {categories[type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group mb-4">
          <label className="form-label">Memo (Optional)</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Contract Payment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          <PlusCircle size={20} /> Add Record
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
