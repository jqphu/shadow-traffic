# Shadow Traffic

This is a simple cloudflare worker to test staging environments on production workloads.

It samples production requests and sends it to a staging environment comparing the returned results. The actual result send to the client is always the response from the production environment.

The purpose is to test new deployments under real production workloads.

**This is ideal for stateless endpoints. Be cautious using this with stateful applications**


## How to use it

1. Modify `wrangler.toml` and set `PROD_BASE` to your production endpoint and `SHADOW_BASE` to your staging endpoint.

2. `bun run deploy` to deploy the Cloudflare Worker.

3. Modify the client requests to point to the Cloudflare Worker.

4. Run `bun run wrangler tail` to see the logs or view it in the UI. You will be able to see any difference in production requests and staging requests.

### Optional Configuration

`RATE` - Set this field to a value between 0-100 to represent the percentage of requests that will be shadowed. Setting this to 0 disables any shadowing at all.
`IGNORED_PATHS` - Set this to the paths you never want to shadow. Useful for stateful API endpoints.

---

Alternatively deploy below and change the env variables in the cloudflare ui.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jqphu/shadow-traffic)

## Design
- We use Cloudflare Workers to try to minimize the latency due to this proxy. They run on the edge and are incredibly lightweight. There shouldn't be any noticable latency increase.
- If RATE is set to 0 this will be almost identical to directing traffic directly to the PROD endpoint.

![Circuits Image](./circuits.png)
