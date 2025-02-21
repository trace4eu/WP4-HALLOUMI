import { IIssuePreAuthVC, IVCIssueData } from '../components/IssueVCForm';
import { ApiClient } from './ApiClient';

export type metadaOrderType = 'oldest' | 'newest';

export type getVCsParamsType = {
  page: number;
  limit: number;
  order?: metadaOrderType; // paramsOrderType;
  productName: string;
};

export type getEventsParmsType = {
  status:string
};


export type getTnTEventsParmsType = {
  documentId:string;
  eventId:string
};

export type metadataType = {
  total: number;
  pageNumber: number;
  totalPages: number;
};

export type accrAsType = 'TAO' | 'TI';

type reqAccreditParamsType = {
  accrAs: accrAsType;
  taoURL: string;
  preAuthCode: string;
};

export type PIN_TYPE = 'onboard' | 'accrTao' | 'accrTi';

class AdminApiService extends ApiClient {
  constructor() {
    console.log('AdminService created');
    super();
  }
  async toLogin(email: string, password: string) {
    const loginResponse = await this.post(process.env.REACT_APP_API_LOGIN_ENDPOINT, {
      email,
      password,
    });
    console.log('loginResponse: ', loginResponse);
    if (loginResponse.token) {
      this.setAuthToken(loginResponse.token);
    }
    return loginResponse as {message:string; name:string};
  }

  async getProfile() {
    const profile = await this.get(process.env.REACT_APP_GETPROFILE_ENDPOINT, {});
    console.log('Profile: ', profile);
    // this.setBackendUrl = profile.BackEndUrl;
    return profile;
  }


  async getProducts() {
    const products = await this.get(process.env.REACT_APP_GETPRODUCTS_ENDPOINT, {});
    console.log('Profile: ', products);
    // this.setBackendUrl = profile.BackEndUrl;
    return products;
  }

  async getProduct(parms:{productName:string}) {
    const product = await this.get(process.env.REACT_APP_GETPRODUCTS_ENDPOINT, parms);
    console.log('product: ', product);
    // this.setBackendUrl = profile.BackEndUrl;
    return product;
  }


  async getBatches(parms: {productName:string; status:string}) {
    if (parms.status=='pending') {
    const batches = await this.get(process.env.REACT_APP_GET_PENDING_BATCHES_ENDPOINT, {productName:parms.productName});
    console.log('pending batches: ', batches);
    
    // this.setBackendUrl = profile.BackEndUrl;
    return batches;
    } else  if (parms.status=='completed') {
      const batches = await this.get(process.env.REACT_APP_GET_COMPLETED_BATCHES_ENDPOINT, {productName:parms.productName});
      console.log('completed batches: ', batches);
      
      // this.setBackendUrl = profile.BackEndUrl;
      return batches;
      } 
  }

  async addProduct(data: object) {
    const addproductResp = await this.post(process.env.REACT_ADD_PRODUCT_ENDPOINT, data);
    console.log(' add product POST Resp');
    console.log('addproductResp: ', addproductResp);
    return addproductResp as {success:string; errors:string[]|undefined}
  }

  async updateProduct(data: object) {
    const updateproductResp = await this.patch(process.env.REACT_UPDATE_PRODUCT_ENDPOINT, data);
    console.log(' updateProduct POST Resp');
    console.log('updateProduct: ', updateproductResp);
    return updateproductResp as {success:string; errors:string[]|undefined}
  }


  async getAllowedEvents(parms?: {productName:string}) {
    const allowedEvents = await this.get(process.env.REACT_APP_GETPRODUCTS_ENDPOINT, parms);
    console.log('allowedEvents: ', allowedEvents);
    // this.setBackendUrl = profile.BackEndUrl;
    return allowedEvents;
  }


  async getPendingVCs(params?: getVCsParamsType) {
    const credentials = await this.get(process.env.REACT_APP_DEFFERED_ENDPOINT, params);
    console.log(' getPendingVCs');
    console.log(' credentials: ', credentials);
    return credentials;
  }

  async getEvents(params?: getEventsParmsType) {
    const events = await this.get(process.env.REACT_APP_EVENTS_ENDPOINT, params);
    console.log(' getEventss');
    console.log(' events: ', events);
    return {metadata: {}, data: events};
  }

  async getTnTEvent(params?: getTnTEventsParmsType) {
    const event = await this.get(process.env.REACT_APP_TNT_EVENT_ENDPOINT, params);
    console.log(' getTnTEvent');
    console.log(' event: ', event);
    return event
  }

  async getVerified(params?: getTnTEventsParmsType):Promise<object> {
    const response = await this.get(process.env.REACT_APP_GETVERIFIED_ENDPOINT, params);
    console.log(' getverified');

    return response
    
  }

  async decryptPersonalData(params?: getTnTEventsParmsType):Promise<object> {
    const response = await this.get(process.env.REACT_APP_PERSONAL_ENDPOINT, params);
    console.log(' getpersonal');
   
    return response
    
  }

  async updateEvent(params?: getTnTEventsParmsType) {
    const response = await this.patch(process.env.REACT_APP_UPDATE_EVENT_ENDPOINT, params);
    console.log(' updatevent');
   
    return response
    
  }

  async decryptdocfetch(params: getTnTEventsParmsType):Promise<ArrayBuffer|null> {

   
   
      const buffer=await this.fetch(params?.documentId,params.eventId );
       if (buffer) return buffer
       else return null;
  
      
    
    
  }

  async addVerifyEvent(data: object) {
    const addverifyResp = await this.post(process.env.REACT_APP_VERIFY_ENDPOINT, data);
    console.log(' add verify event POST Resp');
    console.log('issueResp: ', addverifyResp);
    return addverifyResp as {success:string; errors:string[]|undefined}
  }

  async getUserDataDetails(id: string) {
    const userdata = await this.get(`${process.env.REACT_APP_USERDATA_ENDPOINT}/${id}`, {});
    console.log(' getUserDataDetails');
    console.log(' user data details : ', userdata);
    return userdata;
  }

  async getSubmittedVCs(params?: getVCsParamsType) {
    const credentials = await this.get(process.env.REACT_APP_SUBMITTED_ENDPOINT, params);
    console.log(' getPendingVCs');
    console.log(' credentials: ', credentials);
    return credentials;
  }

  async getSubmittedVCDetails(id: string) {
    const credential = await this.get(
      `${process.env.REACT_APP_SUBMITTED_DETAILS_ENDPOINT}/${id}`,
      {}
    );
    console.log(' getSubmittedVCDetail');
    console.log(' submitted vc details : ', credential);
    return credential;
  }

  async getIssuedVCs(params?: getVCsParamsType) {
    const credentials = await this.get(process.env.REACT_APP_ISSUED_ENDPOINT, params);
    console.log(' getIssuedVCs');
    console.log(' credentials: ', credentials);
    return credentials;
  }

  async getIssuedVCDetails(id: string) {
    const credential = await this.get(`${process.env.REACT_APP_ISSUED_DETAILS_ENDPOINT}/${id}`, {});
    console.log(' getIssuedVC');
    console.log(' credentials: ', credential);
    return credential;
  }

  async putUnissueVC(id: string) {
    const unissueResp = await this.put(`${process.env.REACT_APP_UNISSUE_ENDPOINT}/${id}`);
    console.log(' unissue VC PUT Resp');
    console.log('unissueResp: ', unissueResp);
    return unissueResp;
  }

  async issueVC(data: IIssuePreAuthVC) {
    const issueResp = await this.get(process.env.REACT_APP_ISSUE_ENDPOINT, data);
    console.log(' issue VC Resp');
    console.log('issueResp: ', issueResp);
    return issueResp;
  }

  async issueVCform(data: IVCIssueData) {
    const issueResp = await this.get(process.env.REACT_APP_ISSUE_ENDPOINT, data);
    console.log(' issue VC Resp');
    console.log('issueResp: ', issueResp);
    return issueResp;
  }
  async deleteVC(id: string) {
    const deleteResp = await this.delete(`${process.env.REACT_APP_DELETE_DEFERRED_ENDPOINT}/${id}`);
    console.log(' VC DELETE Resp');
    console.log('deleteResp: ', deleteResp);
    return deleteResp;
  }

  async postRevokeVC(statusListIndex: string) {
    const revokeResp = await this.post(`${process.env.REACT_APP_REVOKE_ENDPOINT}`, {
      statusListIndex: statusListIndex,
    });
    return revokeResp;
  }

  async postReActivateVC(statusListIndex: string) {
    const reactivateResp = await this.post(`${process.env.REACT_APP_REACTIVATE_ENDPOINT}`, {
      statusListIndex: statusListIndex,
    });
    return reactivateResp;
  }

  async postRegister() {
    const registerResp = await this.post(`${process.env.REACT_APP_REGISTER_ENDPOINT}`);

    return registerResp;
  }

  async getWalletCapabilities() {
    const walletCap = await this.get(`${process.env.REACT_APP_GET_WALLETCAP_ENDPOINT}`, {});
    console.log('REACT_APP_GET_WALLETCAP_ENDPOINT: ', process.env.REACT_APP_GET_WALLETCAP_ENDPOINT);
    console.log('GET walletcap:');
    console.log(walletCap);
    return walletCap;
  }

  async getNewWallet() {
    const wallet = await this.get(`${process.env.REACT_APP_GET_NEWWALLET_ENDPOINT}`, {});
    console.log('GET NEW wallet:');
    console.log(wallet);
    return wallet;
  }

  async getReqOnBoard(taoUrl: string, preAuthCode: string) {
    const request = await this.get(
      `${process.env.REACT_APP_GET_REQONBOARD_ENDPOINT}?taoURL=${taoUrl}&preAuthCode=${preAuthCode}`,
      {}
    );
    console.log('GET on board request response:');
    console.log(request);
    return request;
  }

  async getReqAccredit(params: reqAccreditParamsType) {
    const reqAccreditResp = await this.get(
      `${process.env.REACT_APP_GET_REQACCREDIT_ENDPOINT}?accrAs=${params.accrAs}&taoURL=${params.taoURL}&preAuthCode=${params.preAuthCode}`,
      {}
    );
    console.log('GET reqAccreditResp:');
    console.log(reqAccreditResp);
    return reqAccreditResp;
  }

  async getGenPin(pinType: PIN_TYPE) {
    const genPinResp = await this.get(
      `${process.env.REACT_APP_GET_GENPIN_ENDPOINT}?type=${pinType}`,
      {}
    );
    console.log('GET genPinResp:');
    console.log(genPinResp);
    return genPinResp;
  }

  async getRemoveAccredit(did: string) {
    const getRemoveAccreditResp = await this.get(
      `${process.env.REACT_APP_GET_REMOVEACCREDIT_ENDPOINT}?orgDID=${did}
`,
      {}
    );
    console.log('GET getRemoveAccreditResp:');
    console.log(getRemoveAccreditResp);
    return getRemoveAccreditResp;
  }
}

export default new AdminApiService();
