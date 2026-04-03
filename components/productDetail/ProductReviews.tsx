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

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
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
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>{initials}</Text>
    </View>
  );
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const { colors } = useTheme();
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <Text style={{ fontSize: 11, color: colors.textSecondary, width: 10 }}>{star}</Text>
      <Star size={10} color="#F59E0B" fill="#F59E0B" />
      <View
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'timing', duration: 600, delay: (5 - star) * 80 }}
          style={{ height: 6, borderRadius: 3, backgroundColor: '#F59E0B' }}
        />
      </View>
      <Text style={{ fontSize: 11, color: colors.textSecondary, width: 18 }}>{count}</Text>
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
    <View style={{ gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            padding: 16,
            borderRadius: 16,
            backgroundColor: colors.surface,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Skeleton width={36} height={36} radius={18} />
            <View style={{ flex: 1, gap: 6 }}>
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
  const isLong = review.comment.length > 120;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 160, delay: Math.min(index * 60, 300) }}
      style={{
        padding: 16,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 10,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <Avatar name={review.user?.fullName ?? '?'} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
              {review.user?.fullName ?? 'Anonymous'}
            </Text>
            {isOwn && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <StarRow rating={review.rating} size={12} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>{timeAgo(review.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Title */}
      {review.title ? (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{review.title}</Text>
      ) : null}

      {/* Comment */}
      <Text style={{ fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>
        {isLong && !expanded ? `${review.comment.slice(0, 120)}…` : review.comment}
      </Text>

      {isLong && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>
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
    <View style={{ marginTop: 24, paddingHorizontal: 20, marginBottom: 24, gap: 16 }}>
      {/* Section header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>Reviews</Text>
          {reviews.length > 0 && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 100,
                backgroundColor: colors.primary + '18',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{reviews.length}</Text>
            </View>
          )}
        </View>
        {user && !hasOwnReview && !showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 100,
              backgroundColor: colors.primary,
            }}
          >
            <MessageSquare size={13} color="#fff" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Write a Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rating summary */}
      {!isLoading && reviews.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={{
            flexDirection: 'row',
            padding: 16,
            borderRadius: 20,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 16,
            alignItems: 'center',
          }}
        >
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 42, fontWeight: '800', color: colors.text, lineHeight: 48 }}>
              {average.toFixed(1)}
            </Text>
            <StarRow rating={Math.round(average)} size={14} />
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
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
          style={{ alignItems: 'center', paddingVertical: 32, gap: 10 }}
        >
          <Star size={40} color={colors.border} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>No reviews yet</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
            Be the first to share your experience with this product.
          </Text>
          {user && !showForm && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={{
                marginTop: 4,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 100,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Write a Review</Text>
            </TouchableOpacity>
          )}
        </MotiView>
      ) : (
        <View style={{ gap: 12 }}>
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
