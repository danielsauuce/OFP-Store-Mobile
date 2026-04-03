import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
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

  // Average rating from reviews
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
    if (!user) { router.push('/auth'); return; }
    if (!product) return;
    setWishlistLoading(true);
    try {
      if (inWishlist) await removeFromWishlist(product._id);
      else await addToWishlist(product._id);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      Alert.alert('Added to Cart', `${product.name} added successfully`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const images = product.images.length > 0 ? product.images : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Full-bleed image */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: IMAGE_HEIGHT }}>
        <MotiView
          key={activeImage}
          from={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 280 }}
          style={{ flex: 1 }}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: 'rgba(255,255,255,0.92)',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
            }}
          >
            <ChevronLeft size={22} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWishlist}
            disabled={wishlistLoading}
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: 'rgba(255,255,255,0.92)',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
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
        style={{ flex: 1 }}
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
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 14, paddingBottom: 4 }}>
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
          <View style={{ alignItems: 'center', paddingTop: images.length > 1 ? 0 : 14 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>

          {/* Product info */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 14 }}>
            {/* Name + price */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 350 }}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                  {product.category}
                </Text>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', lineHeight: 30 }}>
                  {product.name}
                </Text>
              </View>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>
                {formatCurrency(product.price)}
              </Text>
            </MotiView>

            {/* Short description */}
            {product.description && (
              <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22 }} numberOfLines={2}>
                {product.description}
              </Text>
            )}

            {/* Rating row */}
            {avgRating && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{avgRating}</Text>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        color={s <= Math.round(Number(avgRating)) ? '#F59E0B' : colors.border}
                        fill={s <= Math.round(Number(avgRating)) ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    ({reviews.length})
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                  See All reviews
                </Text>
              </View>
            )}

            {/* Stock + quantity */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View
                style={{
                  paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100,
                  backgroundColor: product.inStock ? colors.success + '18' : colors.error + '18',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: product.inStock ? colors.success : colors.error }}>
                  {product.inStock ? `In Stock · ${product.stockQuantity} left` : 'Out of Stock'}
                </Text>
              </View>

              {product.inStock && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      width: 32, height: 32, borderRadius: 10,
                      borderWidth: 1, borderColor: colors.border,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Minus size={14} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, minWidth: 20, textAlign: 'center' }}>
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    style={{
                      width: 32, height: 32, borderRadius: 10,
                      backgroundColor: colors.primary,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Plus size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Material / Dimensions */}
            {(product.material || product.dimensions) && (
              <View style={{ gap: 6, padding: 16, borderRadius: 16, backgroundColor: colors.surfaceVariant }}>
                {product.material && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>Material</Text>
                    <Text style={{ fontSize: 13, color: colors.text }}>{product.material}</Text>
                  </View>
                )}
                {product.dimensions && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>Dimensions</Text>
                    <Text style={{ fontSize: 13, color: colors.text }}>{product.dimensions}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Full description */}
            {product.description && (
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Description</Text>
                <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textSecondary }}>
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

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: colors.background,
          borderTopWidth: 1, borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 }}>
          {/* Cart icon button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={!product.inStock || adding}
            style={{
              width: 52, height: 52, borderRadius: 14,
              borderWidth: 1.5, borderColor: product.inStock ? colors.border : colors.border + '60',
              alignItems: 'center', justifyContent: 'center',
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
            style={{
              flex: 1, height: 52, borderRadius: 14,
              backgroundColor: product.inStock ? (isDark ? colors.primary : '#111') : colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {adding ? 'Adding…' : product.inStock ? 'Buy Now' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
