import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Star, Pencil, Trash2 } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProductReviewsService, deleteReviewService } from '@/services/reviewService';
import ReviewForm from './ReviewForm';

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  user: { _id?: string; fullName: string };
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export const reviewKeys = {
  byProduct: (productId: string) => ['reviews', productId] as const,
};

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
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const { data: reviews = [], isLoading: loading } = useQuery<Review[]>({
    queryKey: reviewKeys.byProduct(productId),
    queryFn: async () => {
      const res = await getProductReviewsService(productId);
      const list: Review[] = res?.reviews ?? res?.data ?? res ?? [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReviewService(reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) }),
    onError: () => Alert.alert('Error', 'Could not delete review'),
  });

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(reviewId),
      },
    ]);
  };

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
          {reviews.map((review) => {
            const isOwn = user && review.user?._id === user.id;
            return (
              <View
                key={review._id}
                className="p-4 rounded-2xl gap-1"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                    {review.user?.fullName ?? 'Anonymous'}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <StarDisplay rating={review.rating} />
                    {isOwn && (
                      <View className="flex-row items-center gap-2 ml-2">
                        <TouchableOpacity
                          onPress={() => setEditingReview(review)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Pencil size={14} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteReview(review._id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2 size={14} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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
            );
          })}
        </View>
      )}

      {user && (
        <ReviewForm
          productId={productId}
          editingReview={editingReview}
          onCancelEdit={() => setEditingReview(null)}
          onSubmitted={() => {
            setEditingReview(null);
            queryClient.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
          }}
        />
      )}
    </View>
  );
}
