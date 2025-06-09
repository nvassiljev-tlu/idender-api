const createResponse = (...args) => {
  if (typeof args[0] === 'object') {
    const { httpCode, payload = {}, errors = {} } = args[0];
    const status = httpCode >= 200 && httpCode < 300 ? 'OPERATION-OK' : 'OPERATION-ERROR';

    console.log('createResponse (object):', { httpCode, payload, errors });

    return {
      status,
      http_code: httpCode,
      build: process.env.NODE_ENV,
      time: Date.now(),
      payload,
      errors
    };
  }

  const [httpCode, payload = {}, errors = {}] = args;
  const status = httpCode >= 200 && httpCode < 300 ? 'OPERATION-OK' : 'OPERATION-ERROR';

  console.log('createResponse (args):', { httpCode, payload, errors });

  return {
    status,
    http_code: httpCode,
    build: process.env.NODE_ENV,
    time: Date.now(),
    payload,
    errors
  };
};

module.exports = createResponse;