import React from 'react';
import { DataSource } from '../datasource';
import { QueryBuilderOptions } from '../types/queryBuilder';
import { BuilderOptionsReducerAction } from '../hooks/useBuilderOptionsState';

interface TimeSeriesQueryBuilderProps {
  datasource: DataSource;
  builderOptions: QueryBuilderOptions;
  builderOptionsDispatch: React.Dispatch<BuilderOptionsReducerAction>;
}

// interface TimeSeriesQueryBuilderState {
// }

export const TableQueryBuilder = (props: TimeSeriesQueryBuilderProps) => {
  // const { datasource, builderOptions, builderOptionsDispatch } = props;
  // const builderState: TimeSeriesQueryBuilderState = useMemo(() => ({
  // }), [builderOptions]);
  return <div></div>;
};
