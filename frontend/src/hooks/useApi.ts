import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { 
  Product, Client, Supplier, Order, DashboardStats, 
  SalesChartPoint, InventoryDistributionPoint, PaginatedResponse,
  TopClientPoint, TopProductPoint,
} from '../types';

// Auth API calls
export const useAuthMe = (enabled: boolean) => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get('/api/auth/me');
      return response.data;
    },
    enabled,
    retry: false,
  });
};

// Products hooks
interface GetProductsParams {
  page: number;
  limit: number;
  category?: string;
  stockStatus?: string;
  search?: string;
}

export const useProducts = (params: GetProductsParams) => {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', params],
    queryFn: async () => {
      const { page, limit, category, stockStatus, search } = params;
      const res = await api.get('/api/products', {
        params: {
          page,
          limit,
          category: category || undefined,
          stock_status: stockStatus || undefined,
          search: search || undefined,
        },
      });
      return res.data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id' | 'created_at'>) => {
      const res = await api.post('/api/products', newProduct);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
      const res = await api.put(`/api/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

// Suppliers (SRM) hooks
export const useSuppliers = (search?: string, activeOnly = true) => {
  return useQuery<Supplier[]>({
    queryKey: ['suppliers', search, activeOnly],
    queryFn: async () => {
      const res = await api.get('/api/suppliers', {
        params: {
          search: search || undefined,
          active_only: activeOnly,
        },
      });
      return res.data;
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSupplier: Omit<Supplier, 'id' | 'is_active' | 'created_at'>) => {
      const res = await api.post('/api/suppliers', newSupplier);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Supplier> }) => {
      const res = await api.put(`/api/suppliers/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

// Clients hooks
export const useClients = (search?: string) => {
  return useQuery<Client[]>({
    queryKey: ['clients', search],
    queryFn: async () => {
      const res = await api.get('/api/clients', {
        params: { search: search || undefined },
      });
      return res.data;
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newClient: Omit<Client, 'id' | 'is_active' | 'created_at'>) => {
      const res = await api.post('/api/clients', newClient);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

// Orders hooks
interface GetOrdersParams {
  page: number;
  limit: number;
  status?: string;
  clientId?: number;
}

export const useOrders = (params: GetOrdersParams) => {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { page, limit, status, clientId } = params;
      const res = await api.get('/api/orders', {
        params: {
          page,
          limit,
          status: status || undefined,
          client_id: clientId || undefined,
        },
      });
      return res.data;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData: { client_id: number; items: { product_id: number; quantity: number }[] }) => {
      const res = await api.post('/api/orders', orderData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await api.put(`/api/orders/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

// Stats hooks
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/stats/dashboard');
      return res.data;
    },
  });
};

export const useSalesChart = (days: number = 30) => {
  return useQuery<SalesChartPoint[]>({
    queryKey: ['stats', 'sales-chart', days],
    queryFn: async () => {
      const res = await api.get('/api/stats/sales-chart', {
        params: { days },
      });
      return res.data;
    },
  });
};

export const useInventoryDistribution = () => {
  return useQuery<InventoryDistributionPoint[]>({
    queryKey: ['stats', 'inventory-distribution'],
    queryFn: async () => {
      const res = await api.get('/api/stats/inventory-distribution');
      return res.data;
    },
  });
};

export const useTopClients = (limit = 5) => {
  return useQuery<TopClientPoint[]>({
    queryKey: ['stats', 'top-clients', limit],
    queryFn: async () => {
      const res = await api.get('/api/stats/top-clients', { params: { limit } });
      return res.data;
    },
  });
};

export const useTopProducts = (limit = 5) => {
  return useQuery<TopProductPoint[]>({
    queryKey: ['stats', 'top-products', limit],
    queryFn: async () => {
      const res = await api.get('/api/stats/top-products', { params: { limit } });
      return res.data;
    },
  });
};
