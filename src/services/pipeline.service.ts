import { Injectable } from '@nestjs/common';
import { GeneratePipelineDto } from '../dto/generate-pipeline.dto';

export interface Pipeline {
  id: string;
  name: string;
  repository: string;
  branch: string;
  projectType: string;
  config: any;
  status: 'draft' | 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PipelineService {
  private pipelines: Map<string, Pipeline> = new Map();

  async generatePipeline(dto: GeneratePipelineDto): Promise<Pipeline> {
    const id = this.generateId();
    const config = this.generatePipelineConfig(dto);
    
    const pipeline: Pipeline = {
      id,
      name: `${dto.repository}-${dto.branch}`,
      repository: dto.repository,
      branch: dto.branch,
      projectType: dto.projectType,
      config,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.pipelines.set(id, pipeline);
    return pipeline;
  }

  async getPipeline(id: string): Promise<Pipeline | null> {
    return this.pipelines.get(id) || null;
  }

  async listPipelines(): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values());
  }

  async updatePipelineStatus(id: string, status: Pipeline['status']): Promise<void> {
    const pipeline = this.pipelines.get(id);
    if (pipeline) {
      pipeline.status = status;
      pipeline.updatedAt = new Date();
      this.pipelines.set(id, pipeline);
    }
  }

  private generatePipelineConfig(dto: GeneratePipelineDto) {
    const baseConfig = {
      name: `CI/CD Pipeline for ${dto.repository}`,
      on: {
        push: { branches: [dto.branch] },
        pull_request: { branches: [dto.branch] },
      },
      jobs: {},
    };

    // Generate jobs based on project type
    switch (dto.projectType.toLowerCase()) {
      case 'nodejs':
        baseConfig.jobs = this.generateNodeJSJobs(dto);
        break;
      case 'python':
        baseConfig.jobs = this.generatePythonJobs(dto);
        break;
      case 'go':
        baseConfig.jobs = this.generateGoJobs(dto);
        break;
      case 'docker':
        baseConfig.jobs = this.generateDockerJobs(dto);
        break;
      default:
        baseConfig.jobs = this.generateGenericJobs(dto);
    }

    return baseConfig;
  }

  private generateNodeJSJobs(dto: GeneratePipelineDto) {
    return {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v4',
            with: { 'node-version': '18' },
          },
          {
            name: 'Install dependencies',
            run: 'npm ci',
          },
          {
            name: 'Run tests',
            run: 'npm test',
          },
          {
            name: 'Build project',
            run: 'npm run build',
          },
          ...(dto.steps || []).map(step => ({
            name: step.name,
            run: step.command,
            env: step.env ? Object.fromEntries(step.env.map(e => e.split('='))) : undefined,
          })),
        ],
      },
      ...(dto.environment && {
        deploy: {
          'runs-on': 'ubuntu-latest',
          needs: 'build',
          if: "github.ref == 'refs/heads/" + dto.branch + "'",
          steps: [
            { uses: 'actions/checkout@v4' },
            {
              name: 'Deploy to ' + dto.environment,
              run: `echo "Deploying to ${dto.environment} environment"`,
            },
          ],
        },
      }),
    };
  }

  private generatePythonJobs(dto: GeneratePipelineDto) {
    return {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Setup Python',
            uses: 'actions/setup-python@v4',
            with: { 'python-version': '3.9' },
          },
          {
            name: 'Install dependencies',
            run: 'pip install -r requirements.txt',
          },
          {
            name: 'Run tests',
            run: 'pytest',
          },
          ...(dto.steps || []).map(step => ({
            name: step.name,
            run: step.command,
          })),
        ],
      },
    };
  }

  private generateGoJobs(dto: GeneratePipelineDto) {
    return {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Setup Go',
            uses: 'actions/setup-go@v4',
            with: { 'go-version': '1.19' },
          },
          {
            name: 'Build',
            run: 'go build -v ./...',
          },
          {
            name: 'Test',
            run: 'go test -v ./...',
          },
          ...(dto.steps || []).map(step => ({
            name: step.name,
            run: step.command,
          })),
        ],
      },
    };
  }

  private generateDockerJobs(dto: GeneratePipelineDto) {
    return {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Build Docker image',
            run: 'docker build -t ${{ github.repository }}:${{ github.sha }} .',
          },
          {
            name: 'Run tests in Docker',
            run: 'docker run --rm ${{ github.repository }}:${{ github.sha }} npm test',
          },
          ...(dto.steps || []).map(step => ({
            name: step.name,
            run: step.command,
          })),
        ],
      },
    };
  }

  private generateGenericJobs(dto: GeneratePipelineDto) {
    return {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          ...(dto.steps || []).map(step => ({
            name: step.name,
            run: step.command,
            env: step.env ? Object.fromEntries(step.env.map(e => e.split('='))) : undefined,
          })),
        ],
      },
    };
  }

  private generateId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
