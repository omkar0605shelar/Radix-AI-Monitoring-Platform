import Stripe from 'stripe';
import prisma from '../config/client.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_key', {
  apiVersion: '2025-01-27' as any,
});

export class StripeService {
  /**
   * Creates or retrieves a Stripe customer for a user.
   */
  async getOrCreateCustomer(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (user.stripe_customer_id) {
      return user.stripe_customer_id;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripe_customer_id: customer.id },
    });

    return customer.id;
  }

  /**
   * Creates a checkout session for a subscription (INR supported).
   */
  async createCheckoutSession(userId: string, priceId: string) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      currency: 'inr', // Force INR as requested
    });

    return session.url;
  }

  /**
   * Handles Stripe webhooks to sync subscription status.
   */
  async handleWebhook(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await this.syncSubscriptionStatus(subscription);
        break;
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        await this.syncSubscriptionStatus(deletedSub, 'canceled');
        break;
    }

    return { received: true };
  }

  private async syncSubscriptionStatus(subscription: Stripe.Subscription, forceStatus?: string) {
    const customerId = subscription.customer as string;
    const status = forceStatus || subscription.status;
    
    // Map Stripe prices to internal tiers (example logic)
    let tier = 'free';
    const priceId = subscription.items.data[0].price.id;
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = 'pro';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) tier = 'enterprise';

    await prisma.user.update({
      where: { stripe_customer_id: customerId },
      data: {
        subscription_status: status,
        subscription_tier: tier,
      },
    });
  }
}
