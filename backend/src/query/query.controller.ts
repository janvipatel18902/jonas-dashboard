import { Controller, Post, Body } from '@nestjs/common';
import { QueryService } from './query.service';
import type { ReportUserOverviewParams } from './query.service';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  async runQuery(
    @Body() body: ReportUserOverviewParams,
  ): Promise<{ data: unknown }> {
    const data = await this.queryService.getUserOverview(body);
    return { data };
  }
}
