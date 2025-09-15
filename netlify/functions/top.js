import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async () => {
  const { data, error } = await supabase
    .from('scores')
    .select('name,time_ms,created_at')
    .order('time_ms', { ascending: true })
    .limit(20);

  if (error) return { statusCode: 500, body: 'Server error' };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30'
    },
    body: JSON.stringify(data)
  };
};
