const express = require('express');
const router = express.Router();
const { getUserInsights } = require('../utils/expenseAnalyzer');

// GET /api/insights/:userId
router.get('/:userId', async (req, res) => {
    try {
        const insights = await getUserInsights(req.params.userId || 'U001');
        if (insights.error) {
            return res.status(404).json({ message: insights.error });
        }
        res.json(insights);
    } catch (err) {
        console.error("Insights Error:", err);
        res.status(500).json({ message: 'Server error processing insights data' });
    }
});

module.exports = router;
