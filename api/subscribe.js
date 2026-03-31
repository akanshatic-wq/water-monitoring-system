// api/subscribe.js
// Saves a Web Push subscription to Firebase Realtime Database

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  const FIREBASE_URL = 'https://water-quality-monitor-7def2-default-rtdb.asia-southeast1.firebasedatabase.app';

  // Use endpoint hash as key to avoid duplicates
  const key = Buffer.from(subscription.endpoint).toString('base64').slice(0, 40).replace(/[^a-zA-Z0-9]/g, '_');

  const response = await fetch(`${FIREBASE_URL}/subscribers/${key}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      savedAt: new Date().toISOString()
    })
  });

  if (response.ok) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
}
