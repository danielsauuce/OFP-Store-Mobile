import FloatButton from '@/components/productDetail/FloatButton';
import ImageDots from '@/components/productDetail/ImageDots';
import ProductReviews from '@/components/productDetail/ProductReviews';
import QuantityControl from '@/components/productDetail/QuantityControl';
import RelatedProducts from '@/components/productDetail/RelatedProducts';
import SpecRow from '@/components/productDetail/SpecRow';
import StarRating from '@/components/productDetail/StarRating';
import StockBadge from '@/components/productDetail/StockBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getAllProductsService, getProductByIdService } from '@/services/productService';
import { getProductReviewsService } from '@/services/reviewService';
import { formatCurrency } from '@/utils/formatCurrency';
import { normalizeProduct, NormalizedProduct } from '@/utils/normalizeProduct';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, ShoppingBag } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    staleTime: 3 * 60 * 1000,
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
    staleTime: 3 * 60 * 1000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id, 'summary'],
    queryFn: async () => {
      const res = await getProductReviewsService(id);
      return res?.reviews ?? res?.data ?? res ?? [];
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
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
        Alert.alert('Wishlist', 'Removed from wishlist');
      } else {
        await addToWishlist(product._id);
        Alert.alert('Wishlist', 'Added to wishlist!');
      }
    } catch {
      Alert.alert('Error', 'Could not update wishlist. Try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      Alert.alert('Cart', `${product.name} added to cart!`);
    } catch {
      Alert.alert('Error', 'Could not add to cart. Please try again.');
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

  const specs = [
    product.material ? { label: 'Material', value: product.material } : null,
    product.dimensions ? { label: 'Dimensions', value: product.dimensions } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Full-bleed image */}
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
          <FloatButton onPress={() => router.back()}>
            <ChevronLeft size={22} color="#111" />
          </FloatButton>

          <FloatButton onPress={handleWishlist} disabled={wishlistLoading}>
            <Heart
              size={20}
              color={inWishlist ? colors.error : '#111'}
              fill={inWishlist ? colors.error : 'transparent'}
            />
          </FloatButton>
        </View>
      </SafeAreaView>

      {/* Scrollable card overlapping image */}
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
          <ImageDots count={images.length} active={activeImage} onPress={setActiveImage} />

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
            {avgRating !== null && (
              <View className="flex-row items-center justify-between">
                <StarRating rating={avgRating} count={reviews.length} />
                <Text className="text-[13px] font-semibold" style={{ color: colors.primary }}>
                  See All reviews
                </Text>
              </View>
            )}

            {/* Stock + quantity */}
            <View className="flex-row items-center justify-between">
              <StockBadge inStock={product.inStock} stockQuantity={product.stockQuantity} />
              {product.inStock && (
                <QuantityControl
                  quantity={quantity}
                  max={product.stockQuantity}
                  onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
                  onIncrement={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                />
              )}
            </View>

            {/* Specs (Material / Dimensions) */}
            {specs.length > 0 && (
              <View className="gap-1.5 p-4 rounded-2xl" style={{ backgroundColor: colors.surfaceVariant }}>
                {specs.map((spec) => (
                  <SpecRow key={spec.label} label={spec.label} value={spec.value} />
                ))}
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

          <ProductReviews productId={id} />

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
