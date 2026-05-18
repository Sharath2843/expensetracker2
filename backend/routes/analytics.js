const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Base route logic 
router.use(protect);

// Helper to build the query from req
async function buildQuery(req) {
    let targetUserId = req.user.id;
    if (req.query.userId) {
        targetUserId = req.query.userId;
    }

    const query = { user: targetUserId };

    if (req.query.fromDate || req.query.toDate) {
        query.date = {};
        if (req.query.fromDate) query.date.$gte = new Date(req.query.fromDate);
        if (req.query.toDate) query.date.$lte = new Date(req.query.toDate);
    }
    
    return query;
}

// @route   GET /api/analytics/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('name _id').sort('name');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/analytics/summary
router.get('/summary', async (req, res) => {
    try {
        const query = await buildQuery(req);
        const transactions = await Transaction.find(query);
        const targetUser = await User.findById(query.user);

        let total_income = 0;
        let total_expense = 0;
        const categoryMap = {};

        transactions.forEach(t => {
            if (t.type === 'income') {
                total_income += t.amount;
            } else if (t.type === 'expense') {
                total_expense += t.amount;

                if (!categoryMap[t.category]) categoryMap[t.category] = 0;
                categoryMap[t.category] += t.amount;
            }
        });

        const monthly_savings = total_income - total_expense;
        
        let highest_spending_category = 'None';
        let maxAmt = 0;
        for (const [cat, amt] of Object.entries(categoryMap)) {
            if (amt > maxAmt) {
                maxAmt = amt;
                highest_spending_category = cat;
            }
        }

        const user_budget = 50000; 
        const budget_exceeded_flag = total_expense > user_budget ? 'Yes' : 'No';

        res.json({
            userProfile: {
                name: targetUser ? targetUser.name : 'Unknown',
                occupation: targetUser ? targetUser.occupation : 'Unknown',
                email: targetUser ? targetUser.email : 'N/A'
            },
            total_income,
            total_expense,
            monthly_savings,
            highest_spending_category,
            budget_exceeded_flag
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/analytics/analytics
router.get('/analytics', async (req, res) => {
    try {
        const query = await buildQuery(req);
        const transactions = await Transaction.find(query);

        // Determine date range span to decide granularity
        let granularity = 'monthly'; // default
        if (req.query.fromDate && req.query.toDate) {
            const from = new Date(req.query.fromDate);
            const to = new Date(req.query.toDate);
            const diffDays = (to - from) / (1000 * 60 * 60 * 24);
            if (diffDays <= 60) {
                granularity = 'daily';
            }
        } else if (req.query.fromDate && !req.query.toDate) {
            // Single from-date: check span to today
            const from = new Date(req.query.fromDate);
            const diffDays = (new Date() - from) / (1000 * 60 * 60 * 24);
            if (diffDays <= 60) {
                granularity = 'daily';
            }
        } else if (!req.query.fromDate && req.query.toDate) {
            // If only toDate, use monthly
            granularity = 'monthly';
        }

        const category_totals = {};
        const periodExpenses = {};
        const periodIncome = {};
        const dailyHeatmap = {};
        const periodExpenseCategories = {};
        const periodIncomeCategories = {};
        const dailyHeatmapCategories = {};
        
        let loan_flag = 'No';
        let loan_status = 'None';
        
        const activeDays = new Set();
        let total_expense = 0;
        let total_income = 0;

        // Default budget allocations per category
        const defaultBudgets = {
            'Food': 8000, 'Rent': 15000, 'Transport': 3000, 'Entertainment': 5000,
            'Shopping': 7000, 'Utilities': 4000, 'Healthcare': 5000, 'Education': 6000,
            'Travel': 10000, 'Insurance': 3000, 'Groceries': 6000, 'Subscriptions': 2000,
            'Investment': 15000, 'Bills': 5000, 'Others': 5000
        };

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            const dateStr = tDate.toLocaleDateString('en-GB'); 
            const monthStr = (tDate.getMonth() + 1).toString().padStart(2, '0');
            const dayStr = tDate.getDate().toString().padStart(2, '0');
            const monthYear = `${tDate.getFullYear()}-${monthStr}`;
            const fullDate = `${tDate.getFullYear()}-${monthStr}-${dayStr}`;

            // Pick grouping key based on granularity
            const periodKey = granularity === 'daily' ? fullDate : monthYear;

            if (t.type === 'expense') {
                total_expense += t.amount;
                activeDays.add(dateStr);
                
                if (!category_totals[t.category]) category_totals[t.category] = 0;
                category_totals[t.category] += t.amount;

                if (!periodExpenses[periodKey]) periodExpenses[periodKey] = 0;
                periodExpenses[periodKey] += t.amount;

                if (!periodExpenseCategories[periodKey]) periodExpenseCategories[periodKey] = {};
                if (!periodExpenseCategories[periodKey][t.category]) periodExpenseCategories[periodKey][t.category] = 0;
                periodExpenseCategories[periodKey][t.category] += t.amount;

                // Daily heatmap (always daily regardless of granularity)
                if (!dailyHeatmap[fullDate]) dailyHeatmap[fullDate] = 0;
                dailyHeatmap[fullDate] += t.amount;

                if (!dailyHeatmapCategories[fullDate]) dailyHeatmapCategories[fullDate] = {};
                if (!dailyHeatmapCategories[fullDate][t.category]) dailyHeatmapCategories[fullDate][t.category] = 0;
                dailyHeatmapCategories[fullDate][t.category] += t.amount;
            }

            if (t.type === 'income') {
                total_income += t.amount;
                if (!periodIncome[periodKey]) periodIncome[periodKey] = 0;
                periodIncome[periodKey] += t.amount;

                if (!periodIncomeCategories[periodKey]) periodIncomeCategories[periodKey] = {};
                if (!periodIncomeCategories[periodKey][t.category]) periodIncomeCategories[periodKey][t.category] = 0;
                periodIncomeCategories[periodKey][t.category] += t.amount;
            }

            if (t.description) {
                const desc = t.description.toLowerCase();
                if (desc.includes('loan from')) {
                    loan_flag = 'Yes';
                    loan_status = 'Active';
                }
                if (desc.includes('loan repaid')) {
                    loan_status = 'Repaid';
                }
            }
        });

        const daily_avg_spending = activeDays.size > 0 ? (total_expense / activeDays.size) : 0;

        let highest_spending_category = 'None';
        let maxAmt = 0;
        for (const [cat, amt] of Object.entries(category_totals)) {
            if (amt > maxAmt) {
                maxAmt = amt;
                highest_spending_category = cat;
            }
        }

        const periods = Object.keys(periodExpenses).sort(); 
        // Also collect all periods from income
        Object.keys(periodIncome).forEach(p => {
            if (!periods.includes(p)) periods.push(p);
        });
        periods.sort();

        let trend = 'Stable';
        if (periods.length >= 2) {
            const currentExp = periodExpenses[periods[periods.length - 1]] || 0;
            const prevExp = periodExpenses[periods[periods.length - 2]] || 0;
            
            if (currentExp > prevExp) trend = 'Increasing';
            else if (currentExp < prevExp) trend = 'Decreasing';
        }

        const categories_array = Object.keys(category_totals).map(k => ({
             category: k,
             value: category_totals[k]
        }));
        
        const expenses_array = periods.map(p => ({
            month: p,
            expense: periodExpenses[p] || 0
        }));

        // Income vs Expense comparison data
        const income_vs_expense = periods.map(p => ({
            period: p,
            income: periodIncome[p] || 0,
            expense: periodExpenses[p] || 0,
            incomeCategories: periodIncomeCategories[p] || {},
            expenseCategories: periodExpenseCategories[p] || {}
        }));

        // Daily heatmap array
        const heatmap_data = Object.keys(dailyHeatmap).sort().map(d => ({
            date: d,
            amount: dailyHeatmap[d],
            categories: dailyHeatmapCategories[d] || {}
        }));

        // Category budget progress
        const numMonths = Object.keys(periodExpenses).length || 1;
        const category_budgets = Object.keys(category_totals).map(cat => {
            const spent = category_totals[cat];
            const monthlyBudget = defaultBudgets[cat] || 5000;
            const totalBudget = monthlyBudget * numMonths;
            return {
                category: cat,
                spent: spent,
                budget: totalBudget,
                percent: Math.min(Math.round((spent / totalBudget) * 100), 100),
                exceeded: spent > totalBudget
            };
        }).sort((a, b) => b.percent - a.percent);

        res.json({
            category_totals: categories_array,
            highest_spending_category,
            daily_avg_spending,
            trend,
            monthly_expenses: expenses_array,
            income_vs_expense,
            heatmap_data,
            category_budgets,
            granularity,
            loan_flag,
            loan_status
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
