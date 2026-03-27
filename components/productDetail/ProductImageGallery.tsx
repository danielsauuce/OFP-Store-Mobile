import { View, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
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
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={{ position: 'relative' }}
    >
      <MotiView
        key={activeImage}
        from={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <Image
          source={{ uri: images[activeImage] ?? images[0] }}
          style={{ width, height: width * 0.85 }}
          contentFit="cover"
        />
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateX: -10 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 350, delay: 120 }}
        className="absolute top-4 left-4"
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={onBack}
        >
          <ChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
      </MotiView>

      {images.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
          {images.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => onImageSelect(i)}>
              <MotiView
                animate={{
                  width: i === activeImage ? 18 : 8,
                  backgroundColor: i === activeImage ? colors.primary : 'rgba(255,255,255,0.6)',
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                style={{ height: 8, borderRadius: 4 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </MotiView>
  );
}
