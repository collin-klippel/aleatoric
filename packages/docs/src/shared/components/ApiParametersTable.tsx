import type { ApiParameter } from '../lib/docs-api-reference-types';
import ApiEnumTable from './ApiEnumTable';

interface ApiParametersTableProps {
  parameters?: ApiParameter[];
}

export default function ApiParametersTable({
  parameters,
}: ApiParametersTableProps) {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className="api-parameters-section">
      <h4 className="api-section-title">Parameters</h4>
      <table className="api-parameters-table">
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name} className="api-param-row">
              <td className="api-param-name">
                <code>{param.name}</code>
              </td>
              <td className="api-param-info">
                {param.type && (
                  <div className="api-param-type">
                    <code className="type-annotation">{param.type}</code>
                  </div>
                )}
                <div className="api-param-description">{param.description}</div>
                <ApiEnumTable
                  values={param.enumValues}
                  title={`Allowed values for \`${param.name}\``}
                  variant="compact"
                />
                {param.default && (
                  <div className="api-param-default">
                    Default: <code>{param.default}</code>
                  </div>
                )}
                {param.required && (
                  <div className="api-param-required">Required</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
