import React from 'react';
import { View } from 'react-native';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
}

interface Props {
  products: Product[];
  onPress: (id: string) => void;
}

export default function ProductGrid({ products = [], onPress }: Props) {
  return (
    <View className="flex-row flex-wrap justify-between px-5 gap-y-3">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} index={index} onPress={() => onPress(product._id)} />
      ))}
    </View>
  );
}
