// AI Safety Kaiserslautern — the one bit of server code on the site.
//
// POST /api/start-group: the "Start a group" form. Each entry is emailed to the inbox
// set as the FORM_TO secret (kept out of this public repo), with Reply-To set to the
// visitor, so a normal reply answers them. Nothing is stored.
// Every other path never reaches this script: wrangler.jsonc serves the static files first.

import { EmailMessage } from 'cloudflare:email';

const FROM = 'form@aisafetykaiserslautern.org';
const ROLES = ['a student', 'a PhD researcher', 'staff or faculty', 'other'];
const LIMITS = { Name: 100, Email: 200, University: 200, Motivation: 4000 };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/start-group') return startGroup(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

async function startGroup(request, env, url) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return reply(403, 'Wrong origin', request);

  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return reply(400, 'Could not read the form', request);
  }
  const v = (k) => String(form.get(k) || '').trim();

  // Bots fill the hidden field; pretend it worked so they do not retry.
  if (v('website')) return reply(200, 'Thanks!', request);

  const data = { Name: v('Name'), Email: v('Email'), University: v('University'),
                 Role: v('Role'), Motivation: v('Motivation') };
  for (const k of Object.keys(LIMITS)) {
    if (!data[k] || data[k].length > LIMITS[k]) return reply(400, 'Please fill in ' + k.toLowerCase(), request);
  }
  if (!/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(data.Email)) {
    return reply(400, 'Please check your email address', request);
  }
  if (!ROLES.includes(data.Role)) data.Role = 'other';
  if (!env.FORM_TO || !env.EMAIL) return reply(503, 'Form not set up', request);

  const text = [
    'New "Start a group" entry from aisafetykaiserslautern.org',
    '',
    'Name: ' + data.Name,
    'Email: ' + data.Email,
    'University: ' + data.University,
    'I am ' + data.Role,
    '',
    'What motivates me:',
    data.Motivation,
    '',
    '(Reply to this email to answer ' + data.Name + ' directly.)',
  ].join('\r\n');

  try {
    const raw = mime({
      from: 'AI Safety Kaiserslautern website <' + FROM + '>',
      to: env.FORM_TO,
      replyTo: data.Email,
      subject: 'Start a group: ' + data.University + ' (' + data.Name + ')',
      text,
    });
    await env.EMAIL.send(new EmailMessage(FROM, env.FORM_TO, raw));
  } catch (e) {
    console.error('send failed', e && e.message);
    return reply(502, 'Could not send', request);
  }
  return reply(200, 'Thanks!', request);
}

// JS submits ask for JSON; a plain form post (no JS) gets sent back to the section.
function reply(status, message, request) {
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: status === 200, message }), {
      status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  const to = status === 200 ? '/?sent=1#start-a-group' : '/?sent=0#start-a-group';
  return new Response(null, { status: 303, headers: { Location: to, 'Cache-Control': 'no-store' } });
}

// Minimal UTF-8 plain-text message. Header values are encoded, so line breaks in them cannot add headers.
function mime({ from, to, replyTo, subject, text }) {
  const domain = FROM.split('@')[1];
  return [
    'From: ' + from,
    'To: ' + to,
    'Reply-To: ' + replyTo,
    'Subject: =?UTF-8?B?' + b64(subject.replace(/[\r\n]+/g, ' ')) + '?=',
    'Date: ' + new Date().toUTCString(),
    'Message-ID: <' + crypto.randomUUID() + '@' + domain + '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text).replace(/.{76}/g, '$&\r\n'),
  ].join('\r\n');
}

function b64(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
