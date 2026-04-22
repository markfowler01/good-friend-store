import type { ISuggestion } from "@/models/Suggestion";
import Suggestion from "@/models/Suggestion";

/**
 * Forwards a suggestion into Zoho Projects as a task.
 *
 * To enable, set these env vars in `.env.local` (or Vercel):
 *   ZOHO_PROJECTS_CLIENT_ID
 *   ZOHO_PROJECTS_CLIENT_SECRET
 *   ZOHO_PROJECTS_REFRESH_TOKEN
 *   ZOHO_PROJECTS_PORTAL_ID
 *   ZOHO_PROJECTS_PROJECT_ID
 *   ZOHO_PROJECTS_DATA_CENTER  (default: "com" — use "eu", "in", "com.au" if your Zoho is there)
 *
 * If any of these are missing, this function returns silently (suggestion is still saved to MongoDB).
 */
export async function sendSuggestionToZoho(suggestion: ISuggestion) {
  const {
    ZOHO_PROJECTS_CLIENT_ID,
    ZOHO_PROJECTS_CLIENT_SECRET,
    ZOHO_PROJECTS_REFRESH_TOKEN,
    ZOHO_PROJECTS_PORTAL_ID,
    ZOHO_PROJECTS_PROJECT_ID,
    ZOHO_PROJECTS_DATA_CENTER = "com",
  } = process.env;

  if (
    !ZOHO_PROJECTS_CLIENT_ID ||
    !ZOHO_PROJECTS_CLIENT_SECRET ||
    !ZOHO_PROJECTS_REFRESH_TOKEN ||
    !ZOHO_PROJECTS_PORTAL_ID ||
    !ZOHO_PROJECTS_PROJECT_ID
  ) {
    console.warn("[suggestions] Zoho env not configured — skipping forward.");
    return;
  }

  // 1. Exchange refresh token for access token
  const tokenRes = await fetch(
    `https://accounts.zoho.${ZOHO_PROJECTS_DATA_CENTER}/oauth/v2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: ZOHO_PROJECTS_REFRESH_TOKEN,
        client_id: ZOHO_PROJECTS_CLIENT_ID,
        client_secret: ZOHO_PROJECTS_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
    }
  );

  if (!tokenRes.ok) {
    throw new Error(`Zoho token refresh failed: ${tokenRes.status}`);
  }
  const { access_token } = await tokenRes.json();

  // 2. Create task in Zoho Projects
  const description = [
    `**From:** ${suggestion.submittedBy || "Unknown"}`,
    suggestion.pageContext ? `**Page:** ${suggestion.pageContext}` : null,
    `**Date:** ${new Date(suggestion.createdAt).toLocaleString()}`,
    "",
    suggestion.text,
  ]
    .filter(Boolean)
    .join("\n");

  const taskName = suggestion.text.length > 80 ? suggestion.text.slice(0, 77) + "..." : suggestion.text;

  const taskRes = await fetch(
    `https://projectsapi.zoho.${ZOHO_PROJECTS_DATA_CENTER}/restapi/portal/${ZOHO_PROJECTS_PORTAL_ID}/projects/${ZOHO_PROJECTS_PROJECT_ID}/tasks/`,
    {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        name: taskName,
        description,
      }),
    }
  );

  if (!taskRes.ok) {
    const body = await taskRes.text();
    throw new Error(`Zoho task create failed: ${taskRes.status} ${body}`);
  }

  const data = await taskRes.json();
  const taskId = data?.tasks?.[0]?.id_string || data?.tasks?.[0]?.id;

  if (taskId) {
    await Suggestion.findByIdAndUpdate(suggestion._id, { zohoTaskId: String(taskId) });
  }
}
