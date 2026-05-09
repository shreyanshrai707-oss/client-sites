// ============================================================
//  RE-CLIENT.JS — Real Estate Dynamic Data Loader
//  Fetches agent data from Supabase based on URL slug.
//  Works for: index, listings, selling, communities,
//             success-stories, contact
// ============================================================

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

async function loadAgent() {
  const slug = getSlug();
  if (!slug) { console.warn('No slug found.'); return null; }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/re_agents?slug=eq.${slug}&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) { console.error('Supabase error:', res.status); return null; }
  const data = await res.json();
  if (!data.length) { console.warn('No agent found for slug:', slug); return null; }
  return data[0];
}

function applyAgent(a) {
  if (!a) return;
  document.querySelectorAll('[data-a]').forEach(el => {
    const key = el.getAttribute('data-a');
    if (a[key] !== undefined) el.textContent = a[key];
  });
  document.querySelectorAll('[data-a-href]').forEach(el => {
    const key = el.getAttribute('data-a-href');
    if (a[key] !== undefined) el.href = a[key];
  });
  document.querySelectorAll('[data-a-src]').forEach(el => {
    const key = el.getAttribute('data-a-src');
    if (a[key] !== undefined) el.src = a[key];
  });
  document.querySelectorAll('[data-a-action]').forEach(el => {
    const key = el.getAttribute('data-a-action');
    if (a[key] !== undefined) el.action = a[key];
  });
  if (a.agent_name) {
    document.title = document.title.replace('Arjun', a.agent_name).replace('Arjun Mehta', a.agent_name);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const agent = await loadAgent();
  applyAgent(agent);
  window.__agent = agent;
  // Dispatch event so page-specific scripts know data is ready
  window.dispatchEvent(new CustomEvent('agentLoaded', { detail: agent }));
});
