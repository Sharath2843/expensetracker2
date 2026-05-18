import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Filter, DollarSign, TrendingUp, TrendingDown, Bell, Activity } from 'lucide-react';
import api from '../utils/api';
import Sidebar from './Sidebar';
import Header from './Header';
import D3PieChart from './D3PieChart';
import D3LineChart from './D3LineChart';

const Reports = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // Filter States
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Report Type Selection
  const [reportType, setReportType] = useState('summary'); // 'summary', 'category', 'trend'
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUsersList();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedUser) {
        fetchReportData();
    }
  }, [selectedUser]);

  const fetchUsersList = async () => {
      try {
          const res = await api.get('/analytics/users');
          setUsersList(res.data);
          if (res.data.length > 0) {
              setSelectedUser(res.data[0]._id);
          } else {
              fetchReportData();
          }
      } catch (err) {
          console.error('Failed to fetch users', err);
          fetchReportData();
      }
  };

  const fetchReportData = async () => {
    try {
      setIsFetching(true);
      const params = new URLSearchParams();
      if (selectedUser) params.append('userId', selectedUser);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const qs = params.toString() ? `?${params.toString()}` : '';

      const summaryRes = await api.get(`/analytics/summary${qs}`);
      setSummary(summaryRes.data);

      const analyticsRes = await api.get(`/analytics/analytics${qs}`);
      setAnalytics(analyticsRes.data);
      
      // Add a slight delay for UX so the user knows the report ran
      await new Promise(r => setTimeout(r, 400));
    } catch (error) {
      console.error('Failed to fetch report data', error);
    } finally {
      setIsFetching(false);
    }
  };

  const renderSelectedReport = () => {
      if (reportType === 'summary' && summary) {
          return (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
              <div className="card fade-in" style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18}/> Total Income</div>
                <h2 style={{ fontSize: '1.8rem', marginTop: '12px' }}>₹{summary.total_income.toFixed(2)}</h2>
              </div>
              
              <div className="card fade-in" style={{ flex: 1, minWidth: '180px', animationDelay: '0.1s' }}>
                <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingDown size={18}/> Total Expense</div>
                <h2 style={{ fontSize: '1.8rem', marginTop: '12px' }}>₹{summary.total_expense.toFixed(2)}</h2>
              </div>
              
              <div className="card fade-in" style={{ flex: 1, minWidth: '180px', animationDelay: '0.2s' }}>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={18}/> Savings</div>
                <h2 style={{ fontSize: '1.8rem', marginTop: '12px', color: summary.monthly_savings >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                  ₹{summary.monthly_savings.toFixed(2)}
                </h2>
              </div>

              <div className="card fade-in" style={{ flex: 1, minWidth: '180px', animationDelay: '0.3s' }}>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18}/> Top Category</div>
                <h2 style={{ fontSize: '1.8rem', marginTop: '12px', color: 'var(--text-primary)' }}>
                  {summary.highest_spending_category}
                </h2>
              </div>

              <div className="card fade-in" style={{ flex: 1, minWidth: '180px', animationDelay: '0.4s' }}>
                <div style={{ color: summary.budget_exceeded_flag === 'Yes' ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Bell size={18}/> Budget Status
                </div>
                <h2 style={{ fontSize: '1.6rem', marginTop: '12px', color: summary.budget_exceeded_flag === 'Yes' ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {summary.budget_exceeded_flag === 'Yes' ? 'Exceeded limits' : 'Under budget'}
                </h2>
              </div>
            </div>
          );
      }

      if (reportType === 'category' && analytics) {
          return (
             <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                <h3 style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>Category Breakdown</h3>
                <D3PieChart data={analytics.category_totals.sort((a,b) => b.value - a.value).slice(0, 5)} />
              </div>
          );
      }

      if (reportType === 'trend' && analytics) {
          return (
             <div className="card fade-in" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                   <h3>Expense Trend: <span style={{ color: analytics.trend === 'Increasing' ? 'var(--danger)' : 'var(--success)' }}>{analytics.trend}</span></h3>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                   <D3LineChart data={analytics.monthly_expenses} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <div style={{ flex: 1 }}>
                       <p style={{ color: 'var(--text-muted)' }}>Daily Avg Spending</p>
                       <h4>₹{analytics.daily_avg_spending.toFixed(2)}</h4>
                    </div>
                    <div style={{ flex: 1 }}>
                       <p style={{ color: 'var(--text-muted)' }}>Active Loan Flag</p>
                       <h4 style={{ color: analytics.loan_flag === 'Yes' ? 'var(--warning)' : 'var(--text-primary)' }}>{analytics.loan_flag} ({analytics.loan_status})</h4>
                    </div>
                </div>
              </div>
          );
      }

      return null;
  };

  if (loading || (!user && !loading)) return null;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>Dedicated Reports</h2>
            
            {summary && summary.userProfile && (
              <div style={{ background: 'var(--bg-secondary)', padding: '10px 20px', borderRadius: '30px', display: 'flex', gap: '15px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Viewing: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{summary.userProfile.name}</span></div>
                  <div style={{ width: '1px', height: '15px', background: 'var(--border-color)' }}></div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Occupation: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{summary.userProfile.occupation}</span></div>
              </div>
            )}
          </div>

          {/* Dynamic Filter Bar + Report Type Selector */}
          <div className="card fade-in" style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
             
             {/* New Field: Report Type Selection */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                 <label style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 'bold' }}>Select Report to Display</label>
                 <select 
                    className="form-control" 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                    style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '2px solid var(--primary)', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}
                 >
                    <option value="summary">Financial Summary (Cards)</option>
                    <option value="category">Category Breakdown (Pie Chart)</option>
                    <option value="trend">Monthly Trends (Line Graph)</option>
                 </select>
             </div>
             
             <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '10px 0' }}></div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                 <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Filter User</label>
                 <select 
                    className="form-control" 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px' }}
                 >
                    <option value="">Current Logged-in User</option>
                    {usersList.map((u) => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                 </select>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
                 <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>From Date</label>
                 <input 
                    type="date" 
                    className="form-control" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px' }}
                 />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
                 <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>To Date</label>
                 <input 
                    type="date" 
                    className="form-control" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px' }}
                 />
             </div>

             <button className="btn btn-primary" onClick={fetchReportData} disabled={isFetching} style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px', opacity: isFetching ? 0.7 : 1 }}>
                 <Filter size={18} /> {isFetching ? 'Running...' : 'Run Report'}
             </button>
          </div>

          {/* Render selected report dynamically */}
          {renderSelectedReport()}

        </div>
      </div>
    </div>
  );
};

export default Reports;
