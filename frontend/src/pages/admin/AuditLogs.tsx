import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { formatDateTime } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function AuditLogs() {
  const { data: logs = [], isLoading } = useAuditLogs({ limit: 100 });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">Track all system actions and changes</p>
        </div>

        {/* Logs Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-600">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {logs.map((log) => (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {log.user ? (
                          <div>
                            <div className="font-medium">{log.user.full_name}</div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">System</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {log.entity_type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          onClick={() =>
                            setExpandedLog(expandedLog === log.id ? null : log.id)
                          }
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                        >
                          {expandedLog === log.id ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              View
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50 px-6 py-4">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Entity ID: </span>
                              <span className="font-mono text-xs text-gray-600">
                                {log.entity_id}
                              </span>
                            </div>
                            {log.ip_address && (
                              <div>
                                <span className="font-medium text-gray-700">IP Address: </span>
                                <span className="text-gray-600">{log.ip_address}</span>
                              </div>
                            )}
                            {log.metadata && (
                              <div>
                                <span className="font-medium text-gray-700">Metadata: </span>
                                <pre className="mt-1 overflow-auto rounded bg-gray-100 p-2 text-xs">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

