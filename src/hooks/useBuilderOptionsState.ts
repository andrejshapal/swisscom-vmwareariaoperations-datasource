import {
  Collectors,
  CustomFilter,
  defaultBuilderQuery,
  Filters,
  Functions,
  QueryBuilderOptions,
  QueryType,
} from '../types/queryBuilder';

import { Reducer, useReducer } from 'react';

enum BuilderOptionsActionType {
  SetOptions = 'set_options',
  SetAllOptions = 'set_all_options',
  SetQueryType = 'set_query_type',

  SetAdapterKind = 'set_adapter_kind',
  SetResourceKind = 'set_resource_kind',
  SetResourceId = 'set_resource_id',

  SetWhereHealth = 'where_health',
  SetWhereState = 'where_state',
  SetWhereStatus = 'where_status',
  SetWhereTag = 'where_tag',

  SetWithMetric = 'with_metric',
  SetWithProperty = 'with_property',
  SetWithFilter = 'with_filter',
}

type QueryBuilderOptionsReducerAction = {
  type: BuilderOptionsActionType;
  payload: Partial<QueryBuilderOptions>;
};

type GenericReducerAction = {
  type: BuilderOptionsActionType;
  payload: any;
};

export type BuilderOptionsReducerAction = QueryBuilderOptionsReducerAction | GenericReducerAction;
const createAction = (
  type: BuilderOptionsActionType,
  payload: Partial<Functions | Filters | Collectors | QueryBuilderOptions | CustomFilter[]>
): BuilderOptionsReducerAction => ({
  type,
  payload,
});
export const setAllOptions = (options: QueryBuilderOptions): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetAllOptions, options);
export const setQueryType = (queryType: QueryType): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetQueryType, { queryType });
export const setAdapterKind = (adapterKind: string): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetAdapterKind, { adapterKind });
export const setResourceKind = (resourceKind: string): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetResourceKind, { resourceKind });
export const setWhereHealth = (whereHealth: string[]): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetWhereHealth, { whereHealth });
export const setWhereState = (whereState: string[]): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetWhereState, { whereState });
export const setWhereStatus = (whereStatus: string[]): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetWhereStatus, { whereStatus });
export const setWhereTag = (whereTag: string[]): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetWhereTag, { whereTag });
export const setWithMetric = (withMetric: string): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetWithMetric, { withMetric });
export const setWithProperty = (withProperty: string[]): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetWithProperty, { withProperty });
export const setWithFilters = (customFilters: CustomFilter[]): BuilderOptionsReducerAction =>
  createAction(BuilderOptionsActionType.SetWithFilter, { customFilters });

const reducer = (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
  const actionFn = actions.get(action.type);
  if (!actionFn) {
    throw Error('missing function for BuilderOptionsActionType: ' + action.type);
  }

  // console.log('ACTION:', action.type, 'PAYLOAD:', action.payload, 'PREV STATE:', state);
  return actionFn(state, action);
};

export const useBuilderOptionsState = (
  savedOptions: QueryBuilderOptions
): [QueryBuilderOptions, React.Dispatch<BuilderOptionsReducerAction>] => {
  const [state, dispatch] = useReducer<typeof reducer, QueryBuilderOptions>(reducer, savedOptions, buildInitialState);
  return [state as QueryBuilderOptions, dispatch];
};

const buildInitialState = (savedOptions?: Partial<QueryBuilderOptions>): QueryBuilderOptions => {
  const defaultOptions = defaultBuilderQuery.builderOptions;
  return {
    ...defaultOptions,
    ...savedOptions,
  };
};

const mergeBuilderOptionsState = (
  prevState: QueryBuilderOptions,
  nextState: Partial<QueryBuilderOptions>
): QueryBuilderOptions => {
  return {
    ...prevState,
    ...nextState,
  };
};

/**
 * A mapping between action type and reducer function, used in reducer to apply action changes.
 */
const actions = new Map<BuilderOptionsActionType, Reducer<QueryBuilderOptions, BuilderOptionsReducerAction>>([
  [
    BuilderOptionsActionType.SetOptions,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      // A catch-all action for applying option changes.
      const nextOptions = action.payload as Partial<QueryBuilderOptions>;
      return mergeBuilderOptionsState(state, nextOptions);
    },
  ],
  [
    BuilderOptionsActionType.SetAllOptions,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      // Resets existing state with provided options.
      const nextOptions = action.payload as Partial<QueryBuilderOptions>;
      return buildInitialState(nextOptions);
    },
  ],
  [
    BuilderOptionsActionType.SetQueryType,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      // If switching query type, reset the editor.
      const nextQueryType = action.payload.queryType;
      if (state.queryType !== nextQueryType) {
        return buildInitialState({
          ...state,
          queryType: nextQueryType,
        });
      }

      return state;
    },
  ],
  [
    BuilderOptionsActionType.SetAdapterKind,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const functions: Functions = {
        ...state.functions,
        adapterKind: action.payload.adapterKind,
      };
      return buildInitialState({
        functions: functions,
        collectors: state.collectors,
        filters: state.filters,
        customFilters: state.customFilters,
      });
    },
  ],
  [
    BuilderOptionsActionType.SetResourceKind,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const functions: Functions = {
        ...state.functions,
        resourceKind: action.payload.resourceKind,
      };
      return buildInitialState({
        functions: functions,
        collectors: state.collectors,
        filters: state.filters,
        customFilters: state.customFilters,
      });
    },
  ],

  [
    BuilderOptionsActionType.SetWhereHealth,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const filters: Filters = {
        ...state.filters,
        whereHealth: action.payload.whereHealth,
      };
      return buildInitialState({
        filters: filters,
        functions: state.functions,
        collectors: state.collectors,
        customFilters: state.customFilters,
      });
    },
  ],

  [
    BuilderOptionsActionType.SetWhereState,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const filters: Filters = {
        ...state.filters,
        whereState: action.payload.whereState,
      };
      return buildInitialState({
        filters: filters,
        functions: state.functions,
        collectors: state.collectors,
        customFilters: state.customFilters,
      });
    },
  ],

  [
    BuilderOptionsActionType.SetWhereStatus,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const filters: Filters = {
        ...state.filters,
        whereStatus: action.payload.whereStatus,
      };
      return buildInitialState({
        filters: filters,
        functions: state.functions,
        collectors: state.collectors,
        customFilters: state.customFilters,
      });
    },
  ],

  [
    BuilderOptionsActionType.SetWhereTag,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const filters: Filters = {
        ...state.filters,
        whereTag: action.payload.whereTag,
      };
      return buildInitialState({
        filters: filters,
        functions: state.functions,
        collectors: state.collectors,
        customFilters: state.customFilters,
      });
    },
  ],

  [
    BuilderOptionsActionType.SetWithProperty,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const collectors: Collectors = {
        ...state.collectors,
        withProperty: action.payload.withProperty,
      };
      return buildInitialState({
        collectors: collectors,
        functions: state.functions,
        filters: state.filters,
        customFilters: state.customFilters,
      });
    },
  ],
  [
    BuilderOptionsActionType.SetWithMetric,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      const functions: Functions = {
        ...state.functions,
        withMetric: action.payload.withMetric,
      };
      return buildInitialState({
        collectors: state.collectors,
        functions: functions,
        filters: state.filters,
        customFilters: state.customFilters,
      });
    },
  ],
  [
    BuilderOptionsActionType.SetWithFilter,
    (state: QueryBuilderOptions, action: BuilderOptionsReducerAction): QueryBuilderOptions => {
      return buildInitialState({
        collectors: state.collectors,
        functions: state.functions,
        filters: state.filters,
        customFilters: action.payload.customFilters,
      });
    },
  ],
]);
