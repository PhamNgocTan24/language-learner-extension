import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'price_1234567890', description: 'Stripe price ID' })
  @IsString()
  priceId: string;
}
