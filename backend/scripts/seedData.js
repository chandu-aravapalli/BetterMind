const mongoose = require('mongoose');
const { User, Assessment, Notification } = require('../models/schemas');

// --- Connect to MongoDB --- //
mongoose.connect('mongodb://localhost:27017/healthapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Seed Dummy Data --- //
async function seedData() {
  try {
    // Clear existing collections (use with caution in production)
    await User.deleteMany({});
    await Assessment.deleteMany({});
    await Notification.deleteMany({});

    // Create dummy users
    const patient1 = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'patient'
    });
    
    const patient2 = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      role: 'patient'
    });
    
    const doctor1 = new User({
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'emily.brown@example.com',
      password: 'password123',
      role: 'doctor',
      phoneNumber: '555-123-4567'
    });
    
    await patient1.save();
    await patient2.save();
    await doctor1.save();

    // Create dummy assessments for patient1

    // Preassessment Form
    const preAssessment = new Assessment({
      userId: patient1._id,
      assessmentType: 'preassessment',
      status: 'completed',
      responses: {
        consent: "Yes, I consent.",
        diagnosedCondition: "No, I have never been diagnosed.",
        mentalHealthDiagnosis: ["Depression", "Anxiety Disorder"],
        pastChallenges: ["Trouble holding a job", "Difficulty managing emotions"],
        treatment: "No, but I want to seek treatment.",
        therapy: "No, I have never had therapy.",
        medications: ["Antidepressants"],
        primaryCare: "Yes, a primary care physician.",
        insurance: "Yes, fully covered."
      },
      score: 0,
      normalizedScore: 0,
      severity: ''
    });

    // PHQ-9 (Depression Assessment)
    const phq9Assessment = new Assessment({
      userId: patient1._id,
      assessmentType: 'phq9',
      status: 'completed',
      responses: {
        q1: 1,
        q2: 2,
        q3: 1,
        q4: 2,
        q5: 1,
        q6: 1,
        q7: 2,
        q8: 1,
        q9: 0
      },
      score: 11,
      normalizedScore: Math.round((11 / 27) * 100), // roughly 41%
      severity: 'Moderate depression',
      completedAt: new Date()
    });

    // GAD-7 (Anxiety Assessment)
    const gad7Assessment = new Assessment({
      userId: patient1._id,
      assessmentType: 'gad7',
      status: 'completed',
      responses: {
        q1: 1,
        q2: 1,
        q3: 2,
        q4: 1,
        q5: 1,
        q6: 1,
        q7: 0
      },
      score: 7,
      normalizedScore: Math.round((7 / 21) * 100), // roughly 33%
      severity: 'Mild anxiety',
      completedAt: new Date()
    });

    await preAssessment.save();
    await phq9Assessment.save();
    await gad7Assessment.save();

    // Create dummy notifications
    const notif1 = new Notification({
      userId: patient1._id,
      type: 'assessmentReminder',
      message: 'Your PHQ-9 assessment is ready. Please complete it.'
    });

    const notif2 = new Notification({
      userId: doctor1._id,
      type: 'resultReady',
      message: 'New assessment results available for patient John Doe.'
    });

    await notif1.save();
    await notif2.save();

    console.log('Dummy data inserted successfully.');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedData(); 