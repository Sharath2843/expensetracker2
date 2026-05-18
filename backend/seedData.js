const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense-tracker';

async function seed() {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected for Seeding');

        console.log('Clearing old data...');
        await Transaction.deleteMany();
        await User.deleteMany();

        console.log('Creating 100 users...');
        const userMap = {};
        for(let i=1; i<=100; i++) {
            const uStr = `U${String(i).padStart(3, '0')}`;
            const u = await User.create({
                name: `User ${uStr}`,
                email: `${uStr.toLowerCase()}@example.com`,
                password: 'password123'
            });
            userMap[uStr] = u._id;
        }

        console.log("Users created. Loading transactions...");

        let transactionsBatch = [];
        const csvPath = path.join(__dirname, '../final_expense_dataset.csv');
        
        const stream = fs.createReadStream(csvPath).pipe(csv());

        const savedUserOccupations = {}; // keep track so we only update occupation once per user

        stream.on('data', async (row) => {
             
             // Capture occupation
             if (!savedUserOccupations[row.user_id]) {
                 await User.findByIdAndUpdate(userMap[row.user_id], { occupation: row.occupation });
                 savedUserOccupations[row.user_id] = true;
             }
             
             let mappedType = 'expense';
             if (row.transaction_type.toLowerCase() === 'credit') mappedType = 'income';

             let cat = row.category;
             if (mappedType === 'income' && cat === 'Income') cat = 'Salary'; // Map pure 'Income' category to salary
             
             const doc = {
                 user: userMap[row.user_id],
                 type: mappedType,
                 category: cat,
                 amount: parseFloat(row.amount),
                 date: new Date(row.date),
                 description: row.description || ''
             };

             transactionsBatch.push(doc);

             if (transactionsBatch.length >= 10000) {
                 stream.pause();
                 const batch = [...transactionsBatch];
                 transactionsBatch = []; 
                 await Transaction.insertMany(batch);
                 console.log(`Inserted batch of 10000...`);
                 stream.resume();
             }
        });

        stream.on('end', async () => {
             if (transactionsBatch.length > 0) {
                 await Transaction.insertMany(transactionsBatch);
                 console.log(`Inserted final batch.`);
             }
             console.log('✅ Seeding Complete! MongoDB populated.');
             process.exit();
        });
        
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seed();
