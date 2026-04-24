import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Popup } from '../../components/Popup';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../theme';

/**
 * Loop 4 — Sketchbook upload popup.
 *
 * Same photo-pick pattern as HwSubmissionPopup but simpler:
 *   - no reference image / on-time bonus framing
 *   - intro line explains the 15 pts / 2 reviews rule
 *   - optional title field so the piece shows up nicely in My Works
 *   - eligibility (points-earning vs portfolio-only) decided server-side
 *     at submit time; caller passes in `reviewsLeftThisWeek` so we can
 *     show the right copy before the user commits.
 */
interface Props {
  visible: boolean;
  reviewsLeftThisWeek: number;
  onClose: () => void;
  onSubmit: (payload: { photoUri: string; title: string }) => void;
}

type Step = 'empty' | 'preview' | 'confirm';

export function SketchbookUploadPopup({
  visible,
  reviewsLeftThisWeek,
  onClose,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<Step>('empty');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStep('empty');
    setImageUri(null);
    setTitle('');
  }, [visible]);

  const eligible = reviewsLeftThisWeek > 0;

  const pickImage = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }
    setImageUri('__mock_photo__');
    setStep('preview');
  };

  const onFilePicked = (e: any) => {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUri(url);
    setStep('preview');
  };

  const onConfirm = () => {
    if (!imageUri) return;
    onSubmit({ photoUri: imageUri, title });
    onClose();
  };

  return (
    <Popup visible={visible} title="Add to Sketchbook" onClose={onClose} fullHeight>
      {/* Intro */}
      <View style={styles.intro}>
        <Ionicons
          name={eligible ? 'sparkles' : 'archive-outline'}
          size={18}
          color={eligible ? colors.warning : colors.textMuted}
        />
        <Text variant="small" tone="secondary" style={{ flex: 1, marginLeft: spacing.sm }}>
          {eligible
            ? `Teacher reviews up to 2 pieces per week for skill points (up to 15 pts per piece). You have ${reviewsLeftThisWeek} review${reviewsLeftThisWeek === 1 ? '' : 's'} left this week.`
            : 'Points used up this week — but you can still add pieces to your portfolio. They stay in My Works forever.'}
        </Text>
      </View>

      {step === 'empty' && <EmptyState onPick={pickImage} />}

      {(step === 'preview' || step === 'confirm') && imageUri && (
        <PhotoPreview uri={imageUri} />
      )}

      {step === 'preview' && (
        <>
          {/* Title input */}
          <View style={styles.titleRow}>
            <Text variant="label" tone="muted" style={{ marginBottom: spacing.xs }}>
              Title (optional)
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. My cat in the morning"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={60}
            />
          </View>

          <View style={styles.actions}>
            <Button
              label="Reupload"
              variant="secondary"
              onPress={pickImage}
              fullWidth
              style={{ flex: 1 }}
            />
            <Button
              label="Submit"
              onPress={() => setStep('confirm')}
              fullWidth
              style={{ flex: 1 }}
            />
          </View>
        </>
      )}

      {step === 'confirm' && (
        <View style={styles.confirmBox}>
          <Text variant="bodyBold">
            {eligible ? 'Send this to your teacher?' : 'Add to your portfolio?'}
          </Text>
          <Text variant="small" tone="secondary" style={{ marginTop: 4 }}>
            {eligible
              ? 'Teacher will review it and return star ratings + skill points.'
              : 'This piece will go to your portfolio only. No points this week.'}
          </Text>
          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => setStep('preview')}
              fullWidth
              style={{ flex: 1 }}
            />
            <Button
              label="Yes, submit"
              onPress={onConfirm}
              fullWidth
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}

      {Platform.OS === 'web' && (
        <input
          ref={(r) => {
            fileInputRef.current = r as unknown as HTMLInputElement;
          }}
          type="file"
          accept="image/*"
          onChange={onFilePicked}
          style={{ display: 'none' }}
        />
      )}
    </Popup>
  );
}

function EmptyState({ onPick }: { onPick: () => void }) {
  return (
    <Pressable
      onPress={onPick}
      style={({ pressed }) => [styles.upload, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name="cloud-upload-outline" size={36} color={colors.textMuted} />
      <Text variant="bodyBold" style={{ marginTop: spacing.sm }}>
        Upload your sketchbook piece
      </Text>
      <Text
        variant="small"
        tone="muted"
        style={{ marginTop: 4, textAlign: 'center' }}
      >
        Tap here to pick a photo from your gallery.
      </Text>
    </Pressable>
  );
}

function PhotoPreview({ uri }: { uri: string }) {
  const isMock = uri === '__mock_photo__';
  return (
    <View style={styles.preview}>
      {isMock ? (
        <View style={styles.previewMock}>
          <Ionicons name="image" size={44} color={colors.textMuted} />
          <Text variant="small" tone="muted" style={{ marginTop: spacing.sm }}>
            Mock photo preview
          </Text>
        </View>
      ) : (
        <Image source={{ uri }} style={styles.previewImg} resizeMode="cover" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  upload: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.surfaceAlt,
    minHeight: 180,
  },
  preview: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    aspectRatio: 4 / 3,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  previewMock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confirmBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
});
