import React from 'react';
import { CoreApp } from '@grafana/data';
import { CustomFilter, QueryBuilderOptions, QueryType } from '../../types/queryBuilder';
import {
  BuilderOptionsReducerAction,
  setAdapterKind,
  setQueryType,
  setResourceKind,
  setWhereHealth,
  setWhereState,
  setWhereStatus,
  setWithFilters,
  setWithMetric,
  setWithProperty,
} from '../../hooks/useBuilderOptionsState';
import { DataSource } from '../../datasource';
import { SelectForm } from './Select';
import { styles } from 'styles';
import { QueryTypeSwitcher } from './QueryTypeSwitcher';
import { TableQueryBuilder } from '../../views/TableQueryBuilder';
import { TimeSeriesQueryBuilder } from '../../views/TimeSeriesQueryBuilder';
import { KeyValue } from '../../types';
import { MultiChangeFunction, UseFetch } from '../utils';
import labels, { Labels } from '../../labels';
import useFetchHealth from '../../hooks/useFetchHealth';
import useFetchState from '../../hooks/useFetchState';
import useFetchStatus from '../../hooks/useFetchStatus';
import { CustomFilterForm } from './CustomFiltersForm';

interface QueryBuilderProps {
  app: CoreApp | undefined;
  builderOptions: QueryBuilderOptions;
  builderOptionsDispatch: React.Dispatch<BuilderOptionsReducerAction>;
  datasource: DataSource;
  generatedQuery: string;
}

export const QueryBuilder = (props: QueryBuilderProps) => {
  const { datasource, builderOptions, builderOptionsDispatch } = props;

  const onQueryTypeChange = (queryType: QueryType) => builderOptionsDispatch(setQueryType(queryType));

  const onAdapterKindChange = (adapterKind: string) => builderOptionsDispatch(setAdapterKind(adapterKind));
  const onResourceKindChange = (resourceKind: string) => builderOptionsDispatch(setResourceKind(resourceKind));

  const onWhereHealthChange = (whereHealth: string[]) => builderOptionsDispatch(setWhereHealth(whereHealth));
  const onWhereStateChange = (whereState: string[]) => builderOptionsDispatch(setWhereState(whereState));
  const onWhereStatusChange = (whereStatus: string[]) => builderOptionsDispatch(setWhereStatus(whereStatus));
  const onWithMetricChange = (withMetric: string) => builderOptionsDispatch(setWithMetric(withMetric));
  const onWithPropertyChange = (withProperty: string[]) => builderOptionsDispatch(setWithProperty(withProperty));
  const onWithFiltersChange = (customFilters: CustomFilter[]) => builderOptionsDispatch(setWithFilters(customFilters));
  const FiltersMap: KeyValue<[string[], MultiChangeFunction, Labels, UseFetch]> = {
    whereHealth: [
      builderOptions.filters.whereHealth,
      onWhereHealthChange,
      labels.components.filters.WhereHealthSelect,
      useFetchHealth,
    ],
    whereState: [
      builderOptions.filters.whereState,
      onWhereStateChange,
      labels.components.filters.WhereStateSelect,
      useFetchState,
    ],
    whereStatus: [
      builderOptions.filters.whereStatus,
      onWhereStatusChange,
      labels.components.filters.WhereStatusSelect,
      useFetchStatus,
    ],
  };
  return (
    <div data-testid="query-editor-section-builder">
      <div className={'gf-form ' + styles.QueryEditor.queryType}>
        <SelectForm
          datasource={datasource}
          filters={FiltersMap}
          builderOptions={builderOptions}
          onWithMetricChange={onWithMetricChange}
          onWithPropertyChange={onWithPropertyChange}
          onAdapterKindChange={onAdapterKindChange}
          onResourceKindChange={onResourceKindChange}
        />
      </div>
      <div>
        <CustomFilterForm changeFunction={onWithFiltersChange} builderOptions={builderOptions}></CustomFilterForm>
      </div>
      <div className={'gf-form ' + styles.QueryEditor.queryType}>
        <QueryTypeSwitcher queryType={builderOptions.queryType} onChange={onQueryTypeChange} />
      </div>

      {builderOptions.queryType === QueryType.Table && (
        <TableQueryBuilder
          datasource={datasource}
          builderOptions={builderOptions}
          builderOptionsDispatch={builderOptionsDispatch}
        />
      )}
      {builderOptions.queryType === QueryType.TimeSeries && (
        <TimeSeriesQueryBuilder
          datasource={datasource}
          builderOptions={builderOptions}
          builderOptionsDispatch={builderOptionsDispatch}
        />
      )}
    </div>
  );
};
