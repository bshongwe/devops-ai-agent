import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PipelineStepDto {
  @ApiProperty({ example: 'build', description: 'Step name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'npm run build', description: 'Command to execute' })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiProperty({ example: 'node:18', description: 'Docker image to use' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: ['NODE_ENV=production'], description: 'Environment variables' })
  @IsArray()
  @IsOptional()
  env?: string[];
}

export class GeneratePipelineDto {
  @ApiProperty({ example: 'my-repo', description: 'Repository name' })
  @IsString()
  @IsNotEmpty()
  repository: string;

  @ApiProperty({ example: 'main', description: 'Target branch' })
  @IsString()
  @IsNotEmpty()
  branch: string;

  @ApiProperty({ example: 'nodejs', description: 'Project type (nodejs, python, go, etc.)' })
  @IsString()
  @IsNotEmpty()
  projectType: string;

  @ApiProperty({ 
    type: [PipelineStepDto], 
    description: 'Custom pipeline steps',
    required: false 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PipelineStepDto)
  @IsOptional()
  steps?: PipelineStepDto[];

  @ApiProperty({ example: 'staging', description: 'Deployment environment' })
  @IsString()
  @IsOptional()
  environment?: string;

  @ApiProperty({ example: 123456, description: 'GitHub installation ID' })
  @IsOptional()
  installationId?: number;
}
