const SUPABASE_URL = 'https://tzyhhwlltobszgkmtonz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eWhod2xsdG9ic3pna210b256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDE4NDQsImV4cCI6MjA3MzI3Nzg0NH0.c0z437WMYZhRdocTRHZNTXWoerMEzqzHO1vqOS5cbjc';

async function loadBoard() {
  const url = new URL(`${SUPABASE_URL}/rest/v1/leaderboard_best`);
  url.searchParams.set('select', 'name,best_time,best_time_formatted');
  url.searchParams.set('order', 'best_time.asc');
  url.searchParams.set('limit', '15');

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    },
    cache: 'no-store'
  });

  const tbody = document.querySelector('#board tbody');

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    tbody.innerHTML = `<tr><td colspan="3">Error ${res.status}${err ? `: ${escapeHtml(err)}` : ''}</td></tr>`;
    return;
  }

  const rows = await res.json();
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="3">No results</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((r, i) => {
    const rankClass = i < 5 ? ` rank-${i+1}` : '';
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    return `
      <tr class="${rankClass}">
        <td class="rank">${i + 1}</td>
        <td class="name">${medal ? `${medal} ` : ''}${escapeHtml(r.name)}</td>
        <td class="time">${escapeHtml(r.best_time_formatted)}</td>
      </tr>
    `;
  }).join('');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

loadBoard();