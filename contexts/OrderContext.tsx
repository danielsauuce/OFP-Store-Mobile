import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  getUserOrdersService,
  getOrderByIdService,
  createOrderService,
  cancelOrderService,
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

interface OrderContextType {
  orders: Order[];
  pagination: OrdersPagination | null;
  loading: boolean;
  fetchOrders: (page?: number, limit?: number, status?: string) => Promise<void>;
  getOrder: (orderId: string) => Promise<Order>;
  createOrder: (orderData: Record<string, unknown>) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrdersPagination | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async (page: number = 1, limit: number = 10, status?: string) => {
    setLoading(true);
    try {
      const res = await getUserOrdersService(page, limit, status);
      // Sort newest first
      const fetched: Order[] = res.orders ?? res ?? [];
      setOrders(
        [...fetched].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
      if (res.pagination) setPagination(res.pagination);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = async (orderId: string): Promise<Order> => {
    const res = await getOrderByIdService(orderId);
    return res.order ?? res;
  };

  const createOrder = async (orderData: Record<string, unknown>): Promise<Order> => {
    const res = await createOrderService(orderData);
    const newOrder: Order = res.order ?? res;
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const cancelOrder = async (orderId: string) => {
    await cancelOrderService(orderId);
    setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o)));
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        pagination,
        loading,
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
