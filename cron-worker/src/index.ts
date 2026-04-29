// Tiny standalone Cloudflare Worker that fires the release-day cleanup once
// daily. OpenNext's main worker (marginalia-label) only exports `fetch`, so
// we keep `scheduled` here and have it call the main worker's HTTP endpoint.

export interface Env {
  TARGET_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const run = async () => {
      const url = `${env.TARGET_URL}?secret=${encodeURIComponent(env.CRON_SECRET)}`;
      const res = await fetch(url, { method: 'GET' });
      const body = await res.text();
      console.log(
        `[cron] release-day → status=${res.status} body=${body.slice(0, 300)}`
      );
    };
    ctx.waitUntil(run());
  },
} satisfies ExportedHandler<Env>;
