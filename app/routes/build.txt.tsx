const PROCESS_STARTED_AT = new Date().toISOString();

function pickEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value;
  }
  return null;
}

export async function loader() {
  const commit = pickEnv(
    "RAILWAY_GIT_COMMIT_SHA",
    "SOURCE_VERSION",
    "VERCEL_GIT_COMMIT_SHA",
    "GIT_COMMIT",
    "COMMIT_SHA"
  );
  const buildTime = pickEnv("BUILD_TIME", "RAILWAY_DEPLOYMENT_CREATED_AT");
  const deploymentId = pickEnv("RAILWAY_DEPLOYMENT_ID");
  const branch = pickEnv("RAILWAY_GIT_BRANCH", "GIT_BRANCH");

  const fingerprint =
    (commit && `commit:${commit}`) ||
    (buildTime && `build_time:${buildTime}`) ||
    (deploymentId && `deployment:${deploymentId}`) ||
    `process_started:${PROCESS_STARTED_AT}`;

  const body = [
    `fingerprint=${fingerprint}`,
    `commit=${commit ?? ""}`,
    `build_time=${buildTime ?? ""}`,
    `branch=${branch ?? ""}`,
    `deployment_id=${deploymentId ?? ""}`,
    `timestamp=${new Date().toISOString()}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

