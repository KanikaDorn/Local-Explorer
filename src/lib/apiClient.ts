import supabaseBrowser from "./supabaseClient";

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };

  try {
    // Try to attach user-id from Supabase client session
    // supabase.auth.getUser() returns { data: { user } }
    const userResp = await supabaseBrowser.auth.getUser();
    const user = (userResp as any)?.data?.user;
    if (user && user.id) {
      headers["user-id"] = user.id;
    }

    // Also attach bearer token so APIs that expect Authorization still work
    const sessionResp = await supabaseBrowser.auth.getSession();
    const accessToken = (sessionResp as any)?.data?.session?.access_token;
    if (accessToken && !headers["authorization"]) {
      headers["authorization"] = `Bearer ${accessToken}`;
    }
  } catch (err) {
    // ignore; proceed without user-id
  }

  const res = await fetch(input, {
    ...init,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export default apiFetch;
