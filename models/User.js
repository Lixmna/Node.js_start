const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name : {
        type: String,
        required: true
    },
    token : {
        type: String,
        required: true
    }
});

module.exports = User = mongoose.model('users', UserSchema);