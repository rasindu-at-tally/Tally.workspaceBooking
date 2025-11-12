import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deskApi } from '@/lib/api';
import type { CreateDeskRequest, UpdateDeskRequest } from '@/types';

export function useDesks(location?: string, isActive?: boolean) {
  return useQuery({
    queryKey: ['desks', location, isActive],
    queryFn: () => deskApi.getAll(location, isActive),
  });
}

export function useDesk(id: string) {
  return useQuery({
    queryKey: ['desks', id],
    queryFn: () => deskApi.getById(id),
    enabled: !!id,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['desk-locations'],
    queryFn: deskApi.getLocations,
  });
}

export function useCreateDesk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeskRequest) => deskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desks'] });
      queryClient.invalidateQueries({ queryKey: ['desk-locations'] });
    },
  });
}

export function useUpdateDesk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeskRequest }) =>
      deskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desks'] });
    },
  });
}

export function useDeleteDesk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desks'] });
    },
  });
}

