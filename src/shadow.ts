const shadowTraffic = async (originalResponsePromise: Promise<Response>, shadowResponsePromise: Promise<Response>) => {
  const [originalResponse, shadowResponse] = await Promise.all([originalResponsePromise, shadowResponsePromise]);

  console.log(originalResponse, shadowResponse);

};

export default shadowTraffic;
