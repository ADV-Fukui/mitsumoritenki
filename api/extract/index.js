const { getVerifiedUserDetails } = require("../shared/auth");

module.exports = async function (context, req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.res = { status: 500, body: { error: "サーバーにAPIキーが設定されていません" } };
    return;
  }

  const userDetails = getVerifiedUserDetails(req);
  if (!userDetails) {
    context.log.warn("extract API: 許可されていないドメインからのアクセスを拒否");
    context.res = { status: 403, body: { error: "このドメインからのアクセスは許可されていません" } };
    return;
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(req.body)
    });
    const data = await resp.json();
    context.res = {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
      body: data
    };
  } catch (e) {
    context.res = { status: 500, body: { error: e.message } };
  }
};
