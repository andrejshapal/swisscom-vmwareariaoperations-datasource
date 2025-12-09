import React, { useState } from 'react';
import { SelectableValue } from '@grafana/data';
import { RadioButtonGroup, ConfirmModal, InlineFormLabel } from '@grafana/ui';
import { defaultBuilderQuery, EditorType, AriaQuery, QueryBuilderOptions } from 'types/queryBuilder';
import { getQueryOptionsFromCustom, mapQueryTypeToGrafanaFormat } from './queryBuilder/utils';
import { generateQuery } from '../data/queryGenerator';
import { DataSource } from '../datasource';
import labels from 'labels';

interface EditorTypeSwitcherProps {
  query: AriaQuery;
  onChange: (query: AriaQuery) => void;
  onRunQuery: () => void;
  datasource?: DataSource;
}

const options: Array<SelectableValue<EditorType>> = [
  { label: labels.types.EditorType.custom, value: EditorType.Custom },
  { label: labels.types.EditorType.builder, value: EditorType.Builder },
];

/**
 * Component for switching between the Custom and Query Builder editors.
 */
export const EditorTypeSwitcher = (props: EditorTypeSwitcherProps) => {
  const { datasource, query, onChange } = props;
  const { label, tooltip, switcher, cannotConvert } = labels.components.EditorTypeSwitcher;
  const editorType: EditorType = query.editorType || EditorType.Builder;
  const [confirmModalState, setConfirmModalState] = useState<boolean>(false);
  const [cannotConvertModalState, setCannotConvertModalState] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const onEditorTypeChange = (editorType: EditorType, confirmed = false) => {
    if (query.editorType === EditorType.Custom && editorType === EditorType.Builder && !confirmed) {
      try {
        getQueryOptionsFromCustom(query.rawQuery, query.queryType, datasource);
        setConfirmModalState(true);
      } catch (err) {
        setCannotConvertModalState(true);
        setErrorMessage((err as Error).message);
      }
    } else {
      let builderOptions: QueryBuilderOptions;
      switch (query.editorType) {
        case EditorType.Custom:
          try {
            builderOptions = getQueryOptionsFromCustom(
              query.rawQuery,
              query.queryType,
              datasource
            ) as QueryBuilderOptions;
          } catch (err) {
            builderOptions = defaultBuilderQuery.builderOptions;
          }
          break;
        default:
          builderOptions = query.builderOptions;
          break;
      }
      onChange({
        ...query,
        builderOptions: builderOptions,
        editorType: editorType,
        queryType: builderOptions.queryType,
        rawQuery: generateQuery(builderOptions),
        format: mapQueryTypeToGrafanaFormat(builderOptions.queryType),
      });
    }
  };

  const onConfirmEditorTypeChange = () => {
    onEditorTypeChange(EditorType.Builder, true);
    setConfirmModalState(false);
    setCannotConvertModalState(false);
  };
  return (
    <span>
      <InlineFormLabel width={8} className="query-keyword" tooltip={tooltip}>
        {label}
      </InlineFormLabel>
      <RadioButtonGroup options={options} value={editorType} onChange={(e) => onEditorTypeChange(e)} />
      <ConfirmModal
        isOpen={confirmModalState}
        title={switcher.title}
        body={switcher.body}
        confirmText={switcher.confirmText}
        dismissText={switcher.dismissText}
        icon="exclamation-triangle"
        onConfirm={onConfirmEditorTypeChange}
        onDismiss={() => setConfirmModalState(false)}
      />
      <ConfirmModal
        title={cannotConvert.title}
        body={`${errorMessage}\n${cannotConvert.message}`}
        isOpen={cannotConvertModalState}
        icon="exclamation-triangle"
        onConfirm={onConfirmEditorTypeChange}
        confirmText={switcher.confirmText}
        onDismiss={() => setCannotConvertModalState(false)}
      />
    </span>
  );
};
