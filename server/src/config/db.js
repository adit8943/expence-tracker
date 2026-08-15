const mongoose = require('mongoose');

// The server does not start until its MongoDB connection succeeds.
const connectDatabase = () => mongoose.connect(process.env.MONGO_URI);

module.exports = connectDatabase;
