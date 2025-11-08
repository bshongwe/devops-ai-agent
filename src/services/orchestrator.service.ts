import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GitHubAuthService } from '../auth/github-auth.service';

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'success' | 'failure' | 'cancelled';
  startedAt: Date;
  finishedAt?: Date;
  steps: PipelineStep[];
  logs: string[];
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failure' | 'skipped';
  startedAt?: Date;
  finishedAt?: Date;
  output?: string;
}

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private executions: Map<string, PipelineExecution> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly githubAuthService: GitHubAuthService,
  ) {}

  async executePipeline(pipelineId: string): Promise<{ executionId: string; status: string; startedAt: string }> {
    const executionId = this.generateExecutionId();
    
    const execution: PipelineExecution = {
      id: executionId,
      pipelineId,
      status: 'pending',
      startedAt: new Date(),
      steps: [],
      logs: [],
    };

    this.executions.set(executionId, execution);
    this.logger.log(`Started pipeline execution: ${executionId} for pipeline: ${pipelineId}`);

    // Start execution in background
    this.runPipelineExecution(executionId).catch(error => {
      this.logger.error(`Pipeline execution failed: ${executionId}`, error);
      const exec = this.executions.get(executionId);
      if (exec) {
        exec.status = 'failure';
        exec.finishedAt = new Date();
        exec.logs.push(`Execution failed: ${error.message}`);
      }
    });

    return {
      executionId,
      status: execution.status,
      startedAt: execution.startedAt.toISOString(),
    };
  }

  async getPipelineStatus(executionId: string): Promise<PipelineExecution | null> {
    return this.executions.get(executionId) || null;
  }

  async cancelPipelineExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.finishedAt = new Date();
      execution.logs.push('Execution cancelled by user');
      this.logger.log(`Pipeline execution cancelled: ${executionId}`);
      return true;
    }
    return false;
  }

  private async runPipelineExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    try {
      execution.status = 'running';
      execution.logs.push('Pipeline execution started');

      // Simulate pipeline steps
      const steps = [
        { name: 'Checkout code', command: 'git checkout' },
        { name: 'Install dependencies', command: 'npm install' },
        { name: 'Run tests', command: 'npm test' },
        { name: 'Build project', command: 'npm run build' },
        { name: 'Deploy', command: 'deploy.sh' },
      ];

      for (const stepConfig of steps) {
        const step: PipelineStep = {
          name: stepConfig.name,
          status: 'running',
          startedAt: new Date(),
        };

        execution.steps.push(step);
        execution.logs.push(`Starting step: ${step.name}`);

        // Simulate step execution
        await this.simulateStepExecution(stepConfig.command);

        step.status = 'success';
        step.finishedAt = new Date();
        execution.logs.push(`Completed step: ${step.name}`);
      }

      execution.status = 'success';
      execution.finishedAt = new Date();
      execution.logs.push('Pipeline execution completed successfully');

      this.logger.log(`Pipeline execution completed: ${executionId}`);
    } catch (error) {
      execution.status = 'failure';
      execution.finishedAt = new Date();
      execution.logs.push(`Execution failed: ${error.message}`);
      throw error;
    }
  }

  private async simulateStepExecution(command: string): Promise<void> {
    // Simulate execution time
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate occasional failures
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error(`Command failed: ${command}`);
    }

    this.logger.debug(`Executed command: ${command}`);
  }

  async triggerGitHubWorkflow(
    installationId: number,
    owner: string,
    repo: string,
    workflowId: string,
    ref: string = 'main',
  ): Promise<any> {
    try {
      const octokit = await this.githubAuthService.getInstallationOctokit(installationId);
      
      const response = await octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
        inputs: {
          triggered_by: 'ci-cd-agent',
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(`Triggered GitHub workflow: ${workflowId} for ${owner}/${repo}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to trigger GitHub workflow: ${error.message}`);
      throw error;
    }
  }

  async getWorkflowRuns(
    installationId: number,
    owner: string,
    repo: string,
    workflowId?: string,
  ): Promise<any> {
    try {
      const octokit = await this.githubAuthService.getInstallationOctokit(installationId);
      
      const params: any = { owner, repo };
      if (workflowId) {
        params.workflow_id = workflowId;
      }

      const response = await octokit.rest.actions.listWorkflowRunsForRepo(params);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get workflow runs: ${error.message}`);
      throw error;
    }
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
