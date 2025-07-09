import { onCall } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  VirgilCrypto,
  VirgilAccessTokenSigner,
  initCrypto,
} from "virgil-crypto";
import { JwtGenerator } from "virgil-sdk";

admin.initializeApp();

const APP_ID = "43fb5a8c67e34cf1a048fb94efa4f5b4";
const API_KEY_ID = "8eab0c2004aeb770e88c5a0101c7976c";
const APP_KEY_BASE64 = "MC4CAQAwBQYDK2VwBCIEIOju1FgceLCzNJVzQql/qhYXP4KE9ea+cq3MXwyl+11T"; // Base64

export const getVirgilToken = onCall(async (request) => {
  try {
    const identity = request.data.identity || "default-user";

    // ✅ Initialize crypto (WASM or native)
    await initCrypto();

    const virgilCrypto = new VirgilCrypto();
    const accessTokenSigner = new VirgilAccessTokenSigner(virgilCrypto);

    const apiKey = virgilCrypto.importPrivateKey(
      Buffer.from(APP_KEY_BASE64, "base64")
    );

    const jwtGenerator = new JwtGenerator({
      appId: APP_ID,
      apiKeyId: API_KEY_ID,
      apiKey,
      accessTokenSigner,
    });

    const jwt = jwtGenerator.generateToken(identity);
    return { token: jwt.toString() };
  } catch (error) {
    console.error("❌ Failed to generate Virgil token:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate Virgil token.");
  }
});
