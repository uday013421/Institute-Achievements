const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Data")
.then(()=>{
console.log("mongo connected");

})
.catch(()=>{
    console.log("error to connect database");
    
})

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'faculty', 'student'], // Added 'admin' role
        required: true
    },
    token: {
        type: String
    },
    department: {
        type: String, // Added department field for faculty
        default: null
    }
});

// Create the user model
const Collection = mongoose.model('User', userSchema);

// Export the user model
module.exports = Collection;

