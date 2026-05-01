import type { PushSubscription } from "web-push";

type MemoryStore = {
  subscriptions: PushSubscription[];
};

const globalForPush = globalThis as unknown as {
  __GEUNTTEOKJON_PUSH_STORE__?: MemoryStore;
};

export const pushStore =
  globalForPush.__GEUNTTEOKJON_PUSH_STORE__ ??
  (globalForPush.__GEUNTTEOKJON_PUSH_STORE__ = {
    subscriptions: [],
  });

export function addSubscription(subscription: PushSubscription) {
  const endpoint = subscription.endpoint;

  const exists = pushStore.subscriptions.some((item) => item.endpoint === endpoint);

  if (!exists) {
    pushStore.subscriptions.push(subscription);
  }

  return pushStore.subscriptions.length;
}