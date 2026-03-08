import type { EnumValue } from '../lib/docs-api-reference-types';

interface ApiEnumTableProps {
  values?: EnumValue[];
  /** Defaults to "Allowed values". */
  title?: string;
  variant?: 'default' | 'compact';
}

export default function ApiEnumTable({
  values,
  title = 'Allowed values',
  variant = 'default',
}: ApiEnumTableProps) {
  if (!values || values.length === 0) return null;

  const HeadingTag = variant === 'compact' ? 'h5' : 'h4';
  const sectionClass =
    variant === 'compact'
      ? 'api-enum-section api-enum-section--compact'
      : 'api-enum-section';
  const titleClass =
    variant === 'compact' ? 'api-enum-inline-title' : 'api-section-title';
  const tableClass =
    variant === 'compact'
      ? 'api-enum-table api-enum-table--compact'
      : 'api-enum-table';

  return (
    <div className={sectionClass}>
      <HeadingTag className={titleClass}>{title}</HeadingTag>
      <table className={tableClass}>
        <tbody>
          {values.map((enumValue) => (
            <tr key={enumValue.value} className="api-enum-row">
              <td className="api-enum-value">
                <code>{enumValue.value}</code>
              </td>
              {enumValue.description && (
                <td className="api-enum-description">
                  {enumValue.description}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
