import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Star, Pencil, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getProductReviewsService, deleteReviewService } from '@/services/reviewService';
import Skeleton from '@/components/ui/Skeleton';
import ReviewForm from './ReviewForm';

interface Review {
  _id: string;
  rating: number;
  content: string;
  user: { _id?: string; fullName: string };
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export const reviewKeys = {
  byProduct: (productId: string) => ['reviews', productId] as const,
};

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          color={s <= rating ? '#F59E0B' : '#D1D5DB'}
          fill={s <= rating ? '#F59E0B' : 'transparent'}
        />
      ))}
    </View>
  );
}

function Avatar({ name }: { name: string }) {
  const { colors } = useTheme();
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      className="w-9 h-9 rounded-full items-center justify-center"
      style={{ backgroundColor: colors.primary + '22' }}
    >
      <Text className="text-[13px] font-bold" style={{ color: colors.primary }}>
        {initials}
      </Text>
    </View>
  );
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const { colors } = useTheme();
  const pct = total > 0 ? count / total : 0;
  return (
    <View className="flex-row items-center gap-2 mb-1">
      <Text className="text-[11px] w-2.5" style={{ color: colors.textSecondary }}>
        {star}
      </Text>
      <Star size={10} color="#F59E0B" fill="#F59E0B" />
      <View className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'timing', duration: 600, delay: (5 - star) * 80 }}
          style={{ height: 6, borderRadius: 3, backgroundColor: '#F59E0B' }}
        />
      </View>
      <Text className="text-[11px] w-[18px]" style={{ color: colors.textSecondary }}>
        {count}
      </Text>
    </View>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function ReviewSkeleton() {
  const { colors } = useTheme();
  return (
    <View className="gap-3">
      {[0, 1, 2].map((i) => (
        <View key={i} className="p-4 rounded-2xl gap-2.5" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center gap-2.5">
            <Skeleton width={36} height={36} radius={18} />
            <View className="flex-1 gap-1.5">
              <Skeleton width="50%" height={12} radius={6} />
              <Skeleton width="30%" height={10} radius={5} />
            </View>
          </View>
          <Skeleton width="90%" height={11} radius={5} />
          <Skeleton width="70%" height={11} radius={5} />
        </View>
      ))}
    </View>
  );
}

function ReviewCard({
  review,
  isOwn,
  index,
  onEdit,
  onDelete,
  deleting,
}: {
  review: Review;
  isOwn: boolean;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isLong = review.content.length > 120;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 160, delay: Math.min(index * 60, 300) }}
      className="p-4 rounded-[20px] gap-2.5"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header row */}
      <View className="flex-row items-start gap-2.5">
        <Avatar name={review.user?.fullName ?? '?'} />
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold" style={{ color: colors.text }}>
              {review.user?.fullName ?? 'Anonymous'}
            </Text>
            {isOwn && (
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Pencil size={14} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onDelete}
                  disabled={deleting}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={14} color={deleting ? colors.border : colors.error} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-2 mt-[3px]">
            <StarRow rating={review.rating} size={12} />
            <Text className="text-[11px]" style={{ color: colors.textSecondary }}>
              {timeAgo(review.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text className="text-[13px] leading-5" style={{ color: colors.textSecondary }}>
        {isLong && !expanded ? `${review.content.slice(0, 120)}…` : review.content}
      </Text>

      {isLong && (
        <TouchableOpacity onPress={() => setExpanded((v) => !v)} className="flex-row items-center gap-1">
          <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
          {expanded ? (
            <ChevronUp size={12} color={colors.primary} />
          ) : (
            <ChevronDown size={12} color={colors.primary} />
          )}
        </TouchableOpacity>
      )}
    </MotiView>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
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

  const handleDelete = (reviewId: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(reviewId) },
    ]);
  };

  const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const hasOwnReview = user ? reviews.some((r) => r.user?._id === user.id) : false;

  return (
    <View className="mt-6 px-5 mb-6 gap-4">
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-extrabold" style={{ color: colors.text }}>
            Reviews
          </Text>
          {reviews.length > 0 && (
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.primary + '18' }}>
              <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                {reviews.length}
              </Text>
            </View>
          )}
        </View>
        {user && !hasOwnReview && !showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="flex-row items-center gap-1.5 px-3.5 py-[7px] rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <MessageSquare size={13} color="#fff" />
            <Text className="text-xs font-bold text-white">Write a Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating summary */}
      {!isLoading && reviews.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="flex-row p-4 rounded-[20px] gap-4 items-center"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="items-center gap-1">
            <Text className="font-extrabold" style={{ fontSize: 42, color: colors.text, lineHeight: 48 }}>
              {average.toFixed(1)}
            </Text>
            <StarRow rating={Math.round(average)} size={14} />
            <Text className="text-[11px] mt-0.5" style={{ color: colors.textSecondary }}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          <View className="flex-1">
            {dist.map((d) => (
              <RatingBar key={d.star} star={d.star} count={d.count} total={reviews.length} />
            ))}
          </View>
        </MotiView>
      )}

      {/* Review form (write or edit) */}
      {user && (showForm || editingReview) && (
        <ReviewForm
          productId={productId}
          editingReview={editingReview}
          onCancelEdit={() => {
            setEditingReview(null);
            setShowForm(false);
          }}
          onSubmitted={() => {
            setEditingReview(null);
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: reviewKeys.byProduct(productId) });
          }}
        />
      )}

      {/* List */}
      {isLoading ? (
        <ReviewSkeleton />
      ) : reviews.length === 0 ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          className="items-center py-8 gap-2.5"
        >
          <Star size={40} color={colors.border} />
          <Text className="text-[15px] font-bold" style={{ color: colors.text }}>
            No reviews yet
          </Text>
          <Text className="text-[13px] text-center" style={{ color: colors.textSecondary }}>
            Be the first to share your experience with this product.
          </Text>
          {user && !showForm && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="mt-1 px-5 py-2.5 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-[13px] font-bold text-white">Write a Review</Text>
            </TouchableOpacity>
          )}
        </MotiView>
      ) : (
        <View className="gap-3">
          {reviews.map((review, index) => (
            <ReviewCard
              key={review._id}
              review={review}
              isOwn={!!(user && review.user?._id === user.id)}
              index={index}
              onEdit={() => {
                setEditingReview(review);
                setShowForm(false);
              }}
              onDelete={() => handleDelete(review._id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === review._id}
            />
          ))}
        </View>
      )}
    </View>
  );
}
