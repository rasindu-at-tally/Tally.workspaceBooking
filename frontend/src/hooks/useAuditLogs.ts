import { useQuery } from '@tanstack/react-query';
import { auditLogApi } from '@/lib/api';

export function useAuditLogs(params?: {
  user_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogApi.getAll(params),
  });
}



