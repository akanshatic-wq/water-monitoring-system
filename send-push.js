// api/send-push.js
// Reads all subscribers from Firebase and sends Web Push to each one

import webpush from 'web-push';

const VAPID_PUBLIC_KEY  = 'BNmv-bTaiakWLNZEjCE_DHOhr5tW3JHPUSVqc42m2CT1u4EZUbrHwbNfLw0WerGrXvmv1FB2lzyMr_aAAcqeKcw';
const VAPID_PRIVATE_KEY = 'U-5aa3ZyJ--5nzLMgNBkyYy3eeDKgUfJnzM4cxagiHA';
const FIREBASE_URL      = 'https://water-quality-monitor-7def2-default-rtdb.asia-southeast1.firebasedatabase.app';

webpush.setVapidDetails(
  'mailto:akanshatic@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  // Fetch all subscribers from Firebase
  const fbRes = await fetch(`${FIREBASE_URL}/subscribers.json`);
  const subscribers = await fbRes.json();

  if (!subscribers) {
    return res.status(200).json({ sent: 0, message: 'No subscribers yet' });
  }

  const payload = JSON.stringify({ title, body });
  const entries = Object.entries(subscribers);
  let sent = 0, failed = 0;

  await Promise.all(entries.map(async ([key, sub]) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      );
      sent++;
    } catch (err) {
      console.error('Push failed for', key, err.statusCode);
      // If subscription expired (410), remove it from Firebase
      if (err.statusCode === 410) {
        await fetch(`${FIREBASE_URL}/subscribers/${key}.json`, { method: 'DELETE' });
      }
      failed++;
    }
  }));

  return res.status(200).json({ sent, failed });
}
