const mongoose = require('mongoose');
const { User, Assessment, Notification } = require('../models/schemas');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/healthapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testQueries() {
  try {

    // 3. Find all patients
    console.log('\n=== All Patients ===');
    const patients = await User.find({ role: 'patient' });
    console.log(patients);

    // 4. Find all assessments for a specific user
    console.log('\n=== All Assessments for John Doe ===');
    const johnDoe = await User.findOne({ firstName: 'John', lastName: 'Doe' });
    const johnsAssessments = await Assessment.find({ userId: johnDoe._id });
    console.log(johnsAssessments);

    // 5. Find all completed assessments
    console.log('\n=== All Completed Assessments ===');
    const completedAssessments = await Assessment.find({ status: 'completed' });
    console.log(completedAssessments);

    // 6. Find all unread notifications
    console.log('\n=== All Unread Notifications ===');
    const unreadNotifications = await Notification.find({ read: false });
    console.log(unreadNotifications);


    // 8. Find all notifications for a specific user
    console.log('\n=== All Notifications for John Doe ===');
    const johnsNotifications = await Notification.find({ userId: johnDoe._id });
    console.log(johnsNotifications);


    // 10. Find assessments completed in the last 24 hours
    console.log('\n=== Recently Completed Assessments ===');
    const recentAssessments = await Assessment.find({
      completedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    console.log(recentAssessments);

  } catch (err) {
    console.error('Error running queries:', err);
  } finally {
    mongoose.connection.close();
  }
}

testQueries(); 