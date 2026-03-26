import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createReviewService, updateReviewService } from '@/services/reviewService';

interface EditingReview {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
}

interface ReviewFormProps {
  productId: string;
  editingReview?: EditingReview | null;
  onCancelEdit?: () => void;
  onSubmitted: () => void;
}

export default function ReviewForm({ productId, editingReview, onCancelEdit, onSubmitted }: ReviewFormProps) {
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setTitle(editingReview.title ?? '');
      setComment(editingReview.comment);
    } else {
      setRating(0);
      setTitle('');
      setComment('');
    }
  }, [editingReview]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }
    setSubmitting(true);
    try {
      if (editingReview) {
        await updateReviewService(editingReview._id, {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });
        Alert.alert('Updated', 'Your review has been updated.');
      } else {
        await createReviewService({ productId, rating, title: title.trim(), comment: comment.trim() });
        Alert.alert('Thank you!', 'Your review has been submitted.');
      }
      setRating(0);
      setTitle('');
      setComment('');
      onSubmitted();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not submit review';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="px-5 mt-4 gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold" style={{ color: colors.text }}>
          {editingReview ? 'Edit Review' : 'Write a Review'}
        </Text>
        {editingReview && onCancelEdit && (
          <TouchableOpacity onPress={onCancelEdit}>
            <Text className="text-sm font-semibold" style={{ color: colors.error }}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Star picker */}
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Star
              size={28}
              color={star <= rating ? '#F59E0B' : colors.border}
              fill={star <= rating ? '#F59E0B' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Review title (optional)"
        placeholderTextColor={colors.textTertiary}
        className="px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          color: colors.text,
        }}
      />

      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Share your experience..."
        placeholderTextColor={colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          color: colors.text,
          minHeight: 80,
        }}
      />

      <TouchableOpacity
        className="h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: submitting ? colors.border : colors.primary }}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">
            {editingReview ? 'Update Review' : 'Submit Review'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
