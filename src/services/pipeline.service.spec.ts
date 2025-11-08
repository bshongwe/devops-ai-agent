import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { GeneratePipelineDto } from '../dto/generate-pipeline.dto';

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineService],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a Node.js pipeline', async () => {
    const dto: GeneratePipelineDto = {
      projectType: 'nodejs',
      repository: 'test/repo',
      branch: 'main',
      environment: 'development',
    };

    const result = await service.generatePipeline(dto);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.config).toBeDefined();
    expect(result.config.name).toContain('CI/CD Pipeline');
    expect(result.config.on.push.branches).toContain('main');
  });

  it('should generate a Python pipeline', async () => {
    const dto: GeneratePipelineDto = {
      projectType: 'python',
      repository: 'test/python-repo',
      branch: 'develop',
      environment: 'testing',
    };

    const result = await service.generatePipeline(dto);

    expect(result).toBeDefined();
    expect(result.config.jobs).toBeDefined();
    expect(result.config.jobs.test || result.config.jobs.build).toBeDefined();
  });

  it('should generate a Docker pipeline', async () => {
    const dto: GeneratePipelineDto = {
      projectType: 'docker',
      repository: 'test/docker-repo',
      branch: 'main',
      environment: 'production',
    };

    const result = await service.generatePipeline(dto);

    expect(result).toBeDefined();
    expect(result.config.jobs).toBeDefined();
    // Check for Docker-related job (could be named 'docker', 'build', or 'deploy')
    const jobNames = Object.keys(result.config.jobs);
    expect(jobNames.length).toBeGreaterThan(0);
  });

  it('should list pipelines', async () => {
    const pipelines = await service.listPipelines();
    expect(Array.isArray(pipelines)).toBe(true);
  });

  it('should get a specific pipeline', async () => {
    // First generate a pipeline
    const dto: GeneratePipelineDto = {
      projectType: 'nodejs',
      repository: 'test/repo',
      branch: 'main',
      environment: 'test',
    };

    const generated = await service.generatePipeline(dto);
    const pipeline = await service.getPipeline(generated.id);

    expect(pipeline).toBeDefined();
    expect(pipeline.id).toBe(generated.id);
    expect(pipeline.config).toBeDefined();
  });
});
