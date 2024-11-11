import { ethers } from "ethers";
import axios, { AxiosResponse } from "axios";
import type { Logger } from "@nestjs/common";
import { getErrorMessage, logAxiosError } from "../utils/index.js";
import type {
  BesuTransactionReceipt,
  UnsignedTransaction,
} from "../interfaces.js";

export function logAxiosRequestError(err: unknown, logger: Logger) {
  if (err instanceof Error) {
    if (axios.isAxiosError(err)) {
      logAxiosError(err, logger);
    } else {
      logger.error(err.message, err.stack);
    }
  } else {
    logger.error(err);
  }
}

export async function waitToBeMined(
  ledgerApiUrl: string,
  logger: Logger,
  txId: string
): Promise<{ success: true } | { success: false; error: Error }> {
  try {
    let mined = false;

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < 40; i += 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      console.log('waiting to be mined...');

      const { data } = await axios.post<{
        result: BesuTransactionReceipt;
      }>(ledgerApiUrl, {
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txId],
      });

      mined = !!data.result;
      if (mined) {
        console.log('mined');
        if (Number(data.result.status) !== 1) {
          
          const revertReason = data.result.revertReason
            ? Buffer.from(data.result.revertReason.slice(2), "hex")
                .toString()
                .replace(/[^a-zA-Z0-9:\-' ]/g, "")
            : "";
          return {
            success: false,
            error: new Error(
              `Transaction failed: Status ${data.result.status}. Revert reason: ${revertReason}`
            ),
          };
        }
        console.log('getting out of the loop');
        
        break;
      }
    }

    if (!mined) {
      return {
        success: false,
        error: new Error(`Timeout exceeded for transaction ID ${txId}`),
      };
    }
  } catch (error) {
    logAxiosRequestError(error, logger);
    return {
      success: false,
      error: new Error(`Transaction not mined: ${getErrorMessage(error)}`),
    };
  }

  return { success: true };
}

/**
 * Helper function to sign and send a transaction.
 */
export async function signAndSendTransaction(
  unsignedTransaction: UnsignedTransaction,
  wallet: ethers.Wallet,
  jsonrpcEndpoint: string,
  logger: Logger,
  accessToken: string
): Promise<
  { success: true; txId: string } | { success: false; error: unknown }
> {
  const sgnTx = await wallet.signTransaction({
    to: unsignedTransaction.to,
    data: unsignedTransaction.data,
    value: unsignedTransaction.value,
    nonce: Number(unsignedTransaction.nonce),
    chainId: Number(unsignedTransaction.chainId),
    gasLimit: unsignedTransaction.gasLimit,
    gasPrice: unsignedTransaction.gasPrice,
  });
  const { r, s, v } = ethers.utils.parseTransaction(sgnTx);

  let txId = "";
  try {
    const responseSend = await axios.post<{
      result: string;
    }>(
      jsonrpcEndpoint,
      {
        jsonrpc: "2.0",
        method: "sendSignedTransaction",
        params: [
          {
            protocol: "eth",
            unsignedTransaction,
            r,
            s,
            v: `0x${Number(v).toString(16)}`,
            signedRawTransaction: sgnTx,
          },
        ],
        id: 1,
      },
      {
        headers: { authorization: `Bearer ${accessToken}` },
      }
    );
    txId = responseSend.data.result;
  } catch (error) {
    logAxiosRequestError(error, logger);
    return { success: false, error };
  }

  return { success: true, txId };
}

export async function preregisterAttribute(
  taoDid: string,
  taoAttributeId: string,
  taoPrivateKeyHex: string,
  trustedIssuersRegistryApiJsonrpcUrl: string,
  ledgerApiUrl: string,
  logger: Logger,
  did: string,
  issuerType: number,
  attributeId: string,
  accessToken: string
): Promise<void> {
  // build unsigned transaction
  const wallet = new ethers.Wallet(taoPrivateKeyHex);
  let responseBuild: AxiosResponse<{
    result: UnsignedTransaction;
  }>;

  try {
    responseBuild = await axios.post(
      trustedIssuersRegistryApiJsonrpcUrl,
      {
        jsonrpc: "2.0",
        method: "setAttributeMetadata",
        params: [
          {
            from: wallet.address,
            did,
            attributeId,
            taoDid,
            issuerType,
            taoAttributeId,
          },
        ],
        id: 1,
      },
      {
        headers: { authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (error) {
    logAxiosRequestError(error, logger);
    throw new Error(
      "The server encountered an internal error and was unable to complete your request: Unable to build the transaction to register the attribute"
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const unsignedTransaction = responseBuild!.data.result;

  const transactionResult = await signAndSendTransaction(
    unsignedTransaction,
    wallet,
    trustedIssuersRegistryApiJsonrpcUrl,
    logger,
    accessToken
  );

  if (!transactionResult.success) {
    throw new Error("Unable to send the transaction to register the attribute");
  }

  const { txId } = transactionResult;

  const miningResult = await waitToBeMined(ledgerApiUrl, logger, txId);

  if (!miningResult.success) {
    throw new Error(
      `Unable to get the transaction mined to register the attribute: ${miningResult.error.message}`
    );
  }
}
