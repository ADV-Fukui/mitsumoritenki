const ALLOWED_DOMAIN = "ito-holding.co.jp";

function getClientPrincipal(req) {
  const header = req.headers && req.headers["x-ms-client-principal"];
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
  } catch (e) {
    return null;
  }
}

// ドメイン検証を通過した場合のみuserDetails(メールアドレス)を返す。それ以外はnull。
function getVerifiedUserDetails(req) {
  const principal = getClientPrincipal(req);
  const userDetails = (principal && principal.userDetails) || "";
  const domain = userDetails.split("@")[1]?.toLowerCase();
  return domain === ALLOWED_DOMAIN ? userDetails : null;
}

module.exports = { ALLOWED_DOMAIN, getVerifiedUserDetails };
