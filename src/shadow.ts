const shadowTraffic = async (
	originalResponse: Response,
	shadowResponsePromise: Promise<Response>
) => {
	const shadowResponse = await shadowResponsePromise;
	if (originalResponse.status != shadowResponse.status) {
		console.warn(`Expected Status {originalResponse.status}, Shadow Found {shadowResponse.status}`);
		return;
	}

	const contentType = originalResponse.headers.get('content-type');
	let originalBody;
	let shadowBody;

	if (contentType == 'application/json') {
		originalBody = JSON.stringify(await originalResponse.json());
		shadowBody = JSON.stringify(await shadowResponse.json());
	} else if (contentType == 'text/plain') {
		originalBody = await originalResponse.text();
		shadowBody = await shadowResponse.text();
	} else {
		// No/Unknown body.
		return;
	}

	if (originalBody != shadowBody) {
		console.warn(`Body returned different results: Original '{originalBody}', Shadow '{shadowBody}'`);
	}
};

export default shadowTraffic;
