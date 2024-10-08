import { IStakingApiManager } from '@/domain/interfaces/staking-api.manager.interface';
import {
  NetworkStats,
  NetworkStatsSchema,
} from '@/datasources/staking-api/entities/network-stats.entity';
import {
  PooledStakingStats,
  PooledStakingStatsSchema,
} from '@/datasources/staking-api/entities/pooled-staking-stats.entity';
import { IStakingRepository } from '@/domain/staking/staking.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import {
  DedicatedStakingStats,
  DedicatedStakingStatsSchema,
} from '@/datasources/staking-api/entities/dedicated-staking-stats.entity';
import {
  Deployment,
  DeploymentSchema,
} from '@/datasources/staking-api/entities/deployment.entity';
import {
  DefiVaultStats,
  DefiVaultStatsSchema,
} from '@/datasources/staking-api/entities/defi-vault-stats.entity';

@Injectable()
export class StakingRepository implements IStakingRepository {
  constructor(
    @Inject(IStakingApiManager)
    private readonly stakingApiFactory: IStakingApiManager,
  ) {}

  public async getDeployment(args: {
    chainId: string;
    address: `0x${string}`;
  }): Promise<Deployment> {
    const stakingApi = await this.stakingApiFactory.getApi(args.chainId);
    const deployments = await stakingApi.getDeployments();
    const deployment = deployments.find(({ chain_id, address }) => {
      return chain_id.toString() && address === args.address;
    });
    return DeploymentSchema.parse(deployment);
  }

  public async getNetworkStats(chainId: string): Promise<NetworkStats> {
    const stakingApi = await this.stakingApiFactory.getApi(chainId);
    const networkStats = await stakingApi.getNetworkStats();
    return NetworkStatsSchema.parse(networkStats);
  }

  public async getDedicatedStakingStats(
    chainId: string,
  ): Promise<DedicatedStakingStats> {
    const stakingApi = await this.stakingApiFactory.getApi(chainId);
    const dedicatedStakingStats = await stakingApi.getDedicatedStakingStats();
    return DedicatedStakingStatsSchema.parse(dedicatedStakingStats);
  }

  public async getPooledStakingStats(args: {
    chainId: string;
    pool: `0x${string}`;
  }): Promise<PooledStakingStats> {
    const stakingApi = await this.stakingApiFactory.getApi(args.chainId);
    const pooledStaking = await stakingApi.getPooledStakingStats(args.pool);
    return PooledStakingStatsSchema.parse(pooledStaking);
  }

  public async getDefiVaultStats(args: {
    chainId: string;
    vault: `0x${string}`;
  }): Promise<DefiVaultStats> {
    const stakingApi = await this.stakingApiFactory.getApi(args.chainId);
    const defiStats = await stakingApi.getDefiVaultStats(args);
    // Cannot be >1 contract deployed at the same address so return first element
    return defiStats.map((defiStats) =>
      DefiVaultStatsSchema.parse(defiStats),
    )[0];
  }

  public clearApi(chainId: string): void {
    this.stakingApiFactory.destroyApi(chainId);
  }
}
