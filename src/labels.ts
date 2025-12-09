export interface Labels {
  label: string;
  tooltip: string;
  empty: string;
}
export default {
  components: {
    EditorTypeSwitcher: {
      label: 'Editor Type',
      tooltip: 'Switches between the raw Editor and the Query Builder.',
      switcher: {
        title: 'Are you sure?',
        body: 'Queries that are too complex for the Query Builder will be altered.',
        confirmText: 'Continue',
        dismissText: 'Cancel',
      },
      cannotConvert: {
        title: 'Cannot convert',
        message: 'Do you want to delete your current query and use the query builder?',
        confirmText: 'Yes',
      },
    },
    QueryTypeSwitcher: {
      label: 'Query Type',
      tooltip: 'Sets the layout for the query builder',
      queryTooltip: 'Sets the panel type for explore view',
    },
    functions: {
      AdapterKindSelect: {
        label: 'Adapter Kind',
        tooltip: 'Adapter Kind to use in query',
        empty: '<select adapter kind>',
      },
      ResourceKindSelect: {
        label: 'Resource Kind',
        tooltip: 'Resource Kind to use in query',
        empty: '<select resource kind>',
      },
    },
    filters: {
      WhereHealthSelect: {
        label: 'Where Health',
        tooltip: 'Health criteria for filtering',
        empty: '<select health>',
      },
      WhereStateSelect: {
        label: 'Where State',
        tooltip: 'State criteria for filtering',
        empty: '<select state>',
      },
      WhereStatusSelect: {
        label: 'Where Status',
        tooltip: 'Status criteria for filtering',
        empty: '<select status>',
      },
      WhereTagSelect: {
        label: 'Where Tag',
        tooltip: 'Tag criteria for filtering',
        empty: '<select tag>',
      },
    },
    collectors: {
      WithMetricSelect: {
        label: 'With Metric',
        tooltip: 'Metric collector criteria',
        empty: '<select metric>',
      },
      WithPropertySelect: {
        label: 'With Property',
        tooltip: 'Property collector criteria',
        empty: '<select property>',
      },
    },
  },

  types: {
    EditorType: {
      custom: 'Custom Editor',
      builder: 'Query Builder',
    },
    QueryType: {
      table: 'Table',
      timeseries: 'Time Series',
    },
  },
};
