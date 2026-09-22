const appInsights = require("applicationinsights");

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING && !appInsights.defaultClient) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING).start();
}

async function trackEvent(name, properties) {
  if (!appInsights.defaultClient) return;
  appInsights.defaultClient.trackEvent({ name, properties });
  // Azure Functionsはレスポンス返却後にプロセスが一時停止されることがあり、
  // SDKの内部バッチ送信(既定15秒間隔)を待たずに記録が失われる場合があるため、
  // flushで送信完了を待つ。
  await new Promise((resolve) => appInsights.defaultClient.flush({ callback: resolve }));
}

module.exports = { trackEvent };
