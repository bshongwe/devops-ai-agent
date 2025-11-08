import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeneratePipelineDto } from '../dto/generate-pipeline.dto';
import { PipelineService } from '../services/pipeline.service';
import { OrchestratorService } from '../services/orchestrator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('pipelines')
@Controller('pipelines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PipelineController {
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate CI/CD pipeline configuration' })
  @ApiResponse({ 
    status: 201, 
    description: 'Pipeline generated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        config: { type: 'object' },
        status: { type: 'string' },
      },
    },
  })
  async generatePipeline(@Body() generatePipelineDto: GeneratePipelineDto) {
    return this.pipelineService.generatePipeline(generatePipelineDto);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute a pipeline' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pipeline execution started',
    schema: {
      type: 'object',
      properties: {
        executionId: { type: 'string' },
        status: { type: 'string' },
        startedAt: { type: 'string' },
      },
    },
  })
  async executePipeline(@Param('id') id: string) {
    return this.orchestratorService.executePipeline(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get pipeline execution status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pipeline status retrieved',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        steps: { type: 'array' },
        logs: { type: 'array' },
      },
    },
  })
  async getPipelineStatus(@Param('id') id: string) {
    return this.orchestratorService.getPipelineStatus(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all pipelines' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pipelines retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
  })
  async listPipelines() {
    return this.pipelineService.listPipelines();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline details' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pipeline details retrieved',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        config: { type: 'object' },
        status: { type: 'string' },
        createdAt: { type: 'string' },
      },
    },
  })
  async getPipeline(@Param('id') id: string) {
    return this.pipelineService.getPipeline(id);
  }
}
