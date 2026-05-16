const nodemailer = require('nodemailer');

let transporter = null;

function initMail() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) {
    console.log('Mail not configured — emails will be logged to console only');
    return;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendLeadNotification(lead) {
  const text = [
    `Новая заявка с сайта ГлавДеталь`,
    `---`,
    `Имя: ${lead.name || 'не указано'}`,
    `Телефон: ${lead.phone}`,
    `VIN / Модель: ${lead.vin_or_model || 'не указано'}`,
    `Источник: ${lead.source}`,
    `Дата: ${lead.created_at}`,
    `---`,
    `ID: ${lead.id}`,
  ].join('\n');

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `Новая заявка — ГлавДеталь (${lead.phone})`,
        text,
      });
    } catch (err) {
      console.error('Failed to send email:', err.message);
    }
  } else {
    console.log('\n[NEW LEAD]');
    console.log(text);
    console.log();
  }
}

module.exports = { initMail, sendLeadNotification };
