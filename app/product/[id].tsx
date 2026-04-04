import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MotiView } from 'moti';
import { ChevronLeft, Heart, Star, ShoppingBag, Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { getProductByIdService, getAllProductsService } from '@/services/productService';
import { getProductReviewsService } from '@/services/reviewService';
import { normalizeProduct, NormalizedProduct } from '@/utils/normalizeProduct';
import { formatCurrency } from '@/utils/formatCurrency';
import RelatedProducts from '@/components/productDetail/RelatedProducts';
import ProductReviews from '@/components/productDetail/ProductReviews';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.58;

type Product = NormalizedProduct;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { data: product, isLoading } = useQuery<Product | null>({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await getProductByIdService(id);
      return normalizeProduct(res.product ?? res);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: related = [] } = useQuery<Product[]>({
    queryKey: ['products', 'related', product?.category, id],
    queryFn: async () => {
      const res = await getAllProductsService({ category: product!.category, limit: 5 });
      const raw = res?.data?.products ?? res?.products ?? res?.data ?? res ?? [];
      return (Array.isArray(raw) ? raw : [])
        .map(normalizeProduct)
        .filter((p) => p._id !== id)
        .slice(0, 4);
    },
    enabled: !!product?.category,
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id, 'summary'],
    queryFn: async () => {
      const res = await getProductReviewsService(id);
      return res?.reviews ?? res?.data ?? res ?? [];
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const inWishlist = product ? isInWishlist(product._id) : false;

  const handleWishlist = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    if (!product) return;
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
        showToast('Removed from wishlist', 'info');
      } else {
        await addToWishlist(product._id);
        showToast('Added to wishlist!', 'success');
      }
    } catch {
      showToast('Could not update wishlist. Try again.', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      showToast(`${product.name} added to cart!`, 'success');
    } catch {
      showToast('Could not add to cart. Please try again.', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.text }}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = product.images.length > 0 ? product.images : [];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Full-bleed image — height is dynamic so must stay inline */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: IMAGE_HEIGHT }}>
        <MotiView
          key={activeImage}
          from={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 280 }}
          className="flex-1"
        >
          <Image
            source={{ uri: images[activeImage] ?? images[0] }}
            style={{ width, height: IMAGE_HEIGHT }}
            contentFit="cover"
          />
        </MotiView>
      </View>

      {/* Floating back + wishlist buttons */}
      <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <View className="flex-row justify-between items-center px-5 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-[42px] h-[42px] rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <ChevronLeft size={22} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWishlist}
            disabled={wishlistLoading}
            className="w-[42px] h-[42px] rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Heart
              size={20}
              color={inWishlist ? colors.error : '#111'}
              fill={inWishlist ? colors.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Scrollable white card that overlaps the image */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingTop: IMAGE_HEIGHT - 28 }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            minHeight: height - IMAGE_HEIGHT + 28,
          }}
        >
          {/* Dot indicators */}
          {images.length > 1 && (
            <View className="flex-row justify-center gap-1.5 pt-3.5 pb-1">
              {images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <MotiView
                    animate={{
                      width: i === activeImage ? 20 : 7,
                      backgroundColor: i === activeImage ? colors.primary : colors.border,
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                    style={{ height: 7, borderRadius: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Drag handle */}
          <View className="items-center" style={{ paddingTop: images.length > 1 ? 0 : 14 }}>
            <View className="w-9 h-1 rounded-full" style={{ backgroundColor: colors.border }} />
          </View>

          {/* Product info */}
          <View className="px-6 pt-5 gap-3.5">
            {/* Name + price */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 350 }}
              className="flex-row justify-between items-start"
            >
              <View className="flex-1 mr-4">
                <Text
                  className="text-xs font-semibold uppercase tracking-[0.8px] mb-1"
                  style={{ color: colors.textSecondary }}
                >
                  {product.category}
                </Text>
                <Text className="font-extrabold" style={{ color: colors.text, fontSize: 24, lineHeight: 30 }}>
                  {product.name}
                </Text>
              </View>
              <Text className="font-extrabold text-2xl" style={{ color: colors.text }}>
                {formatCurrency(product.price)}
              </Text>
            </MotiView>

            {/* Short description */}
            {product.description && (
              <Text
                className="text-sm leading-[22px]"
                style={{ color: colors.textSecondary }}
                numberOfLines={2}
              >
                {product.description}
              </Text>
            )}

            {/* Rating row */}
            {avgRating && (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[15px] font-bold" style={{ color: colors.text }}>
                    {avgRating}
                  </Text>
                  <View className="flex-row gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        color={s <= Math.round(Number(avgRating)) ? '#F59E0B' : colors.border}
                        fill={s <= Math.round(Number(avgRating)) ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                  </View>
                  <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
                    ({reviews.length})
                  </Text>
                </View>
                <Text className="text-[13px] font-semibold" style={{ color: colors.primary }}>
                  See All reviews
                </Text>
              </View>
            )}

            {/* Stock + quantity */}
            <View className="flex-row items-center justify-between">
              <View
                className="px-3 py-[5px] rounded-full"
                style={{
                  backgroundColor: product.inStock ? colors.success + '18' : colors.error + '18',
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: product.inStock ? colors.success : colors.error }}
                >
                  {product.inStock ? `In Stock · ${product.stockQuantity} left` : 'Out of Stock'}
                </Text>
              </View>

              {product.inStock && (
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-[10px] border items-center justify-center"
                    style={{ borderColor: colors.border }}
                  >
                    <Minus size={14} color={colors.text} />
                  </TouchableOpacity>
                  <Text
                    className="text-[15px] font-bold text-center min-w-[20px]"
                    style={{ color: colors.text }}
                  >
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    className="w-8 h-8 rounded-[10px] items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Plus size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Material / Dimensions */}
            {(product.material || product.dimensions) && (
              <View className="gap-1.5 p-4 rounded-2xl" style={{ backgroundColor: colors.surfaceVariant }}>
                {product.material && (
                  <View className="flex-row justify-between">
                    <Text className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>
                      Material
                    </Text>
                    <Text className="text-[13px]" style={{ color: colors.text }}>
                      {product.material}
                    </Text>
                  </View>
                )}
                {product.dimensions && (
                  <View className="flex-row justify-between">
                    <Text className="text-[13px] font-medium" style={{ color: colors.textSecondary }}>
                      Dimensions
                    </Text>
                    <Text className="text-[13px]" style={{ color: colors.text }}>
                      {product.dimensions}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Full description */}
            {product.description && (
              <View className="gap-2">
                <Text className="text-base font-bold" style={{ color: colors.text }}>
                  Description
                </Text>
                <Text className="text-sm leading-[22px]" style={{ color: colors.textSecondary }}>
                  {product.description}
                </Text>
              </View>
            )}
          </View>

          {/* Reviews */}
          <ProductReviews productId={id} />

          {/* Related Products */}
          {related.length > 0 && (
            <RelatedProducts products={related} onPress={(relId) => router.push(`/product/${relId}`)} />
          )}

          <View className="h-[120px]" />
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View className="flex-row items-center gap-3 px-6 pt-3 pb-2">
          {/* Cart icon button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!product.inStock || adding}
            className="w-[52px] h-[52px] rounded-[14px] items-center justify-center"
            style={{
              borderWidth: 1.5,
              borderColor: product.inStock ? colors.border : colors.border + '60',
              backgroundColor: colors.surface,
              opacity: product.inStock ? 1 : 0.4,
            }}
          >
            <ShoppingBag size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Buy Now */}
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!product.inStock || adding}
            className="flex-1 h-[52px] rounded-[14px] items-center justify-center"
            style={{
              backgroundColor: product.inStock ? (isDark ? colors.primary : '#111') : colors.border,
            }}
          >
            <Text className="text-white text-base font-bold">
              {adding ? 'Adding…' : product.inStock ? 'Buy Now' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
