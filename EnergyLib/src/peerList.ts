import { PeerConfig, AnyNode } from "./types";
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

export const getPeerUrls = (peers: PeerConfig[], ownUrl: string) =>
  peers.map((peer) => peer.URL).filter((url) => url !== ownUrl);

export const fetchPeersFrom = async (peer: string): Promise<PeerConfig[]> => {
  const { data } = await axios.get<PeerConfig[]>(`${peer}/api/peers`);
  console.log(`Retrieved ${data.length} peers from ${peer}`);
  return data;
};

export const broadcastSelf = async (
  peers: PeerConfig[],
  peerConfig: PeerConfig
) => {
  const peerUrls = getPeerUrls(peers, peerConfig.URL);
  const peerUrlReqs = peerUrls.map((peer) =>
    axios.post(`${peer}/api/peers`, peerConfig)
  );

  try {
    await Promise.all(peerUrlReqs);
    console.log(`Broadcast presence successfully to ${peerUrls.join(", ")}`);
  } catch (e: any) {
    console.error("Unable to broadcast self: ", e.message);
  }
};

export const broadcastShutdown = async (
  peers: PeerConfig[],
  peerConfig: PeerConfig
) => {
  const peerUrls = getPeerUrls(peers, peerConfig.URL);
  const peerUrlReqs = peerUrls.map((peer) =>
    axios.delete(`${peer}/api/peers`, { data: peerConfig })
  );

  try {
    await Promise.all(peerUrlReqs);
    console.log(`Broadcast shutdown successfully to ${peerUrls.join(", ")}`);
  } catch (e: any) {
    console.error(e);
  }
};

export const broadcastTransaction = async ({
  transaction,
  peerUrls,
}: {
  transaction: AnyNode;
  peerUrls: string[];
}) => {
  const peerUrlReqs = peerUrls.map((peer) =>
    axios.post(`${peer}/api/transactions/new`, transaction)
  );

  try {
    await Promise.all(peerUrlReqs);
    console.log(`Broadcast transaction successfully to ${peerUrls.join(", ")}`);
  } catch (e: any) {
    console.error(e);
  }
};
