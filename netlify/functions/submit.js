const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// Edit this list to include your production/custom domains as needed
const ALLOW_ORIGINS = new Set([
  'https://lucent-boba-a4f4de.netlify.app/'
]);

exports.handler = async (event) => {
  const requestOrigin = event.headers?.origin || '';
  const origin = ALLOW_ORIGINS.has(requestOrigin)
    ? requestOrigin
    : 'https://lucent-boba-a4f4de.netlify.app/';

  const cors = {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // cache preflight for 24h
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers: cors, body: 'Invalid JSON' };
    }

    const { name, time_ms } = body;

    if (typeof name !== 'string' || name.length < 1 || name.length > 20) {
      return { statusCode: 400, headers: cors, body: 'Invalid name' };
    }
    if (!Number.isInteger(time_ms) || time_ms < 0 || time_ms > 60 * 60 * 1000) {
      return { statusCode: 400, headers: cors, body: 'Invalid time' };
    }

    const { error } = await supabase.from('scores').insert({ name, time_ms });
    if (error) {
      console.error('Supabase insert error:', error);
      return { statusCode: 500, headers: cors, body: 'DB error' };
    }

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    console.error('Unhandled error:', e);
    return { statusCode: 500, headers: cors, body: 'Server error' };
  }
};

