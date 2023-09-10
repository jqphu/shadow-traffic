import shadowTraffic from './shadow';

/// Env Variables Required.
export interface Env {
	SHADOW_BASE: string;
	PROD_BASE: string;
  /// Percentage to be mirrored. 
  ///
  /// Number from 0-100.
  RATE: number;
}

export default {
	async fetch(request: Request, env: Env, context: ExecutionContext) {

    // Requests that should be mirrored. 
    if (!env.RATE || (Math.random() * 100) > env.RATE) {
      return fetch(request);
    }

		const url = new URL(request.url);
		const urlParts = url.pathname + url.search + url.hash;
		const prodUrl = new URL(urlParts, env.PROD_BASE);

		try {
			const prodRequest = new Request(prodUrl, request.clone());
			const shadowRequest = new Request(new URL(urlParts, env.SHADOW_BASE), request);

			// Note: we need to fetch here so we can re-use the body.
			//
			// If we fetch elsewhere, we'll get an error reconstructing a Request with a used body.
			//
      // TODO(jqphu): We need to wait for the prod request to complete. If we
      // don't await here and try to return the response. The worker fails as
      // it tries to read the body after the response has already been sent.
			let shadowResponse = fetch(shadowRequest);
			let prodResponse = await fetch(prodRequest);

			// Kick this off in the background, don't block.
			// Make sure worker is alive even though we return a response.
			//
      // TODO(jqphu): cloning the response here is going to be paid for every
      // request. Probably need to benchmark this if we are sending a lot of
      // data.
			context.waitUntil(shadowTraffic(prodResponse.clone(), shadowResponse));

			return prodResponse;
		} catch (e) {
			// If any error at all occurs, just redirect to the production URL.
			//
			// This shouldn't happen in regular operation.
			//
      // NOTE: If you are using cloudflare for your domain. You can just use
      // `context.passThroughOnException()` and remove the prodUrl.
			return Response.redirect(prodUrl.toString(), 307);
		}
	},
};
