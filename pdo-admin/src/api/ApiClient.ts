import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
axios.defaults.timeout = 17000;
const abortTimeout = 17000;

const initmetadata = {
  DEFAULT_LIMIT: 5,
  DEFAULT_PAGE: 1,
  DEFAULT_ORDER: 'oldest',
};

export const serverErrorResponse = {
  TOKEN_REQUIRED: 'token required',
};

type headersType = {
  'Content-Type': 'application/x-www-form-urlencoded';
  followRedirects?: boolean;
  authorization?: string;
};

export class ApiClient {
  private backendUrl: string;
  private headers: headersType | {};
  private authToken: string;

  constructor() {
    this.backendUrl = process.env.REACT_APP_API_BASE_URL || '';

    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    this.authToken = '';
    console.log('APiCLient created');
  }

  // private createClient(
  //   params: object = {
  //     page: initmetadata.DEFAULT_PAGE,
  //     limit: initmetadata.DEFAULT_LIMIT,
  //     order: initmetadata.DEFAULT_ORDER,
  //   }
  // ): AxiosInstance {
  //   const config: AxiosRequestConfig = {
  //     baseURL: this.backendUrl, //this.backendUrl,
  //     headers: this.headers,
  //     params: params,
  //   };

  //   if (this.authToken.length > 0) {
  //     config.headers = {
  //       Authorization: `Bearer ${this.authToken}`,
  //     };
  //   }
  //   console.log('axios config: ', config);
  //   return axios.create(config);
  // }

  private setAxiosConfig(
    params: object = {
      page: initmetadata.DEFAULT_PAGE,
      limit: initmetadata.DEFAULT_LIMIT,
      order: initmetadata.DEFAULT_ORDER,
      productName: "HALLOUMI"
    }
  ): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      baseURL: this.backendUrl, //this.backendUrl,
      headers: this.headers,
      params: params,
    };

    if (this.authToken.length > 0) {
      config.headers = {
        Authorization: `Bearer ${this.authToken}`,
      };
    }
    console.log('axios config: ', config);
    return config;
  }

  private handleError(err: unknown) {
    const error = err as Error | AxiosError;
    if (!axios.isAxiosError(error)) {
      throw new Error(error.message);
    }
    if (error.response?.data.detail) 
      if (
      error.response?.data.detail === 'jwt expired' ||
      error.response?.data.detail === 'bearer token needed'
      ) {
      console.error(error.response?.data.detail);
      throw new Error('token required');
      }
      else {
        console.error(error.response?.data.detail);
        if (Array.isArray(error.response?.data.detail))
        throw new Error(error.response?.data.detail[0]);
        else {
          throw new Error(error.response?.data.detail)
        }
      }
    if (error.message === 'canceled' || error.code === 'ECONNABORTED') {
      console.error(error);
      throw new Error('It is taking too long to get a reply.');
    }
    if (error.message === 'Network Error') {
      console.error(error);
      throw new Error('There is no network connection.');
    } else {
      console.error(error);
      throw new Error('Server error: ' + error.response?.statusText);
    }
  }

  public async get(
    endpoint: string = '',
    params?: object
    // signal: AbortSignal = AbortSignal.timeout(5000)
  ) {
    console.log('get endpoint: ', endpoint);
    try {
      // const client = this.createClient(params);
      const axiosconfig = this.setAxiosConfig(params);
      axiosconfig.signal = AbortSignal.timeout(abortTimeout);
      // const response = await axios.get(endpoint, { signal });
      const response = await axios.get(endpoint, axiosconfig);
      console.log('GET API CLIENT response: ', response);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  public async fetch(
    documentId: string,
    eventId: string
    // signal: AbortSignal = AbortSignal.timeout(5000)
  ) {
    
    
      let result;
      try {
        result=await fetch(`${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_DECRYPT_DOC_ENDPOINT}?documentId=${documentId}&eventId=${eventId}`,
          {headers: {Authorization:  'Bearer ' + this.authToken}}
         );
         
    
        } catch (error) {
          console.log('fetch error->'+error);
          this.handleError(error);
        }
    
        if (result && !result.ok) {
         console.log('fetch error->'+JSON.stringify(await result.json()));
         this.handleError(new Error('fetch error'));
        }
        if (result && result.ok ) {
          return await result.arrayBuffer();
        } 
        this.handleError(new Error('unknown fetch error'));
     
   
  }

  public async post(endpoint: string = '', data?: object) {
    try {
      const axiosconfig = this.setAxiosConfig({});
      axiosconfig.signal = AbortSignal.timeout(abortTimeout);
      const response = await axios.post(endpoint, data, axiosconfig);
      console.log('API CLIENT POST response: ', response);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async patch(endpoint: string = '', data?: object) {
    try {
      const axiosconfig = this.setAxiosConfig({});
      axiosconfig.signal = AbortSignal.timeout(abortTimeout);
      const response = await axios.patch(endpoint, data, axiosconfig);
      console.log('API CLIENT POST response: ', response);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async put(endpoint: string = '') {
    try {
      // const client = this.createClient({});
      // const response = await client.put(endpoint, { signal });
      const axiosconfig = this.setAxiosConfig({});
      axiosconfig.signal = AbortSignal.timeout(abortTimeout);
      const response = await axios.put(endpoint, axiosconfig);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async delete(endpoint: string = '') {
    try {
      // const client = this.createClient({});
      // const response = await client.delete(endpoint, { signal });
      const axiosconfig = this.setAxiosConfig({});
      axiosconfig.signal = AbortSignal.timeout(abortTimeout);
      const response = await axios.delete(endpoint, axiosconfig);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public setAuthToken(authToken: string) {
    this.authToken = authToken;
    console.log('this.authToken: ', this.authToken);
  }

  // public setBackendUrl(url: string) {
  //   this.backendUrl = url;
  //   console.log('this.backendUrl: ', this.backendUrl);
  // }
}
