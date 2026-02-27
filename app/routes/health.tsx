const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  return new Response(JSON.stringify(data), { ...init, headers });
};

const PROCESS_STARTED_AT = new Date().toISOString();

function pickEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value;
  }
  return null;
}

export async function loader() {
  const gitCommit = pickEnv(
    "RAILWAY_GIT_COMMIT_SHA",
    "SOURCE_VERSION",
    "VERCEL_GIT_COMMIT_SHA",
    "GIT_COMMIT",
    "COMMIT_SHA"
  );
  const gitBranch = pickEnv("RAILWAY_GIT_BRANCH", "GIT_BRANCH");
  const buildTime = pickEnv("BUILD_TIME", "RAILWAY_DEPLOYMENT_CREATED_AT");
  const service = pickEnv("RAILWAY_SERVICE_NAME");
  const deploymentId = pickEnv("RAILWAY_DEPLOYMENT_ID");
  const adminTokenOverride = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN_OVERRIDE ?? "").trim();
  const fingerprint =
    (gitCommit && `commit:${gitCommit}`) ||
    (buildTime && `build_time:${buildTime}`) ||
    (deploymentId && `deployment:${deploymentId}`) ||
    `process_started:${PROCESS_STARTED_AT}`;
  const fingerprintSource =
    (gitCommit && "commit") ||
    (buildTime && "build_time") ||
    (deploymentId && "deployment_id") ||
    "process_started";

  return json({
    ok: true,
    timestamp: new Date().toISOString(),
    fingerprint,
    fingerprint_source: fingerprintSource,
    app_url: process.env.SHOPIFY_APP_URL ?? process.env.APP_URL ?? null,
    build: {
      commit: gitCommit,
      branch: gitBranch,
      time: buildTime,
      service,
      deployment_id: deploymentId,
      has_admin_token_override: Boolean(adminTokenOverride),
      admin_token_override_prefix: adminTokenOverride
        ? adminTokenOverride.slice(0, 6)
        : null,
    },
  });
}
