import { ethers } from "ethers";

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: string;
  id: string | number;
  result: T;
  error?: unknown;
}

export interface JsonRpcRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params: unknown[];
}

export interface ParamSignedTransaction {
  protocol: string;
  unsignedTransaction: ethers.UnsignedTransaction;
  r: string;
  s: string;
  v: string;
  signedRawTransaction: string;
}

export interface Receipt {
  blockNumber: string;
  from: string;
  to: string;
  status: string;
  revertReason?: string;
}
