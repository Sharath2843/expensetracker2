import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, IndianRupee, Tag, Calendar, X, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import Sidebar from './Sidebar';
import Header from './Header';

const AddExpense = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Rental Income', 'Dividends', 'Bonus'],
    expense: ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Insurance', 'Groceries', 'Subscriptions']
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRecentTransactions();
    }
  }, [user]);

  const fetchRecentTransactions = async () => {
    try {
      const res = await api.get('/transactions?limit=10');
      setRecentTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setShowCustomInput(true);
      setCategory('');
    } else {
      setShowCustomInput(false);
      setCustomCategory('');
      setCategory(val);
    }
  };

  const handleCustomCategoryConfirm = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setShowCustomInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || !category || !type) {
      return setError('Please fill in all required fields.');
    }

    if (Number(amount) <= 0) {
      return setError('Amount must be greater than zero.');
    }

    try {
      setIsSubmitting(true);
      await api.post('/transactions', {
        description,
        amount: Number(amount),
        type,
        category,
        date
      });

      setSuccess(`${type === 'income' ? 'Income' : 'Expense'} of ₹${Number(amount).toFixed(2)} added successfully!`);
      
      // Reset form
      setDescription('');
      setAmount('');
      setCategory('');
      setCustomCategory('');
      setShowCustomInput(false);
      setDate(new Date().toISOString().split('T')[0]);

      // Refresh recent transactions
      fetchRecentTransactions();

      // Clear success message after 4 seconds
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error adding transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setRecentTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  if (loading || (!user && !loading)) return null;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />

        <div className="page-content">
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Add Transaction
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1rem' }}>
            Record a new income or expense entry to your tracker.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* ---- LEFT: Transaction Form ---- */}
            <div className="card fade-in">
              <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusCircle size={22} style={{ color: 'var(--accent-light)' }} />
                New Transaction
              </h3>

              {error && (
                <div className="fade-in" style={{ 
                  color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '16px',
                  background: 'rgba(194, 120, 120, 0.1)', padding: '12px 16px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(194, 120, 120, 0.2)'
                }}>
                  <X size={16} /> {error}
                </div>
              )}

              {success && (
                <div className="fade-in" style={{ 
                  color: 'var(--success)', fontSize: '0.9rem', marginBottom: '16px',
                  background: 'rgba(107, 142, 107, 0.1)', padding: '12px 16px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(107, 142, 107, 0.2)'
                }}>
                  <CheckCircle2 size={16} /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Transaction Type Toggle */}
                <div className="form-group">
                  <label className="form-label">Transaction Type</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => { setType('expense'); setCategory(''); setShowCustomInput(false); }}
                      style={{
                        flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid',
                        borderColor: type === 'expense' ? 'var(--danger)' : 'var(--border-color)',
                        background: type === 'expense' ? 'rgba(194, 120, 120, 0.15)' : 'var(--bg-main)',
                        color: type === 'expense' ? 'var(--danger)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <ArrowDownRight size={18} /> Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => { setType('income'); setCategory(''); setShowCustomInput(false); }}
                      style={{
                        flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid',
                        borderColor: type === 'income' ? 'var(--success)' : 'var(--border-color)',
                        background: type === 'income' ? 'rgba(107, 142, 107, 0.15)' : 'var(--bg-main)',
                        color: type === 'income' ? 'var(--success)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <ArrowUpRight size={18} /> Income
                    </button>
                  </div>
                </div>

                {/* Amount & Date Row */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IndianRupee size={14} /> Amount
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} /> Category
                  </label>
                  {!showCustomInput ? (
                    <select
                      className="form-control"
                      value={category}
                      onChange={handleCategoryChange}
                    >
                      <option value="" disabled>Select a category</option>
                      {categories[type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__custom__">+ Add Custom Category</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter custom category name..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCustomCategoryConfirm(); } }}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCustomCategoryConfirm}
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap', padding: '12px 18px' }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCustomInput(false); setCustomCategory(''); }}
                        style={{
                          background: 'transparent', border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)', borderRadius: '10px', padding: '12px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  {category && showCustomInput === false && category !== '__custom__' && (
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Selected: <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{category}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Monthly grocery shopping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{
                    width: '100%', padding: '16px', fontSize: '1.05rem',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  <PlusCircle size={20} />
                  {isSubmitting ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
                </button>
              </form>
            </div>

            {/* ---- RIGHT: Recent Transactions ---- */}
            <div className="card fade-in" style={{ animationDelay: '0.15s' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Recent Transactions</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  Last {recentTransactions.length} entries
                </span>
              </h3>

              {recentTransactions.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)'
                }}>
                  <PlusCircle size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem' }}>No transactions yet</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Add your first transaction using the form.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                  {recentTransactions.map((t, idx) => (
                    <div
                      key={t._id}
                      className="fade-in"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 16px', background: 'var(--bg-main)',
                        borderRadius: '10px', border: '1px solid var(--border-color)',
                        animationDelay: `${idx * 0.05}s`,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-main)'}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: t.type === 'income' ? 'rgba(107, 142, 107, 0.15)' : 'rgba(194, 120, 120, 0.15)',
                        color: t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                        flexShrink: 0
                      }}>
                        {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.category}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {t.description || 'No description'} · {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                      </div>

                      {/* Amount */}
                      <div style={{
                        fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap',
                        color: t.type === 'income' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(t._id)}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-muted)',
                          cursor: 'pointer', padding: '6px', borderRadius: '6px',
                          transition: 'all 0.2s', display: 'flex', flexShrink: 0
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(194, 120, 120, 0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        title="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .page-content > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AddExpense;
