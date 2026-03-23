import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { getProductByIdService } from '@/services/productService';
import { addToCartService } from '@/services/cartService';
import ProductGrid from '@/components/product/ProductGrid';
import { getAllProductsService } from '@/services/productService';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  stockQuantity: number;
  description?: string;
  material?: string;
  dimensions?: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductByIdService(id)
      .then((res) => {
        const p: Product = res.product ?? res;
        setProduct(p);
        return getAllProductsService({ category: p.category, limit: 4 });
      })
      .then((res) => {
        const products: Product[] = res.products ?? res ?? [];
        setRelated(products.filter((p) => p._id !== id).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await addToCartService(product._id, quantity);
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

  if (loading) {
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
        {/* Image gallery */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: product.images[activeImage] }}
            style={{ width, height: width * 0.85 }}
            resizeMode="cover"
          />

          {/* Back button */}
          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onPress={() => router.back()}
          >
            <ChevronLeft size={22} color="#fff" />
          </TouchableOpacity>

          {/* Image dots */}
          {product.images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {product.images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i === activeImage ? colors.primary : 'rgba(255,255,255,0.6)',
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Details */}
        <View className="px-5 pt-5 gap-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-xs font-bold uppercase opacity-50 mb-1" style={{ color: colors.text }}>
                {product.category}
              </Text>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {product.name}
              </Text>
            </View>
            <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
              {formatCurrency(product.price)}
            </Text>
          </View>

          {/* Stock status */}
          <View
            className="self-start px-3 py-1 rounded-full"
            style={{
              backgroundColor: product.inStock ? colors.success + '20' : colors.error + '20',
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: product.inStock ? colors.success : colors.error }}
            >
              {product.inStock ? `In Stock (${product.stockQuantity} left)` : 'Out of Stock'}
            </Text>
          </View>

          {/* Description */}
          {product.description && (
            <Text className="text-sm leading-6" style={{ color: colors.textSecondary }}>
              {product.description}
            </Text>
          )}

          {/* Specs */}
          {(product.material || product.dimensions) && (
            <View className="p-4 rounded-2xl gap-2" style={{ backgroundColor: colors.surfaceVariant }}>
              {product.material && (
                <View className="flex-row justify-between">
                  <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                    Material
                  </Text>
                  <Text className="text-sm" style={{ color: colors.text }}>
                    {product.material}
                  </Text>
                </View>
              )}
              {product.dimensions && (
                <View className="flex-row justify-between">
                  <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                    Dimensions
                  </Text>
                  <Text className="text-sm" style={{ color: colors.text }}>
                    {product.dimensions}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Quantity */}
          <View className="flex-row items-center gap-4 mt-2">
            <Text className="font-semibold" style={{ color: colors.text }}>
              Quantity
            </Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                className="w-9 h-9 rounded-full border items-center justify-center"
                style={{ borderColor: colors.border }}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} color={colors.text} />
              </TouchableOpacity>
              <Text className="text-base font-bold w-6 text-center" style={{ color: colors.text }}>
                {quantity}
              </Text>
              <TouchableOpacity
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
                onPress={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
              >
                <Plus size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Related products */}
        {related.length > 0 && (
          <View className="mt-6 mb-4">
            <Text className="text-lg font-bold px-5 mb-3" style={{ color: colors.text }}>
              Related Products
            </Text>
            <ProductGrid products={related} onPress={(relId) => router.push(`/product/${relId}`)} />
          </View>
        )}
      </ScrollView>

      {/* Add to Cart button */}
      <View
        className="px-5 py-4 border-t"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <TouchableOpacity
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
          style={{
            backgroundColor: product.inStock ? colors.primary : colors.border,
          }}
          onPress={handleAddToCart}
          disabled={!product.inStock || adding}
        >
          <ShoppingCart size={20} color="#fff" />
          <Text className="text-white font-bold text-base">
            {adding ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
