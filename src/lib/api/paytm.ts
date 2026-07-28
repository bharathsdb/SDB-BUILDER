import crypto from "crypto";

const PAYTM_STAGE_URL = "https://securegw-stage.paytm.in";
const PAYTM_PROD_URL = "https://securegw.paytm.in";

const MID = process.env.PAYTM_MID || "PLANCR87329847128943"; // Sample sandbox MID
const MKEY = process.env.PAYTM_MERCHANT_KEY || "SampleMerchantKey12345";
const ENVIRONMENT = process.env.PAYTM_ENVIRONMENT || "stage"; // stage or prod

const BASE_URL = ENVIRONMENT === "prod" ? PAYTM_PROD_URL : PAYTM_STAGE_URL;

class PaytmChecksum {
  static encrypt(data: string, key: string): string {
    const iv = "@@@@&&&&####$$$$"; // Paytm default IV
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  static decrypt(data: string, key: string): string {
    const iv = "@@@@&&&&####$$$$";
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(data, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  static generateSignature(params: Record<string, unknown>, key: string): string {
    const stringToBeHashed = PaytmChecksum.getStringByParams(params);
    const salt = PaytmChecksum.generateRandomString(4);
    const sha256 = crypto.createHash("sha256").update(stringToBeHashed + salt).digest("hex");
    const hashString = sha256 + salt;
    return PaytmChecksum.encrypt(hashString, key);
  }

  static verifySignature(params: Record<string, unknown>, key: string, checksum: string): boolean {
    if (typeof checksum !== "string") return false;
    try {
      const decrypted = PaytmChecksum.decrypt(checksum, key);
      const salt = decrypted.substring(decrypted.length - 4);
      const hashWithoutSalt = decrypted.substring(0, decrypted.length - 4);
      const stringToBeHashed = PaytmChecksum.getStringByParams(params);
      const calculatedHash = crypto.createHash("sha256").update(stringToBeHashed + salt).digest("hex");
      return calculatedHash === hashWithoutSalt;
    } catch {
      return false;
    }
  }

  static generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
  }

  static getStringByParams(params: Record<string, unknown>): string {
    const data: Record<string, string> = {};
    Object.keys(params).sort().forEach((key) => {
      data[key] = params[key] !== null && params[key] !== undefined ? String(params[key]) : "";
    });
    return Object.values(data).join("|");
  }
}

export interface InitiateTransactionParams {
  orderId: string;
  amount: number;
  userId: string;
  email: string;
  phone?: string;
  callbackUrl: string;
}

export async function initiatePaytmTransaction({
  orderId,
  amount,
  userId,
  email,
  phone = "9999999999",
  callbackUrl,
}: InitiateTransactionParams) {
  // If sandbox / mock credentials are used, we support a fully functional mock flow as well
  const isMock = MKEY === "SampleMerchantKey12345";

  const paytmParams: Record<string, unknown> = {
    body: {
      requestType: "Payment",
      mid: MID,
      websiteName: ENVIRONMENT === "prod" ? "DEFAULT" : "WEBSTAGING",
      orderId: orderId,
      callbackUrl: callbackUrl,
      txnAmount: {
        value: amount.toFixed(2),
        currency: "INR",
      },
      userInfo: {
        custId: userId,
        email: email,
        mobile: phone,
      },
    },
  };

  const signature = PaytmChecksum.generateSignature(paytmParams.body as Record<string, unknown>, MKEY);
  paytmParams.head = {
    signature: signature,
  };

  if (isMock) {
    // Return mock success with txnToken immediately to allow simulator flow
    return {
      success: true,
      txnToken: "MOCK_TXN_TOKEN_" + PaytmChecksum.generateRandomString(16),
      orderId,
      amount,
      mid: MID,
      isMock: true,
      paytmUrl: `${BASE_URL}/themerchant/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`,
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}/themerchant/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paytmParams),
      }
    );

    const data = await response.json();
    if (data.body?.resultInfo?.resultStatus === "S") {
      return {
        success: true,
        txnToken: data.body.txnToken,
        orderId,
        amount,
        mid: MID,
        isMock: false,
        paytmUrl: `${BASE_URL}/themerchant/v1/initiateTransaction?mid=${MID}&orderId=${orderId}`,
      };
    } else {
      return {
        success: false,
        error: data.body?.resultInfo?.resultMsg || "Failed to initiate transaction",
      };
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error while contacting Paytm API",
    };
  }
}

export async function checkPaytmStatus(orderId: string) {
  const paytmParams: Record<string, unknown> = {
    body: {
      mid: MID,
      orderId: orderId,
    },
  };

  const signature = PaytmChecksum.generateSignature(paytmParams.body as Record<string, unknown>, MKEY);
  paytmParams.head = {
    signature: signature,
  };

  if (MKEY === "SampleMerchantKey12345") {
    // Simulated status checker
    return {
      success: true,
      status: "TXN_SUCCESS",
      respMsg: "Txn Success (Simulated)",
      txnId: "MOCK_TXN_" + PaytmChecksum.generateRandomString(12),
      bankTxnId: "MOCK_BANK_" + PaytmChecksum.generateRandomString(12),
      paymentMode: "UPI",
      gatewayName: "PAYTM",
      txnDate: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}/v3/order/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paytmParams),
      }
    );

    const data = await response.json();
    return {
      success: data.body?.resultInfo?.resultStatus === "S",
      status: data.body?.resultInfo?.resultStatus,
      respMsg: data.body?.resultInfo?.resultMsg,
      txnId: data.body?.txnId,
      bankTxnId: data.body?.bankTxnId,
      paymentMode: data.body?.paymentMode,
      gatewayName: data.body?.gatewayName,
      txnDate: data.body?.txnDate,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown payment error",
    };
  }
}

export { PaytmChecksum };
