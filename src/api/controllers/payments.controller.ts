import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../application/auth/guards/jwt-auth.guard';
import { PaymentsService } from '../../application/services/payments.service';
import { CheckoutDto } from '../dto/payments/checkout.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiBearerAuth('access-token')
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(@Req() req: any, @Body() dto: CheckoutDto) {
    return this.paymentsService.createCheckoutSession(req.user.userId, dto.priceId);
  }

  @ApiOperation({ summary: 'Get Stripe customer portal URL' })
  @ApiBearerAuth('access-token')
  @Get('portal')
  @UseGuards(JwtAuthGuard)
  getPortal(@Req() req: any) {
    return this.paymentsService.getPortalUrl(req.user.userId);
  }

  /**
   * Stripe webhook — must receive raw body for signature verification.
   * No JWT guard — Stripe calls this directly.
   */
  @ApiExcludeEndpoint()
  @Post('webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    await this.paymentsService.handleWebhook(req.rawBody!, sig);
    return { received: true };
  }
}
