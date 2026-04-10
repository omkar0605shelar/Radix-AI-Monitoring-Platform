import api from './api';

export const createCheckoutSession = async (priceId: string) => {
  const res = await api.post('/billing/create-checkout-session', { priceId });
  return res.data;
};

export const getSubscriptionStatus = async () => {
  const res = await api.get('/billing/status');
  return res.data;
};

export const getBillingPortalUrl = async () => {
  const res = await api.post('/billing/portal');
  return res.data;
};
