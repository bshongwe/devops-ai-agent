import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class WebhookDto {
  @ApiProperty({ example: 'push', description: 'GitHub event action' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'Repository information' })
  @IsObject()
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      login: string;
      id: number;
    };
  };

  @ApiProperty({ description: 'Installation information' })
  @IsObject()
  @IsOptional()
  installation?: {
    id: number;
  };

  @ApiProperty({ description: 'Sender information' })
  @IsObject()
  sender: {
    login: string;
    id: number;
  };

  @ApiProperty({ description: 'Event-specific payload' })
  @IsObject()
  @IsOptional()
  payload?: any;
}
