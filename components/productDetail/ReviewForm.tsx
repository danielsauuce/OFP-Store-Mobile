import { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { createReviewService, updateReviewService } from '@/services/reviewService';

interface EditingReview {
  _id: string;
  rating: number;
  title?: string;
  content: string;
}

interface ReviewFormProps {
  productId: string;
  editingReview?: EditingReview | null;
  onCancelEdit?: () => void;
  onSubmitted: () => void;
}

const LABELS = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

export default function ReviewForm({ productId, editingReview, onCancelEdit, onSubmitted }: ReviewFormProps) {
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentFocused, setContentFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setTitle(editingReview.title ?? '');
      setContent(editingReview.content);
    } else {
      setRating(0);
      setTitle('');
      setContent('');
    }
  }, [editingReview]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (editingReview) {
        return updateReviewService(editingReview._id, {
          rating,
          title: title.trim(),
          content: content.trim(),
        });
      }
      return createReviewService({
        product: productId,
        rating,
        title: title.trim(),
        content: content.trim(),
      });
    },
    onSuccess: () => {
      setRating(0);
      setTitle('');
      setContent('');
      onSubmitted();
    },
    onError: (e: unknown) => {
      const axiosMsg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const message = axiosMsg ?? (e instanceof Error ? e.message : 'Could not submit review');
      Alert.alert('Error', message);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Review required', 'Please write your experience.');
      return;
    }
    submitMutation.mutate();
  };

  const displayRating = hovered || rating;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      style={{
        padding: 20,
        borderRadius: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 16,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
          {editingReview ? 'Edit Your Review' : 'Write a Review'}
        </Text>
        {onCancelEdit && (
          <Pressable
            onPress={onCancelEdit}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={14} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Star picker */}
      <View style={{ alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPressIn={() => setHovered(star)}
              onPressOut={() => setHovered(0)}
              onPress={() => setRating(star)}
            >
              <MotiView
                animate={{ scale: star <= displayRating ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                <Star
                  size={34}
                  color={star <= displayRating ? '#F59E0B' : colors.border}
                  fill={star <= displayRating ? '#F59E0B' : 'transparent'}
                />
              </MotiView>
            </Pressable>
          ))}
        </View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: displayRating > 0 ? '#F59E0B' : colors.textSecondary,
            minHeight: 18,
          }}
        >
          {displayRating > 0 ? LABELS[displayRating] : 'Tap to rate'}
        </Text>
      </View>

      {/* Title input */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
          Title <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>(optional)</Text>
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          onFocus={() => setTitleFocused(true)}
          onBlur={() => setTitleFocused(false)}
          placeholder="Summarise your experience"
          placeholderTextColor={colors.textTertiary}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
            fontSize: 14,
            backgroundColor: colors.background,
            borderWidth: 1.5,
            borderColor: titleFocused ? colors.primary : colors.border,
            color: colors.text,
          }}
        />
      </View>

      {/* Content input */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>Review</Text>
          <Text style={{ fontSize: 11, color: content.length > 450 ? colors.error : colors.textSecondary }}>
            {content.length}/500
          </Text>
        </View>
        <TextInput
          value={content}
          onChangeText={(t) => setContent(t.slice(0, 500))}
          onFocus={() => setContentFocused(true)}
          onBlur={() => setContentFocused(false)}
          placeholder="What did you like or dislike? How was the quality?"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
            fontSize: 14,
            backgroundColor: colors.background,
            borderWidth: 1.5,
            borderColor: contentFocused ? colors.primary : colors.border,
            color: colors.text,
            minHeight: 100,
          }}
        />
      </View>

      {/* Submit */}
      <Pressable onPress={handleSubmit} disabled={submitMutation.isPending}>
        <MotiView
          animate={{
            backgroundColor: submitMutation.isPending ? colors.border : colors.primary,
            scale: submitMutation.isPending ? 0.98 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            height: 50,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
            {submitMutation.isPending ? 'Submitting…' : editingReview ? 'Update Review' : 'Submit Review'}
          </Text>
        </MotiView>
      </Pressable>
    </MotiView>
  );
}
