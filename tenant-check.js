(async () => {
  const ALLOWED_DOMAIN = 'ito-holding.co.jp';
 
  try {
    const res = await fetch('/.auth/me');
    if (!res.ok) { window.location.href = '/unauthorized.html'; return; }
 
    const data = await res.json();
    const principal = data.clientPrincipal;
    if (!principal) return;
 
    const email = principal.userDetails || '';
    const domain = email.split('@')[1]?.toLowerCase();
 
    if (!domain || domain !== ALLOWED_DOMAIN) {
      await fetch('/.auth/logout');
      window.location.href = '/unauthorized.html';
    }
  } catch (e) {
    console.warn('tenant-check:', e);
  }
})();
 
