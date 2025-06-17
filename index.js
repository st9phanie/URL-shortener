const express = require('express');
const crypto = require('crypto');
const admin = require("firebase-admin");
const dotenv = require('dotenv')
const cors = require('cors');
dotenv.config();

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const app = express();
app.use(express.json());
app.use(express.static('dist'))
app.use(cors());


const serviceAccount = require('./firebase-service-account.json');

const firebaseConfig = {
  apiKey: "AIzaSyBq6gSFEBO_yCNg4piccvcgaXkTqe76-bk",
  authDomain: "shrinkify-999.firebaseapp.com",
  projectId: "shrinkify-999",
  storageBucket: "shrinkify-999.firebasestorage.app",
  messagingSenderId: "672935757921",
  appId: "1:672935757921:web:a8fed421e20d6432d3c220",
  measurementId: "G-GBMSK45X42"
};

admin.initializeApp({
  credential: cert(serviceAccount)
});

module.exports = admin;

const db = getFirestore();
const PORT = 3000;


app.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  console.log(req.body)
  if (!longUrl) return res.status(400).json({ error: 'Missing URL' });

  const shortId = crypto.randomBytes(3).toString('hex');

  try {
    await db.collection('urls').doc(shortId).set({
      longUrl,
      createdAt: FieldValue.serverTimestamp()
    });

    const shortUrl = `http://localhost:${PORT}/${shortId}`;
    res.json({ shortUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error saving URL' });
  }
});

app.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await db.collection('urls').doc(id).get();
    if (!doc.exists) return res.status(404).send('URL not found');

    const { longUrl } = doc.data();
    res.redirect(longUrl);
  } catch (error) {
    res.status(500).send('Error processing request');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

