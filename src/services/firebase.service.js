const admin = require('firebase-admin');

const serviceAccount = require('./notification-1fa4e-firebase-adminsdk-eydoi-24acc9bd7b.json'); // Path to your service account JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
