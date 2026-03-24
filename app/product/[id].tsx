import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getProductByIdService, getAllProductsService } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import ProductImageGallery from '@/components/productDetail/ProductImageGallery';
import ProductInfo from '@/components/productDetail/ProductInfo';
import ProductQuantitySelector from '@/components/productDetail/ProductQuantitySelector';
import RelatedProducts from '@/components/productDetail/RelatedProducts';
import ProductReviews from '@/components/productDetail/ProductReviews';
import AddToCartBar from '@/components/productDetail/AddToCartBar';

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
  const { addToCart } = useCart();

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
