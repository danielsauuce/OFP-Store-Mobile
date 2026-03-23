import React from 'react';
import { View } from 'react-native';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, onPress }) {
  return (
    <View className="flex-row flex-wrap justify-between px-5 gap-y-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onPress={() => onPress(product.id)} />
      ))}
    </View>
  );
}
