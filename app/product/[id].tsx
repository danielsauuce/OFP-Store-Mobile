import React, { useState } from 'react';
import { ScrollView, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { getProductByIdService, getAllProductsService } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import { normalizeProduct, NormalizedProduct } from '@/utils/normalizeProduct';
import ProductImageGallery from '@/components/productDetail/ProductImageGallery';
import ProductInfo from '@/components/productDetail/ProductInfo';
import ProductQuantitySelector from '@/components/productDetail/ProductQuantitySelector';
import RelatedProducts from '@/components/productDetail/RelatedProducts';
import ProductReviews from '@/components/productDetail/ProductReviews';
import AddToCartBar from '@/components/productDetail/AddToCartBar';

type Product = NormalizedProduct;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

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
      const res = await getAllProductsService({ category: product!.category, limit: 4 });
      const raw = res?.data?.products ?? res?.products ?? res?.data ?? res ?? [];
      return (Array.isArray(raw) ? raw : [])
        .map(normalizeProduct)
        .filter((p) => p._id !== id)
        .slice(0, 4);
    },
    enabled: !!product?.category,
    staleTime: 5 * 60 * 1000,
  });

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
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProductImageGallery
          images={product.images}
          activeImage={activeImage}
          onImageSelect={setActiveImage}
          onBack={() => router.back()}
        />
        <ProductInfo
          name={product.name}
          category={product.category}
          price={product.price}
          inStock={product.inStock}
          stockQuantity={product.stockQuantity}
          description={product.description}
          material={product.material}
          dimensions={product.dimensions}
        />
        <ProductQuantitySelector
          quantity={quantity}
          maxQuantity={product.stockQuantity}
          onChange={setQuantity}
        />
        <RelatedProducts products={related} onPress={(relId) => router.push(`/product/${relId}`)} />
        <ProductReviews productId={id} />
      </ScrollView>
      <AddToCartBar inStock={product.inStock} adding={adding} onAddToCart={handleAddToCart} />
    </SafeAreaView>
  );
}
