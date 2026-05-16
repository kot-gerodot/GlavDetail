require('dotenv').config();

const express = require('express');
const path = require('path');
const db = require('./db');
const auth = require('./auth');
const mail = require('./mail');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/leads', auth);
app.get('/api/leads', (req, res) => {
  const leads = db.getAll();
  res.json(leads);
});

app.delete('/api/leads/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const lead = db.getById(id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  db.remove(id);
  res.json({ ok: true });
});

app.post('/api/lead', async (req, res) => {
  const { name, phone, vin_or_model, source } = req.body;

  if (!phone || phone.trim().length < 5) {
    return res.status(400).json({ error: 'Phone is required' });
  }

  const lead = db.create({
    name: (name || '').trim(),
    phone: phone.trim(),
    vin_or_model: (vin_or_model || '').trim(),
    source: (source || 'unknown').trim(),
  });

  mail.sendLeadNotification(lead).catch(() => {});

  res.status(201).json({ ok: true, id: lead.id });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

async function start() {
  await db.initDB();
  mail.initMail();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
