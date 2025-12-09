import React, { ChangeEvent } from 'react';
import { Checkbox, InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { AriaSourceOptions, AriaSecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<AriaSourceOptions, AriaSecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const { jsonData, secureJsonFields, secureJsonData } = options;
  jsonData.authSource = jsonData.authSource || 'LOCAL';
  const onHostChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        host: event.target.value,
      },
    });
  };

  const onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        username: event.target.value,
      },
    });
  };

  const onAuthSourceChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        authSource: event.target.value,
      },
    });
  };

  const onTlsSkipVerifyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        tlsSkipVerify: event.target.checked,
      },
    });
  };

  // Secure field (only sent to the backend)
  const onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        password: event.target.value,
      },
    });
  };

  const onResetPassword = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        password: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        password: '',
      },
    });
  };

  return (
    <>
      <InlineField label="Host" labelWidth={22} interactive tooltip={'Aria Operations Host or IP'}>
        <Input
          id="config-editor-host"
          onChange={onHostChange}
          value={jsonData.host}
          placeholder="Enter the hostname, e.g. http://example.com"
          width={40}
        />
      </InlineField>
      <InlineField label="Authentication Source" labelWidth={22} interactive tooltip={'Aria Operations Host or IP'}>
        <Input
          id="config-editor-path"
          onChange={onAuthSourceChange}
          value={jsonData.authSource || 'LOCAL'}
          placeholder="Enter the name of authentication source, e.g. LOCAL"
          width={40}
        />
      </InlineField>
      <InlineField label="Username" labelWidth={22} interactive tooltip={'Aria Operations User Name'}>
        <Input
          id="config-editor-username"
          onChange={onUsernameChange}
          value={jsonData.username}
          placeholder="Enter the username, e.g. grafanaServiceAccount"
          width={40}
        />
      </InlineField>
      <InlineField label="Password" labelWidth={22} interactive tooltip={'Aria Operations Username Password'}>
        <SecretInput
          required
          id="config-editor-api-key"
          isConfigured={secureJsonFields.password}
          value={secureJsonData?.password}
          placeholder="Enter username password"
          width={40}
          onReset={onResetPassword}
          onChange={onPasswordChange}
        />
      </InlineField>
      <InlineField label="Skip TLS verify" labelWidth={22} interactive tooltip={'UNSAFE: Skip TLS verification'}>
        <Checkbox id="config-editor-path" onChange={onTlsSkipVerifyChange} checked={jsonData.tlsSkipVerify} />
      </InlineField>
    </>
  );
}
