const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            required: [true, 'Please add a transaction type'],
            enum: ['income', 'expense'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
            min: [0.01, 'Amount must be positive'],
            validate: {
                validator: function(v) {
                    return v > 0;
                },
                message: 'Amount must be greater than zero'
            }
        },
        date: {
            type: Date,
            default: Date.now,
            validate: {
                validator: function(v) {
                    return v <= new Date();
                },
                message: 'Transaction date cannot be in the future'
            }
        },
        description: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Transaction', transactionSchema);
