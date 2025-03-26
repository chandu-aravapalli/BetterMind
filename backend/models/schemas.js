const mongoose = require('mongoose');
const { Schema } = mongoose;

// User Schema
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true }, // In production, store hashed passwords!
  role:      { type: String, enum: ['patient', 'doctor'], required: true },
  phoneNumber: { type: String }, // optional
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Assessment Schema
const assessmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentType: { 
    type: String, 
    enum: ['preassessment', 'phq9', 'gad7', 'ptsd'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'inprogress', 'completed'], 
    default: 'pending' 
  },
  responses: { type: Schema.Types.Mixed, required: true },
  score: { type: Number },           // raw score
  normalizedScore: { type: Number },   // score normalized to 100
  severity: { type: String },          // e.g., "Mild", "Moderate"
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }          // set when the test is finished
});

// Notification Schema
const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String }, // e.g., "assessmentReminder", "resultReady"
  message: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Assessment = mongoose.model('Assessment', assessmentSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  User,
  Assessment,
  Notification
}; 