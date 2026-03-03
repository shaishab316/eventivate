export const verifyEmailTemplate = ({
  verificationLink,
  otp,
  firstName,
}: {
  verificationLink: string;
  otp: string;
  firstName: string;
}) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #f6f5fb;
      font-family: Georgia, 'Times New Roman', serif;
      color: #111214;
      padding: 36px 14px;
    }

    .wrapper {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e9e6f2;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 34px rgba(16, 10, 30, 0.08);
    }

    /* Match your screenshot: soft green -> light gray header, no logo */
    .header {
      padding: 26px 34px;
      background: linear-gradient(180deg, #dfeee6 0%, #cfd6d9 55%, #c7cdd0 100%);
      border-bottom: 1px solid #e7e7ee;
    }

    .header-title {
      font-size: 13px;
      font-weight: 600;
      color: rgba(10, 12, 14, 0.55);
      letter-spacing: 0.02em;
    }

    .body {
      padding: 34px;
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.015em;
      margin-bottom: 10px;
      color: #15161a;
    }

    .sub {
      font-size: 14px;
      color: #4f4f57;
      line-height: 1.75;
      margin-bottom: 18px;
    }

    .card {
      border: 1px solid #eceaf4;
      border-radius: 12px;
      background: #fbfaff;
      padding: 18px;
      margin: 16px 0 22px;
    }

    .otp-label {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #8a8896;
      margin-bottom: 10px;
      text-align: center;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      font-weight: 600;
    }

    .otp {
      text-align: center;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-weight: 800;
      font-size: 34px;
      letter-spacing: 0.28em;
      color: #141414;
      padding: 14px 12px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px dashed #d8d3ea;
    }

    .note {
      margin-top: 10px;
      font-size: 12px;
      color: #6b6b75;
      text-align: center;
      line-height: 1.6;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    }

    .btn {
      display: block;
      width: 100%;
      padding: 14px 16px;
      margin-top: 14px;
      border-radius: 12px;
      text-align: center;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      letter-spacing: 0.10em;
      text-transform: uppercase;

      /* Match screenshot: dark button with blue text */
      background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
      border: 1px solid rgba(0,0,0,0.35);
      color: #2f7dff;
    }

    .divider {
      border: none;
      border-top: 1px solid #efeef6;
      margin: 22px 0;
    }

    .fallback {
      font-size: 12px;
      color: #6b6b75;
      line-height: 1.7;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    }
    .fallback a {
      color: #1a1a1a;
      word-break: break-all;
      text-decoration: underline;
    }

    .footer {
      padding: 18px 34px 26px;
      border-top: 1px solid #f0eef7;
      background: #fcfbff;
      text-align: center;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
    }

    .footer p {
      font-size: 11px;
      color: #8b8b97;
      letter-spacing: 0.03em;
      line-height: 1.6;
    }

    .tiny {
      margin-top: 10px;
      font-size: 10px;
      color: #9a9aa6;
    }
  </style>
</head>

<body>
  <div class="wrapper">
    <div class="header">
      <h1>Ancora</h1>
      <div class="header-title">Your family story, connected.</div>
    </div>

    <div class="body">
      <h1>Confirm it’s really you</h1>

      <p class="sub">
        Hi ${firstName},<br/>
        Use the one-time code below to verify your email and start building your family tree.
      </p>

      <div class="card">
        <div class="otp-label">Your verification code</div>
        <div class="otp">${otp}</div>
        <div class="note">This code expires in 5 minutes.</div>

        <a href="${verificationLink}" class="btn">Verify Email</a>
      </div>

      <hr class="divider" />

      <p class="fallback">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${verificationLink}">${verificationLink}</a>
      </p>
    </div>

    <div class="footer">
      <p>If you didn’t request this, you can safely ignore it.</p>
      <p class="tiny">Tip: Never share your verification code with anyone.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
