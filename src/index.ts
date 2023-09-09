import shadowTraffic from './shadow';

/// Env Variables Required.
export interface Env {
  SHADOW_BASE: string;
  PROD_BASE: string;
}

export default {
	async fetch(request: Request, env: Env, context: ExecutionContext) {
		const url = new URL(request.url);
		const urlParts = url.pathname + url.search + url.hash;
		const prodUrl = new URL(urlParts, env.PROD_BASE);

		try {
			const prodRequest = new Request(prodUrl, request);
			const shadowRequest = new Request(new URL(urlParts, env.SHADOW_BASE), request);

      // Note: we need to fetch here so we can re-use the body.
      //
      // If we fetch elsewhere, we'll get an error reconstructing a Request with a used body.
			let prodResponse = fetch(prodRequest);
			let shadowResponse = fetch(shadowRequest);

			// Kick this off in the background, don't block.
			// Make sure worker is alive even though we return a response.
			context.waitUntil(shadowTraffic(prodResponse, shadowResponse));

			return prodResponse;
		} catch (e) {
			// If any error at all occurs, just redirect to the production URL.
			//
			// This shouldn't happen in regular operation.
      //
      // NOTE: If you are using cloudflare for your domain. You can just use `context.passThroughOnException()` and remove the prodUrl.
			return Response.redirect(prodUrl.toString(), 307);
		}
	},
};
