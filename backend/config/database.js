const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Mongoose Connected");
        })
        .catch(err => {
            console.error("Error connecting to MongoDB:", err.message);
            // Optionally, you might want to handle this error further or exit the application
            process.exit(1);
        });
}

module.exports = connectDatabase;
