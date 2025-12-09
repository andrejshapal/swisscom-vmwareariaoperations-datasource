import React from 'react';
import { Combobox, ComboboxOption, InlineField, MultiCombobox, Stack } from '@grafana/ui';
import { Labels } from 'labels';
import { DataSource } from '../../datasource';
import { KeyValue } from '../../types';
import { MultiChangeFunction, SingleChangeFunction, UseFetch } from '../utils';
import { Filters, QueryBuilderOptions } from '../../types/queryBuilder';
import useFetchMetricsPropertiesTags from '../../hooks/useFetchMetricsPropertiesTags';
import labels from '../../labels';
import useFetchAdapterResourceKinds from '../../hooks/useFetchAdapterResourceKinds';

export type SingleSelectProps = {
  datasource: DataSource;
  value: string;
  changeFunction: SingleChangeFunction;
  labels: Labels;
  useFetch: UseFetch;
  builderOptions: QueryBuilderOptions;
};

export type MultiSelectProps = {
  datasource: DataSource;
  values: string[];
  changeFunction: MultiChangeFunction;
  labels: Labels;
  useFetch: UseFetch;
  builderOptions: QueryBuilderOptions;
};

export const MultiSelect = (props: MultiSelectProps) => {
  const { datasource, changeFunction, labels, useFetch, values, builderOptions } = props;
  const resourceKinds = useFetch(datasource, builderOptions);
  const { label, tooltip } = labels;

  // console.log(resourceKinds)
  const options = resourceKinds.map((t: any) => ({ label: t, value: t }));

  // Include saved value in case it's no longer listed
  values?.map((value) => {
    if (values && !options.some((option) => option.value === value)) {
      options.push({ label: value, value: value });
    }
  });

  return (
    <InlineField labelWidth={17} label={label} tooltip={tooltip}>
      <MultiCombobox
        options={options}
        value={values}
        onChange={(e: Array<ComboboxOption<string>>) => {
          return changeFunction(e.map((v) => v.value));
        }}
        width="auto"
        minWidth={25}
        maxWidth={68}
        createCustomValue={true}
        isClearable={true}
      />
    </InlineField>
  );
};

export type MultiSelectMetricPropertyTagProps = {
  fetchedOptions: string[];
  values: string[];
  changeFunction: MultiChangeFunction;
  labels: Labels;
};

export const MultiSelectMetricPropertyTag = (props: MultiSelectMetricPropertyTagProps) => {
  const { changeFunction, labels, values, fetchedOptions } = props;
  const { label, tooltip } = labels;

  // console.log(resourceKinds)
  const options = fetchedOptions.map((t: any) => ({ label: t, value: t }));

  // Include saved value in case it's no longer listed
  values?.map((value) => {
    if (values && !options.some((option) => option.value === value)) {
      options.push({ label: value, value: value });
    }
  });

  return (
    <InlineField labelWidth={17} label={label} tooltip={tooltip}>
      <MultiCombobox
        options={options}
        value={values}
        onChange={(e: Array<ComboboxOption<string>>) => {
          return changeFunction(e.map((v) => v.value));
        }}
        width="auto"
        minWidth={25}
        maxWidth={68}
        createCustomValue={true}
        isClearable={true}
      />
    </InlineField>
  );
};

export type SingleSelectAdapterResourceKindProps = {
  fetchedOptions: string[];
  value: string;
  changeFunction: SingleChangeFunction;
  labels: Labels;
};

export const SingleSelectAdapterResourceKind = (props: SingleSelectAdapterResourceKindProps) => {
  const { changeFunction, labels, value, fetchedOptions } = props;
  const { label, tooltip } = labels;
  const options:
    | Array<ComboboxOption<string>>
    | ((inputValue: string) => Promise<Array<ComboboxOption<string>>>)
    | Array<{ label: any; value: any }> = [];
  if (fetchedOptions) {
    fetchedOptions.map((t: any) => options.push({ label: t, value: t }));
  }
  if (value && !options.some((option) => option.value === value)) {
    options.push({ label: value, value: value });
  }

  return (
    <InlineField labelWidth={17} label={label} tooltip={tooltip}>
      <Combobox
        options={options}
        value={value && value.length > 0 ? value : ''}
        onChange={(e) => {
          return changeFunction(e?.value!);
        }}
        width={25}
        isClearable={true}
        createCustomValue={true}
      />
    </InlineField>
  );
};

export type AdapterResourceKindProps = {
  datasource: DataSource;
  builderOptions: QueryBuilderOptions;
  onAdapterKindChange: SingleChangeFunction;
  onResourceKindChange: SingleChangeFunction;
};

export const AdapterResourceKind = (props: AdapterResourceKindProps) => {
  const { datasource, builderOptions, onAdapterKindChange, onResourceKindChange } = props;
  const adapterResourceKinds = useFetchAdapterResourceKinds(datasource);
  const adapterKinds = Object.keys(adapterResourceKinds);
  let resourceKinds: string[] = [];
  if (builderOptions.functions.adapterKind) {
    resourceKinds = adapterResourceKinds[builderOptions.functions.adapterKind];
  } else {
    resourceKinds = resourceKinds.concat(...Object.values(adapterResourceKinds));
  }

  return (
    <>
      <SingleSelectAdapterResourceKind
        labels={labels.components.functions.AdapterKindSelect}
        fetchedOptions={adapterKinds}
        changeFunction={onAdapterKindChange}
        value={builderOptions.functions.adapterKind}
      />
      <SingleSelectAdapterResourceKind
        labels={labels.components.functions.ResourceKindSelect}
        fetchedOptions={resourceKinds}
        changeFunction={onResourceKindChange}
        value={builderOptions.functions.resourceKind}
      />
    </>
  );
};

export type MetricPropertyTagProps = {
  datasource: DataSource;
  builderOptions: QueryBuilderOptions;
  onWithMetricChange: SingleChangeFunction;
  onWithPropertyChange: MultiChangeFunction;
};

export const MetricPropertyTag = (props: MetricPropertyTagProps) => {
  const { datasource, builderOptions, onWithMetricChange, onWithPropertyChange } = props;
  const [metrics, properties] = useFetchMetricsPropertiesTags(datasource, builderOptions);

  return (
    <>
      <SingleSelectAdapterResourceKind
        labels={labels.components.collectors.WithMetricSelect}
        fetchedOptions={metrics}
        changeFunction={onWithMetricChange}
        value={builderOptions.functions.withMetric}
      />
      <MultiSelectMetricPropertyTag
        labels={labels.components.collectors.WithPropertySelect}
        fetchedOptions={properties}
        changeFunction={onWithPropertyChange}
        values={builderOptions.collectors.withProperty || []}
      />
    </>
  );
};

export type SelectFormProps = {
  datasource: DataSource;
  filters: KeyValue<[string | string[], MultiChangeFunction, Labels, UseFetch]>;
  builderOptions: QueryBuilderOptions;
  onWithMetricChange: SingleChangeFunction;
  onWithPropertyChange: MultiChangeFunction;
  onAdapterKindChange: SingleChangeFunction;
  onResourceKindChange: SingleChangeFunction;
};

export const SelectForm = (props: SelectFormProps) => {
  const {
    datasource,
    filters,
    builderOptions,
    onWithMetricChange,
    onWithPropertyChange,
    onAdapterKindChange,
    onResourceKindChange,
  } = props;
  return (
    <Stack direction="row" wrap="wrap" alignItems="start" justifyContent="start" gap={0}>
      <AdapterResourceKind
        datasource={datasource}
        builderOptions={builderOptions}
        onAdapterKindChange={onAdapterKindChange}
        onResourceKindChange={onResourceKindChange}
      />
      <MetricPropertyTag
        datasource={datasource}
        builderOptions={builderOptions}
        onWithMetricChange={onWithMetricChange}
        onWithPropertyChange={onWithPropertyChange}
      />
      {Object.keys(filters).map((name) => (
        <MultiSelect
          datasource={datasource}
          builderOptions={builderOptions}
          values={builderOptions.filters[name as keyof Filters] || []}
          changeFunction={filters[name][1]}
          key={name}
          labels={filters[name][2]}
          useFetch={filters[name][3]}
        />
      ))}
    </Stack>
  );
};
