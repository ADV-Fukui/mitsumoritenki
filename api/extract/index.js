const appInsights = require("applicationinsights");

const ALLOWED_DOMAIN = "ito-holding.co.jp";

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING && !appInsights.defaultClient) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING).start();
}

function getClientPrincipal(req) {
  const header = req.headers && req.headers["x-ms-client-principal"];
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
  } catch (e) {
    return null;
  }
}

module.exports = async function (context, req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.res = { status: 500, body: { error: "サーバーにAPIキーが設定されていません" } };
    return;
  }

  const principal = getClientPrincipal(req);
  const userDetails = (principal && principal.userDetails) || "";
  const domain = userDetails.split("@")[1]?.toLowerCase();

  if (!domain || domain !== ALLOWED_DOMAIN) {
    context.log.warn(`extract API: 許可されていないドメインからのアクセスを拒否 (userDetails=${userDetails || "不明"})`);
    context.res = { status: 403, body: { error: "このドメインからのアクセスは許可されていません" } };
    return;
  }

  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackEvent({
      name: "ExtractApiAccessed",
      properties: {
        app: "見積転記",
        userDetails,
        timestamp: new Date().toISOString()
      }
    });
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
