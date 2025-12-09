import { styles } from 'styles';
import { EditorTypeSwitcher } from '../components/EditorTypeSwitcher';
import { Button } from '@grafana/ui';
import { AriaQuery, defaultBuilderQuery, EditorType, vROPsQueryEditorProps } from '../types/queryBuilder';
import React, { useEffect, useRef } from 'react';
import { pluginVersion } from '@grafana/schema/dist/esm/raw/composable/logs/panelcfg/x/LogsPanelCfg_types.gen';
import { generateQuery, migrateQuery } from '../data/queryGenerator';
import { setAllOptions, useBuilderOptionsState } from '../hooks/useBuilderOptionsState';
import { isBuilderOptionsRunnable, mapQueryBuilderOptionsToGrafanaFormat } from '../data/utils';
import { QueryBuilder } from '../components/queryBuilder/QueryBuilder';
import { CustomEditor } from '../components/CustomEditor';

/**
 * Top level query editor component
 */
export const QueryEditor = (props: vROPsQueryEditorProps) => {
  const { datasource, query: savedQuery, onRunQuery } = props;
  const query = migrateQuery(savedQuery);

  return (
    <>
      <div className={'gf-form ' + styles.QueryEditor.queryType}>
        <EditorTypeSwitcher {...props} query={query} datasource={datasource} />
        <Button onClick={() => onRunQuery()}>Run Query</Button>
      </div>
      <EditorByType {...props} query={query} />
    </>
  );
};

const EditorByType = (props: vROPsQueryEditorProps) => {
  const { query, onChange, app } = props;
  const [builderOptions, builderOptionsDispatch] = useBuilderOptionsState((query as AriaQuery).builderOptions);

  /**
   * Grafana will sometimes replace the builder options directly, so we need to sync in both directions.
   * For example, selecting an entry from the query history will cause the local state to fall out of sync.
   * The "key" property is present on these historical entries.
   */
  const queryKey = query.key || '';
  const lastKey = useRef<string>(queryKey);
  if (queryKey !== lastKey.current && query.editorType === EditorType.Builder) {
    builderOptionsDispatch(setAllOptions(defaultBuilderQuery.builderOptions || {}));
    lastKey.current = queryKey;
  }

  /**
   * Sync builder options when switching from Custom Editor to Query Builder
   */
  const lastEditorType = useRef<EditorType>();
  if (query.editorType !== lastEditorType.current && query.editorType === EditorType.Builder) {
    builderOptionsDispatch(setAllOptions(defaultBuilderQuery.builderOptions || {}));
  }
  lastEditorType.current = query.editorType;

  // Prevent trying to run empty query on load
  const shouldSkipChanges = useRef<boolean>(true);
  if (isBuilderOptionsRunnable(builderOptions)) {
    shouldSkipChanges.current = false;
  }
  useEffect(() => {
    if (shouldSkipChanges.current || query.editorType === EditorType.Custom) {
      return;
    }
    onChange({
      ...query,
      pluginVersion,
      editorType: EditorType.Builder,
      rawQuery: generateQuery(builderOptions),
      builderOptions: builderOptions,
      format: mapQueryBuilderOptionsToGrafanaFormat(builderOptions),
    });

    // TODO: fix dependency warning with "useEffectEvent" once added to stable version of react
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderOptions]);

  if (query.editorType === EditorType.Custom) {
    return (
      <div data-testid="query-editor-section-custom">
        <CustomEditor {...props} />
      </div>
    );
  }

  return (
    <QueryBuilder
      datasource={props.datasource}
      builderOptions={builderOptions}
      builderOptionsDispatch={builderOptionsDispatch}
      generatedQuery={query.rawQuery}
      app={app}
    />
  );
};
