import { DataSourceInstanceSettings, CoreApp, ScopedVars } from '@grafana/data';
import { BackendSrvRequest, DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';

import { AriaSourceOptions, MetricPropertyTagResponse } from './types';
import { AriaQuery, defaultBuilderQuery, QueryBuilderOptionsBase } from './types/queryBuilder';

export class DataSource extends DataSourceWithBackend<AriaQuery, AriaSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<AriaSourceOptions>) {
    super(instanceSettings);
  }

  getDefaultQuery(_: CoreApp): Partial<AriaQuery> {
    return defaultBuilderQuery;
  }

  applyTemplateVariables(query: AriaQuery, scopedVars: ScopedVars) {
    return {
      ...query,
      queryText: getTemplateSrv().replace(query.rawQuery, scopedVars),
    };
  }

  filterQuery(query: AriaQuery): boolean {
    // if no query has been provided, prevent the query from being executed
    return !!query.rawQuery;
  }

  fetchAdapterResourceKinds(): Promise<Record<string, string[]>> {
    return this.getResource('/adapterkinds');
  }

  fetchMetricsProperties(queryParams: QueryBuilderOptionsBase): Promise<MetricPropertyTagResponse> {
    if (!queryParams.functions.adapterKind || !queryParams.functions.resourceKind) {
      return Promise.resolve({});
    }
    const request: BackendSrvRequest['params'] = {
      adapterKind: queryParams.functions.adapterKind,
      resourceKind: queryParams.functions.resourceKind,
    };
    return this.getResource('/metricpropertytag', request);
  }
}
