// ============================================================
//  CLIENT.JS  —  Fetches client data from Supabase
//  Drop this file in every page folder. It auto-detects
//  the slug from the URL and loads the right client data.
// ============================================================

const SUPABASE_URL = 'https://ghcepeyccjjzmhcgizli.supabase.co';       // ← replace once
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoY2VwZXljY2pqem1oY2dpemxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTk0NDYsImV4cCI6MjA5MzMzNTQ0Nn0.dm-sSorEev55OqLI0OEojL-iNKhw8zVeBUxG-zP4hoU';  // ← replace once

// Reads ?client=slug OR folder name from URL
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('client')) return params.get('client');
  // works if URL is /clients/aura-interiors/index.html
  const parts = window.location.pathname.split('/');
  const idx = parts.indexOf('clients');
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

async function loadClient() {
  const slug = getSlug();
  if (!slug) {
    console.warn('No client slug found in URL.');
    return null;
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/clients?slug=eq.${slug}&select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('Supabase fetch failed:', res.status);
    return null;
  }

  const data = await res.json();
  if (!data.length) {
    console.warn('No client found for slug:', slug);
    return null;
  }

  return data[0];
}

// Replaces every [data-c="key"] element with client[key]
function applyClient(c) {
  if (!c) return;

  // Text fields
  document.querySelectorAll('[data-c]').forEach(el => {
    const key = el.getAttribute('data-c');
    if (c[key] !== undefined) el.textContent = c[key];
  });

  // href fields (WhatsApp, email, phone links)
  document.querySelectorAll('[data-c-href]').forEach(el => {
    const key = el.getAttribute('data-c-href');
    if (c[key] !== undefined) el.href = c[key];
  });

  // src fields (images)
  document.querySelectorAll('[data-c-src]').forEach(el => {
    const key = el.getAttribute('data-c-src');
    if (c[key] !== undefined) el.src = c[key];
  });

  // Page title
  if (c.studio_name) {
    document.title = document.title.replace('{{studio_name}}', c.studio_name);
  }
}

// Auto-run on page load
window.addEventListener('DOMContentLoaded', async () => {
  const client = await loadClient();
  applyClient(client);
  // expose globally so page-specific scripts can use it
  window.__client = client;
});
