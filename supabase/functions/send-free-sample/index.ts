import { createClient } from "npm:@supabase/supabase-js@2.58.0";

// Edge function: sends free sample email via Resend
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FROM_EMAIL = "In Him Daily <onboarding@resend.dev>";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function getResendApiKey(): Promise<string> {
  if (!supabaseUrl || !supabaseServiceKey) return "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "RESEND_API_KEY")
    .maybeSingle();
  if (error || !data) return "";
  return data.value;
}

interface RequestBody {
  first_name: string;
  email: string;
  source: "homepage_cta" | "free_sample_page";
  country?: string;
  city_region?: string;
}

function buildEmailHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Free 7-Day Sample — In Him Daily</title>
</head>
<body style="margin:0;padding:0;background-color:#0E2035;font-family:Georgia,'Times New Roman',serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0E2035;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#13294a;border:1px solid rgba(228,184,106,0.2);border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:48px 40px 32px;background:linear-gradient(180deg,rgba(201,152,58,0.08) 0%,transparent 100%);">
              <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9983A;font-weight:bold;margin:0 0 16px 0;">In Him Daily</p>
              <h1 style="font-size:28px;color:#ffffff;margin:0 0 8px 0;font-weight:bold;">Your Free 7-Day Sample</h1>
              <p style="font-size:16px;color:rgba(255,255,255,0.6);margin:0;font-style:italic;">Every generation. Every day. In Him.</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <p style="font-size:17px;color:rgba(255,255,255,0.85);line-height:1.6;margin:0 0 16px 0;">Dear ${firstName},</p>
              <p style="font-size:16px;color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 16px 0;">
                Thank you for requesting your free 7-day sample of <em>In Him Daily</em>. Over the next seven days, you and your family will encounter Jesus through the same scripture — written in three voices for adults, teens, and children.
              </p>
              <p style="font-size:16px;color:rgba(255,255,255,0.7);line-height:1.7;margin:0 0 16px 0;">
                Each day includes a key verse, a devotional reading, reflection questions, a prayer, and a daily confession. Read the edition that fits you — or read all three and share the conversation at your dinner table.
              </p>
            </td>
          </tr>

          <!-- Day 1 Preview -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
                <tr>
                  <td style="padding:28px 32px;">
                    <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9983A;font-weight:bold;margin:0 0 12px 0;">Day 1 — The Word</p>
                    <p style="font-size:18px;color:rgba(255,255,255,0.9);font-style:italic;line-height:1.5;margin:0 0 8px 0;">"In the beginning was the Word, and the Word was with God, and the Word was God."</p>
                    <p style="font-size:14px;color:#C9983A;font-weight:bold;margin:0 0 20px 0;">John 1:1</p>
                    <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0 0 16px 0;">
                      The opening words of John's Gospel are among the most profound in all of Scripture. Before time began, before creation burst into existence — the Word already was. And that Word became flesh and dwelt among us.
                    </p>
                    <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;margin:0;">
                      This is the Jesus you will encounter over the next seven days. Not a concept. Not a principle. A Person.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Three Editions -->
          <tr>
            <td style="padding:0 40px 24px 40px;">
              <p style="font-size:13px;color:#C9983A;font-weight:bold;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 16px 0;">Three Editions, One Scripture</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding:16px;background-color:rgba(201,152,58,0.08);border-radius:10px;text-align:center;">
                    <p style="font-size:14px;color:#C9983A;font-weight:bold;margin:0 0 6px 0;">Adult</p>
                    <p style="font-size:12px;color:rgba(255,255,255,0.55);margin:0;">Theological depth & life application</p>
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="padding:16px;background-color:rgba(201,152,58,0.08);border-radius:10px;text-align:center;">
                    <p style="font-size:14px;color:#C9983A;font-weight:bold;margin:0 0 6px 0;">Teen</p>
                    <p style="font-size:12px;color:rgba(255,255,255,0.55);margin:0;">Real-life scenarios & honest questions</p>
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="padding:16px;background-color:rgba(201,152,58,0.08);border-radius:10px;text-align:center;">
                    <p style="font-size:14px;color:#C9983A;font-weight:bold;margin:0 0 6px 0;">Children</p>
                    <p style="font-size:12px;color:rgba(255,255,255,0.55);margin:0;">Simple language & fun activities</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 40px 40px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#C9983A;border-radius:30px;padding:16px 40px;">
                    <a href="https://inhimdaily.org/devotionals" style="font-size:15px;color:#0E2035;text-decoration:none;font-weight:bold;">Read Today's Devotional</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Scripture -->
          <tr>
            <td align="center" style="padding:0 40px 40px 40px;">
              <div style="border-top:1px solid rgba(228,184,106,0.2);padding-top:24px;">
                <p style="font-size:22px;color:rgba(255,255,255,0.9);font-style:italic;line-height:1.4;margin:0 0 8px 0;">"For you died, and your life is now hidden with Christ in God."</p>
                <p style="font-size:11px;color:#C9983A;font-weight:bold;letter-spacing:0.16em;text-transform:uppercase;margin:0;">Colossians 3:3</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:0 40px 32px 40px;">
              <p style="font-size:12px;color:rgba(255,255,255,0.35);line-height:1.5;margin:0;">
                In Him Daily — a ministry of Epic True North<br/>
                You received this email because you requested a free sample.<br/>
                <a href="https://inhimdaily.org" style="color:rgba(201,152,58,0.6);text-decoration:none;">inhimdaily.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    if (!body.first_name || !body.email) {
      return new Response(
        JSON.stringify({ error: "First name and email are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Save the lead to the database using the service role key (bypasses RLS)
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: dbError } = await supabase.from("free_sample_leads").insert({
        first_name: body.first_name,
        email: body.email,
        source: body.source,
        country: body.country ?? null,
        city_region: body.city_region ?? null,
      });

      if (dbError) {
        // Duplicate email is fine — still send the email
        if (dbError.code !== "23505") {
          console.error("Database error:", dbError.message);
        }
      }
    }

    // Attempt to send the email via Resend — but always return success
    // so the visitor sees confirmation even if the email service is not yet configured.
    const RESEND_API_KEY = await getResendApiKey();

    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [body.email],
            subject: "Your Free 7-Day Sample — In Him Daily",
            html: buildEmailHtml(body.first_name),
          }),
        });

        if (!emailResponse.ok) {
          const errorBody = await emailResponse.json().catch(() => null);
          console.error("Resend API error:", JSON.stringify(errorBody));
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    } else {
      console.error("RESEND_API_KEY is not configured — lead saved, email skipped");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Your request has been received." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
