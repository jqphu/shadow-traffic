export default {
	async fetch(request: Request) {
		const url = new URL(request.url);
		const prodRequest = new Request(
			new URL(url.pathname + url.search + url.hash, 'https://api.pocketnode.app'),
			request
		);

		return fetch(prodRequest);
	},
};
