// A tiny wrapper around fetch(), borrowed from
// https://kentcdodds.com/blog/replace-axios-with-a-simple-custom-fetch-wrapper

interface IData {
  body?: BodyInit | undefined;
  customConfig?: {} | unknown | undefined;
  method?: string;
  headers?: {} | undefined;
}

export async function client(endpoint: string, {body, ...customConfig}: IData = {}) {
  // const headers: {} = {'Content-Type': 'application/json'};
  let headers: {} = {'Content-Type': 'application/x-www-form-urlencoded'};
  // if (customConfig?.headers && customConfig?.headers !== headers)  {
  //   headers = customConfig?.headers
  // }
  const config: IData = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig?.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }
  console.log('api client config : ', config);
  let data: unknown;
  try {
    const response = await window.fetch(endpoint, config);

    data = await response.json();

    console.log('api client data: ', data);
    if (response.ok) {
      // Return a result object similar to Axios
      return {
        status: response.status,
        data,
        headers: response.headers,
        url: response.url,
      };
    }
    throw new Error(response.statusText);
  } catch (err: unknown) {
    return err instanceof Error
      ? Promise.reject(err.message ? err.message : data)
      : Promise.reject(err);
  }
}

client.get = function (endpoint: string, customConfig = {}) {
  return client(endpoint, {...customConfig, method: 'GET'});
};

client.post = function (endpoint: string, body: string, customConfig = {}) {
  return client(endpoint, {...customConfig, body});
};
