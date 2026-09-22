const { getVerifiedUserDetails } = require("../shared/auth");
const { trackEvent } = require("../shared/telemetry");

// 「AI読み取り開始」ボタン押下の回数を数えるための計測専用エンドポイント。
// extract側はPDFのチャンク数だけ呼ばれるため、そちらではボタン押下回数を数えられない。
module.exports = async function (context, req) {
  const userDetails = getVerifiedUserDetails(req);
  if (!userDetails) {
    context.res = { status: 403 };
    return;
  }

  await trackEvent("ExtractStarted", {
    app: "見積転記",
    userDetails,
    timestamp: new Date().toISOString()
  });

  context.res = { status: 204 };
};
