import React from 'react';
import { RadioButtonGroup, InlineFormLabel } from '@grafana/ui';
import labels from 'labels';
import { QueryType } from 'types/queryBuilder';

export interface QueryTypeSwitcherProps {
    queryType: QueryType;
    onChange: (queryType: QueryType) => void;
    customEditor?: boolean;
};

const options = [
    {
        label: labels.types.QueryType.table,
        value: QueryType.Table,
    },
    {
        label: labels.types.QueryType.timeseries,
        value: QueryType.TimeSeries,
    },
];

/**
 * Component for switching between the different query builder interfaces
 */
export const QueryTypeSwitcher = (props: QueryTypeSwitcherProps) => {
    const { queryType, onChange, customEditor } = props;
    const { label, tooltip, queryTooltip } = labels.components.QueryTypeSwitcher;

    return (
        <span>
      <InlineFormLabel width={8} className="query-keyword" tooltip={customEditor ? queryTooltip : tooltip}>
        {label}
      </InlineFormLabel>
      <RadioButtonGroup options={options} value={queryType} onChange={onChange} />
    </span>
    );
};