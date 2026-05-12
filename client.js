const SUPABASE_URL = 'https://ghcepeyccjjzmhcgizli.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoY2VwZXljY2pqem1oY2dpemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTk0NDYsImV4cCI6MjA5MzMzNTQ0Nn0.dm-sSorEev55OqLI0OEojL-iNKhw8zVeBUxG-zP4hoU';

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('client')) return params.get('client');
  const parts = window.location.pathname.split('/');
  const idx = parts.indexOf('clients');
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

async function loadClient() {
  const slug = getSlug();
  if (!slug) { console.warn('No slug found.'); return null; }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/clients?slug=eq.${slug}&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) { console.error('Supabase fetch failed:', res.status); return null; }
  const data = await res.json();
  if (!data.length) { console.warn('No client found:', slug); return null; }
  const record = data[0];
  return { ...record, ...(record.custom_data || {}) };
}

function applyClient(c) {
  if (!c) return;
  document.querySelectorAll('[data-c]').forEach(el => {
    const key = el.getAttribute('data-c');
    if (c[key] !== undefined) el.textContent = c[key];
  });
  document.querySelectorAll('[data-c-href]').forEach(el => {
    const key = el.getAttribute('data-c-href');
    if (c[key] !== undefined) el.href = c[key];
  });
  document.querySelectorAll('[data-c-src]').forEach(el => {
    const key = el.getAttribute('data-c-src');
    if (c[key] !== undefined) el.src = c[key];
  });
  if (c.studio_name) {
    document.title = document.title.replace('{{studio_name}}', c.studio_name);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const client = await loadClient();
  applyClient(client);
  window.__client = client;
  window.dispatchEvent(new CustomEvent('clientLoaded', { detail: client }));
});
