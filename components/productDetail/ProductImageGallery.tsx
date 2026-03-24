import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ProductImageGalleryProps {
  images: string[];
  activeImage: number;
  onImageSelect: (index: number) => void;
  onBack: () => void;
}

export default function ProductImageGallery({
  images,
  activeImage,
  onImageSelect,
  onBack,
}: ProductImageGalleryProps) {
  const { colors } = useTheme();

  return (
    <View style={{ position: 'relative' }}>
      <Image
        source={{ uri: images[activeImage] }}
        style={{ width, height: width * 0.85 }}
        resizeMode="cover"
      />

      <TouchableOpacity
        className="absolute top-4 left-4 w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onBack}
      >
        <ChevronLeft size={22} color="#fff" />
      </TouchableOpacity>

      {images.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
          {images.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => onImageSelect(i)}>
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
  );
}
