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

type CloudinaryImage = { secure_url?: string; secureUrl?: string; url?: string };

function resolveImageUrl(img: unknown): string {
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object') {
    const o = img as CloudinaryImage;
    return o.secure_url ?? o.secureUrl ?? o.url ?? '';
  }
  return '';
}

export interface OrderProduct {
  _id: string;
  name: string;
  images: string[];
}

export interface OrderItem {
  product: OrderProduct;
  quantity: number;
  price: number;
  nameSnapshot?: string;
  imageSnapshot?: string;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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

// Normalise a raw order from the server into our Order shape.
// Server returns orderStatus (not status) and product images as Cloudinary objects.
function normalizeOrder(raw: Record<string, unknown>): Order {
  const rawItems = (raw.items as Record<string, unknown>[] | undefined) ?? [];
  const items: OrderItem[] = rawItems.map((item) => {
    const rawProduct = (item.product ?? {}) as Record<string, unknown>;
    // Extract images from product.images or product.primaryImage
    // imageSnapshot is a pre-resolved Cloudinary URL stored on the order item at creation time.
    // It is the most reliable image source — the product's primaryImage field in order responses
    // is an unpopulated ObjectId (not a Media doc), so resolving it produces a garbage ID string.
    // Prioritise imageSnapshot, then fall back to any valid HTTP URLs in the product's images array.
    const imageSnapshot = typeof item.imageSnapshot === 'string' ? item.imageSnapshot : undefined;
    const rawImages = (rawProduct.images as unknown[]) ?? [];
    const resolvedImages: string[] = rawImages
      .map(resolveImageUrl)
      .filter((u) => u.startsWith('http'));
    const images: string[] = imageSnapshot
      ? [imageSnapshot]
      : resolvedImages.length > 0
        ? resolvedImages
        : [];

    return {
      product: { _id: String(rawProduct._id ?? ''), name: String(rawProduct.name ?? ''), images },
      quantity: Number(item.quantity ?? 1),
      price: Number(item.priceSnapshot ?? item.price ?? 0),
      nameSnapshot: typeof item.nameSnapshot === 'string' ? item.nameSnapshot : undefined,
      imageSnapshot,
    };
  });

  const pagination = raw.pagination as Record<string, unknown> | undefined;

  return {
    _id: String(raw._id ?? ''),
    orderNumber: raw.orderNumber ? String(raw.orderNumber) : undefined,
    items,
    // Server field is orderStatus; fall back to status for compatibility
    status: (raw.orderStatus ?? raw.status) as Order['status'],
    subtotal: Number(raw.subtotal ?? 0),
    shippingFee: Number(raw.shippingCost ?? raw.shippingFee ?? 0),
    total: Number(raw.total ?? 0),
    createdAt: String(raw.createdAt ?? ''),
    note: raw.notes ? String(raw.notes) : raw.note ? String(raw.note) : undefined,
  };
  void pagination; // pagination lives at the response level, not per-order
}

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
      const rawOrders: Record<string, unknown>[] = res.orders ?? res ?? [];
      const orders = rawOrders
        .map(normalizeOrder)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Pagination — server returns { total, page, pages, limit } or { totalPages, ... }
      const pg = res.pagination ?? null;
      const pagination: OrdersPagination | null = pg
        ? {
            page: Number(pg.page ?? pg.currentPage ?? 1),
            limit: Number(pg.limit ?? queryParams.limit),
            total: Number(pg.total ?? 0),
            totalPages: Number(pg.pages ?? pg.totalPages ?? 1),
          }
        : null;

      return { orders, pagination };
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000,
  });

  const fetchOrders = async (page: number = 1, limit: number = 10, status?: string) => {
    setQueryParams({ page, limit, status });
    await queryClient.invalidateQueries({ queryKey: orderKeys.all });
  };

  const getOrder = async (orderId: string): Promise<Order> => {
    const res = await getOrderByIdService(orderId);
    const raw = res.order ?? res;
    return normalizeOrder(raw as Record<string, unknown>);
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
    return normalizeOrder((res.order ?? res) as Record<string, unknown>);
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
