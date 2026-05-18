const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// All transaction routes are protected
router.use(protect);

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        const total = await Transaction.countDocuments({ user: req.user.id });
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
            
        res.json({
            transactions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                hasMore: skip + transactions.length < total
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', [
    body('type').isIn(['income', 'expense']).withMessage('Invalid transaction type'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('description').optional().trim().isLength({ max: 500 }),
    body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, category, amount, date, description } = req.body;

        const transaction = await Transaction.create({
            user: req.user.id,
            type,
            category,
            amount,
            date: date ? new Date(date) : Date.now(),
            description
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Make sure the logged in user matches the transaction user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Make sure the logged in user matches the transaction user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await transaction.deleteOne();

        res.json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
