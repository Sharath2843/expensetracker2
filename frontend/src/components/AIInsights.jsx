import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Target, 
  Clock, Calendar, Wallet, CreditCard, Activity, Percent
} from 'lucide-react';

const COLORS = ['#00C853', '#FFA000', '#FF3D00']; // Need, Want, Luxury
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Defaults to U001 or any user 
        const res = await api.get('/insights/U001');
        setInsights(res.data);
      } catch (error) {
        console.error('Failed to fetch AI insights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return <div className="card fade-in" style={{ marginTop: '30px' }}><p>Loading AI Insights...</p></div>;
  }

  if (!insights || insights.error) {
    return null;
  }

  const {
    monthly_savings, savings_rate, spending_trend, user_budget,
    budget_remaining, budget_exceeded_flag, highest_spending_category,
    daily_avg_spending, monthly_total_expense, debt_ratio,
    spending_peak_time, weekend_spending_flag, recurring_frequency,
    next_due_date, chartData
  } = insights;

  return (
    <div className="card fade-in" style={{ marginTop: '30px', animationDelay: '0.4s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={24} color="var(--primary)" /> Smart AI Analysis
        </h2>
        
        {budget_exceeded_flag ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', borderRadius: '8px', fontWeight: '500' }}>
            <AlertTriangle size={20} /> Budget Exceeded!
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '8px', fontWeight: '500' }}>
            <CheckCircle size={20} /> On Track
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', marginBottom: '30px' 
      }}>
        
        <InsightBox 
          icon={<Target size={20} color="var(--primary)" />} title="Monthly Budget" 
          value={`₹${user_budget.toFixed(2)}`} subtext={`Remaining: ₹${budget_remaining.toFixed(2)}`} 
          subtextColor={budget_remaining < 0 ? 'var(--danger)' : 'var(--success)'}
        />
        
        <InsightBox 
          icon={<Wallet size={20} color="var(--success)" />} title="Monthly Savings" 
          value={`₹${monthly_savings.toFixed(2)}`} subtext={`Rate: ${savings_rate}%`} 
        />
        
        <InsightBox 
          icon={spending_trend === 'increase' ? <TrendingUp size={20} color="var(--danger)" /> : <TrendingDown size={20} color="var(--success)" />} 
          title="Spending Trend" 
          value={spending_trend.charAt(0).toUpperCase() + spending_trend.slice(1)} 
          subtext={`Avg Daily: ₹${daily_avg_spending.toFixed(2)}`} 
        />
        
        <InsightBox 
          icon={<CreditCard size={20} color="var(--warning)" />} title="Debt Ratio" 
          value={debt_ratio} subtext="Total Loans / Income" 
        />
      </div>

      {/* Secondary Insight Row */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', marginBottom: '40px', background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' 
      }}>
        <div>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>Top Category</p>
           <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{highest_spending_category}</h4>
        </div>
        <div>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>Peak Time</p>
           <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap:'6px' }}>
             <Clock size={16}/> {spending_peak_time}
           </h4>
        </div>
        <div>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>Weekend Spender</p>
           <h4 style={{ fontSize: '1.2rem', color: weekend_spending_flag ? 'var(--warning)' : 'var(--text-primary)' }}>
             {weekend_spending_flag ? 'Yes (High)' : 'No (Low)'}
           </h4>
        </div>
        <div>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>Next Bill ({recurring_frequency})</p>
           <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap:'6px' }}>
             <Calendar size={16}/> {next_due_date}
           </h4>
        </div>
      </div>

      {/* Charts Section */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        Spending Analysis
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'center' }}>
        
        {/* Needs / Wants / Luxury Pie Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Expense Types</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.needs_wants_luxury}
                cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                paddingAngle={5} dataKey="value"
              >
                {chartData.needs_wants_luxury.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value) => `₹${value.toFixed(2)}`} 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: '#fff' }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Bar Chart */}
        <div style={{ flex: 1, minWidth: 0 }}>
             <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Category Breakdown</h4>
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.category_breakdown.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" />
                  <YAxis dataKey="name" type="category" width={100} stroke="var(--text-primary)" fontSize={12} tick={{fill: 'var(--text-primary)'}} />
                  <RechartsTooltip 
                     cursor={{fill: 'transparent'}}
                     contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                     formatter={(value) => `₹${value}`}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.category_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

// Reusable mini stat component
const InsightBox = ({ icon, title, value, subtext, subtextColor }) => (
  <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
      {icon} <span>{title}</span>
    </div>
    <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{value}</h3>
    <p style={{ fontSize: '0.85rem', color: subtextColor || 'var(--text-muted)' }}>{subtext}</p>
  </div>
);

export default AIInsights;
