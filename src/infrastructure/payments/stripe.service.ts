import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

/**
 * Stripe wrapper — lives in infrastructure, never called directly from controllers.
 * Application layer (PaymentsService) orchestrates; this handles raw SDK calls.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, name });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: priceId.includes('lifetime') ? 'payment' : 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  constructWebhookEvent(payload: Buffer, sig: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    );
  }
}
