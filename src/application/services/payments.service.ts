import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { StripeService } from '../../infrastructure/payments/stripe.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject('USER_REPOSITORY') private readonly userRepo: IUserRepository,
    private readonly stripeService: StripeService,
  ) {}

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Ensure user has a Stripe customer record
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripeService.createCustomer(user.email, user.name ?? user.email);
      customerId = customer.id;
      await this.userRepo.update(userId, { stripeCustomerId: customerId });
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const session = await this.stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${frontendUrl}/dashboard?upgrade=success`,
      `${frontendUrl}/dashboard?upgrade=cancelled`,
    );

    return { url: session.url };
  }

  async getPortalUrl(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.stripeCustomerId) {
      throw new NotFoundException('No billing account found');
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const session = await this.stripeService.createPortalSession(
      user.stripeCustomerId,
      `${frontendUrl}/settings`,
    );

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const event = this.stripeService.constructWebhookEvent(payload, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const customerId = session.customer as string;
        const user = await this.userRepo.findByStripeCustomerId(customerId);
        if (user) {
          // One-time payment = lifetime, subscription = pro
          const tier = session.mode === 'payment' ? 'lifetime' : 'pro';
          await this.userRepo.update(user.id, { tier } as any);
          this.logger.log(`User ${user.id} upgraded to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const user = await this.userRepo.findByStripeCustomerId(customerId);
        if (user) {
          await this.userRepo.update(user.id, { tier: 'free' } as any);
          this.logger.log(`User ${user.id} downgraded to free`);
        }
        break;
      }

      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }
}
