import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProductReviewsService } from '@/services/reviewService';
import ReviewForm from './ReviewForm';

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  user: { fullName: string };
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

function StarDisplay({ rating }: { rating: number }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          color={s <= rating ? '#F59E0B' : colors.border}
          fill={s <= rating ? '#F59E0B' : 'transparent'}
        />
      ))}
    </View>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await getProductReviewsService(productId);
      const list: Review[] = res?.reviews ?? res?.data ?? res ?? [];
      setReviews(Array.isArray(list) ? list : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const average =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <View className="mt-6 px-5 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
        </Text>
        {average && (
          <View className="flex-row items-center gap-1">
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text className="font-bold text-sm" style={{ color: colors.text }}>
              {average}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : reviews.length === 0 ? (
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          No reviews yet. Be the first to review!
        </Text>
      ) : (
        <View className="gap-3">
          {reviews.map((review) => (
            <View
              key={review._id}
              className="p-4 rounded-2xl gap-1"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                  {review.user?.fullName ?? 'Anonymous'}
                </Text>
                <StarDisplay rating={review.rating} />
              </View>
              {review.title && (
                <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                  {review.title}
                </Text>
              )}
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {review.comment}
              </Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {user && (
        <ReviewForm
          productId={productId}
          onSubmitted={() => {
            setLoading(true);
            fetchReviews();
          }}
        />
      )}
    </View>
  );
}
