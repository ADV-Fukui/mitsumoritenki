(async () => {
  const ALLOWED_TENANT_ID = 'f36ce7ad-3d82-4f7f-b171-6aae3f7713dd';

  try {
    const res = await fetch('/.auth/me');
    if (!res.ok) {
      window.location.href = '/unauthorized.html';
      return;
    }
    const data = await res.json();
    const principal = data.clientPrincipal;

    // 未ログインはそのまま（staticwebapp.config.jsonのroutesがリダイレクトする）
    if (!principal) return;

    const claims = principal.claims || [];
    const tid = claims.find(c => c.typ === 'tid')?.val;

    if (!tid || tid !== ALLOWED_TENANT_ID) {
      // 他テナントのアカウント → ログアウトして拒否ページへ
      await fetch('/.auth/logout');
      window.location.href = '/unauthorized.html';
    }
  } catch (e) {
    // /.auth/me が取れない環境（ローカル開発など）はスルー
    console.warn('tenant-check: could not reach /.auth/me', e);
  }
})();
