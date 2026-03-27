import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserOrdersService,
  getOrderByIdService,
  createOrderService,
  cancelOrderService,
  OrderCreatePayload,
} from '@/services/orderService';

export interface OrderProduct {
  _id: string;
  name: string;
  images: string[];
}

export interface OrderItem {
  product: OrderProduct;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  note?: string;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface OrderQueryParams {
  page: number;
  limit: number;
  status?: string;
}

interface OrderContextType {
  orders: Order[];
  pagination: OrdersPagination | null;
  loading: boolean;
  fetchOrders: (page?: number, limit?: number, status?: string) => Promise<void>;
  getOrder: (orderId: string) => Promise<Order>;
  createOrder: (orderData: OrderCreatePayload) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
}

export const orderKeys = {
  all: ['orders'] as const,
  list: (page: number, limit: number, status?: string) => ['orders', 'list', page, limit, status] as const,
};

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState<OrderQueryParams>({ page: 1, limit: 10 });

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: orderKeys.all });
    }
  }, [user, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: orderKeys.list(queryParams.page, queryParams.limit, queryParams.status),
    queryFn: async () => {
      const res = await getUserOrdersService(queryParams.page, queryParams.limit, queryParams.status);
      const fetched: Order[] = res.orders ?? res ?? [];
      return {
        orders: [...fetched].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
        pagination: res.pagination ?? null,
      };
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const fetchOrders = async (page: number = 1, limit: number = 10, status?: string) => {
    setQueryParams({ page, limit, status });
    await queryClient.invalidateQueries({ queryKey: orderKeys.all });
  };

  const getOrder = async (orderId: string): Promise<Order> => {
    const res = await getOrderByIdService(orderId);
    return res.order ?? res;
  };

  const createMutation = useMutation({
    mutationFn: (orderData: OrderCreatePayload) => createOrderService(orderData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => cancelOrderService(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });

  const createOrder = async (orderData: OrderCreatePayload): Promise<Order> => {
    const res = await createMutation.mutateAsync(orderData);
    return res.order ?? res;
  };

  const cancelOrder = async (orderId: string) => {
    await cancelMutation.mutateAsync(orderId);
  };

  return (
    <OrderContext.Provider
      value={{
        orders: data?.orders ?? [],
        pagination: data?.pagination ?? null,
        loading: isLoading,
        fetchOrders,
        getOrder,
        createOrder,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within an OrderProvider');
  return ctx;
};
