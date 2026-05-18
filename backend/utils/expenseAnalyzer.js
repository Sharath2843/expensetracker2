const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const needsCats = ['Food', 'Rent', 'Bills', 'Health', 'Education', 'Loan_Repayment', 'Groceries'];
const wantsCats = ['Travel', 'Entertainment', 'Others', 'Transfer'];
const incomeCats = ['Salary', 'Allowance', 'Freelance', 'Business_Income', 'Refund', 'Income'];

function getUserInsights(userId) {
  return new Promise((resolve, reject) => {
    // Go up 2 levels: backend/utils -> backend -> project root
    const csvPath = path.join(__dirname, '../../final_expense_dataset.csv');
    
    if (!fs.existsSync(csvPath)) {
        console.error("Dataset not found at", csvPath);
        return reject(new Error("Dataset CSV not found."));
    }

    // Aggregated stats
    let totalIncome = 0;
    let totalExpense = 0;
    
    const monthlyIncome = {};
    const monthlyExpense = {};
    const categorySpending = {};
    
    let needsTotal = 0;
    let wantsTotal = 0;
    let luxuryTotal = 0;
    
    let totalLoanTaken = 0;
    const daysActive = new Set();
    let lastRentDate = null;
    let hasWeekendSpending = false;

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.user_id !== userId) return;
        
        const dateStr = row.date; // format: YYYY-MM-DD
        const [year, month, day] = dateStr.split('-');
        const monthYear = `${month}-${year}`;
        const amount = parseFloat(row.amount);
        const type = row.transaction_type; 
        const cat = row.category;
        
        daysActive.add(dateStr);
        
        // Check weekend spending
        const dt = new Date(`${year}-${month}-${day}`);
        const dw = dt.getDay(); // 0 is Sunday, 6 is Saturday
        if (type === 'Debit' && (dw === 0 || dw === 6)) {
            hasWeekendSpending = true;
        }
        
        if (!monthlyIncome[monthYear]) monthlyIncome[monthYear] = 0;
        if (!monthlyExpense[monthYear]) monthlyExpense[monthYear] = 0;
        
        if (type === 'Credit') {
            if (incomeCats.includes(cat)) {
                totalIncome += amount;
                monthlyIncome[monthYear] += amount;
            }
        } else if (type === 'Debit') {
            // Expenses & Loan taken/repayment
            if (cat !== 'Loan' && cat !== 'Loan_Repayment') { // Actual expense category
                totalExpense += amount;
                monthlyExpense[monthYear] += amount;
                
                if (!categorySpending[cat]) categorySpending[cat] = 0;
                categorySpending[cat] += amount;
                
                if (cat === 'Shopping' || amount >= 5000) {
                    luxuryTotal += amount;
                } else if (needsCats.includes(cat)) {
                    needsTotal += amount;
                } else if (wantsCats.includes(cat)) {
                    wantsTotal += amount;
                } else {
                    wantsTotal += amount;
                }
                
                if (cat === 'Rent') lastRentDate = dateStr;
            } else if (cat === 'Loan') {
                totalLoanTaken += amount;
            }
        }
      })
      .on('end', () => {
        // Find months
        const months = Object.keys(monthlyExpense).sort((a,b) => {
            const [m1, y1] = a.split('-');
            const [m2, y2] = b.split('-');
            if (y1 !== y2) return parseInt(y1) - parseInt(y2);
            return parseInt(m1) - parseInt(m2);
        });
        
        if (months.length === 0) {
            return resolve({ error: "No data found for this user" });
        }

        const currentMonth = months[months.length - 1]; // E.g. "12-2025"
        const prevMonth = months.length > 1 ? months[months.length - 2] : currentMonth;
        
        const currentMonthExpense = monthlyExpense[currentMonth] || 0;
        const prevMonthExpense = monthlyExpense[prevMonth] || 0;
        const currentMonthIncome = monthlyIncome[currentMonth] || 0;
        
        const monthly_savings = currentMonthIncome - currentMonthExpense;
        const savings_rate = currentMonthIncome > 0 ? ((monthly_savings / currentMonthIncome) * 100).toFixed(2) : 0;
        const spending_trend = currentMonthExpense > prevMonthExpense ? 'increase' : 'decrease';
        
        const avgIncome = totalIncome / Math.max(1, months.length);
        const user_budget = avgIncome * 0.8; // Assume user budget is 80% of average income
        const budget_remaining = user_budget - currentMonthExpense;
        const budget_exceeded_flag = currentMonthExpense > user_budget;
        
        let highest_cat = 'None';
        if (Object.keys(categorySpending).length > 0) {
             highest_cat = Object.keys(categorySpending).reduce((a, b) => categorySpending[a] > categorySpending[b] ? a : b);
        }
        
        const daily_avg_spending = totalExpense / Math.max(1, daysActive.size);
        const debt_ratio = totalIncome > 0 ? (totalLoanTaken / totalIncome).toFixed(2) : 0;
        
        // Random peak time assigned deterministically based on user ID for consistency
        const peakTimes = ["Morning", "Afternoon", "Evening", "Night"];
        const peakIdx = parseInt(userId.replace('U', ''), 10) % 4 || 0;
        const spending_peak_time = peakTimes[peakIdx];
        
        let next_due_date = "N/A";
        if (lastRentDate) {
            const [y, m, d] = lastRentDate.split('-');
            let nm = parseInt(m) + 1;
            let ny = parseInt(y);
            if (nm > 12) { nm = 1; ny += 1; }
            next_due_date = `${d.padStart(2,'0')}-${String(nm).padStart(2,'0')}-${ny} (Rent due)`;
        }
        
        // Format for charts
        const category_breakdown = Object.keys(categorySpending).map(name => ({
            name,
            value: categorySpending[name]
        })).sort((a,b) => b.value - a.value); // sort descending

        const needs_wants_luxury = [
            { name: 'Need', value: needsTotal },
            { name: 'Want', value: wantsTotal },
            { name: 'Luxury', value: luxuryTotal }
        ];

        const monthly_trends = months.slice(-12).map(m => ({ // Last 12 months
            month: m,
            expense: monthlyExpense[m] || 0,
            income: monthlyIncome[m] || 0
        }));

        resolve({
            userId,
            highest_spending_category: highest_cat,
            monthly_savings,
            savings_rate,
            spending_trend,
            user_budget,
            budget_remaining,
            budget_exceeded_flag,
            recurring_frequency: 'Monthly',
            next_due_date,
            daily_avg_spending,
            monthly_total_expense: currentMonthExpense,
            debt_ratio,
            spending_peak_time,
            weekend_spending_flag: hasWeekendSpending,
            chartData: {
                category_breakdown,
                needs_wants_luxury,
                monthly_trends
            }
        });
      })
      .on('error', reject);
  });
}

module.exports = { getUserInsights };
