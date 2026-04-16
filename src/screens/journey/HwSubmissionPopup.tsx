import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Popup } from '../../components/Popup';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { colors, radius, spacing } from '../../theme';
import { HwStatus, TimelineSession } from '../../data/mockStudent';

/**
 * HW Submission Popup — Screen #25
 *
 * Four internal states (from product doc §05):
 *   empty    — no photo yet. Upload dashed area.
 *   preview  — photo chosen. Reupload + Submit CTAs.
 *   confirm  — "Are you sure?" prompt. Cannot delete after.
 *   done     — Submitted. Read-only thumbnail + confirmation.
 *
 * Plus a view-only mode when opened from an already-submitted session.
 */
export interface HwSubmissionContext {
  session: TimelineSession;
  currentHwStatus?: HwStatus;      // undefined = pending/new
  submittedImageUri?: string;      // for view-only mode
}

interface Props {
  context: HwSubmissionContext | null;
  onClose: () => void;
  onSubmitted?: (payload: {
    sessionId: string;
    imageUri: string;
    pushToCommunity: boolean;
  }) => void;
}

type Step = 'empty' | 'preview' | 'confirm' | 'done';

export function HwSubmissionPopup({ context, onClose, onSubmitted }: Props) {
  const [step, setStep] = useState<Step>('empty');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [shareToCommunity, setShareToCommunity] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset internal state every time the popup opens
  useEffect(() => {
    if (!context) return;
    if (context.currentHwStatus && context.currentHwStatus !== 'pending') {
      // Already submitted — open in view-only 'done' state
      setImageUri(context.submittedImageUri ?? null);
      setStep('done');
    } else {
      setImageUri(null);
      setStep('empty');
      setShareToCommunity(false);
    }
  }, [context?.session.id, context?.currentHwStatus]);

  const isViewOnly = useMemo(
    () => !!context?.currentHwStatus && context.currentHwStatus !== 'pending',
    [context?.currentHwStatus],
  );

  // Web-only: trigger the <input type="file"> picker
  const pickImage = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }
    // On native we'll wire expo-image-picker later (requires dev build).
    // For Pass 1 mock, stub a fake image path so the flow works on device too.
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

  const onSubmit = () => setStep('confirm');

  const onConfirm = () => {
    if (!context || !imageUri) return;
    onSubmitted?.({
      sessionId: context.session.id,
      imageUri,
      pushToCommunity: shareToCommunity,
    });
    setStep('done');
  };

  const title = context ? `Homework · ${context.session.title}` : 'Homework';

  return (
    <Popup visible={!!context} title={title} onClose={onClose} fullHeight>
      {context && (
        <>
          {/* Meta row */}
          <View style={styles.metaRow}>
            <Text variant="small" tone="muted">
              Session {context.session.sessionNumber} · Due {formatDate(context.session.date, 3)}
            </Text>
            {isViewOnly && (
              <Chip
                label={
                  context.currentHwStatus === 'reviewed'
                    ? 'Reviewed'
                    : 'Under review'
                }
                tone={
                  context.currentHwStatus === 'reviewed' ? 'success' : 'warning'
                }
              />
            )}
          </View>

          {/* Body by step */}
          {step === 'empty' && <EmptyState onPick={pickImage} />}

          {(step === 'preview' || step === 'confirm' || step === 'done') &&
            imageUri && <PhotoPreview uri={imageUri} />}

          {step === 'preview' && (
            <>
              <ShareToggle
                value={shareToCommunity}
                onChange={setShareToCommunity}
              />
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
                  onPress={onSubmit}
                  fullWidth
                  style={{ flex: 1 }}
                />
              </View>
            </>
          )}

          {step === 'confirm' && (
            <View style={styles.confirmBox}>
              <Text variant="bodyBold">Submit this photo?</Text>
              <Text variant="small" tone="secondary" style={{ marginTop: 4 }}>
                Once submitted you cannot delete it. You can reupload to replace the photo later.
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

          {step === 'done' && (
            <View style={styles.doneRow}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.success}
              />
              <Text variant="bodyBold" style={{ flex: 1, marginLeft: spacing.sm }}>
                {isViewOnly
                  ? context.currentHwStatus === 'reviewed'
                    ? 'Teacher has reviewed your homework.'
                    : 'Your homework is with the teacher.'
                  : 'Homework submitted!'}
              </Text>
            </View>
          )}

          {step === 'done' && !isViewOnly && (
            <Button label="Close" variant="secondary" onPress={onClose} fullWidth />
          )}

          {/* Hidden web file picker */}
          {Platform.OS === 'web' && (
            // eslint-disable-next-line react-native/no-inline-styles
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
        </>
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
      <Ionicons
        name="cloud-upload-outline"
        size={36}
        color={colors.textMuted}
      />
      <Text variant="bodyBold" style={{ marginTop: spacing.sm }}>
        Upload a photo of your drawing
      </Text>
      <Text variant="small" tone="muted" style={{ marginTop: 4, textAlign: 'center' }}>
        Tap here to pick from camera roll. Make sure the drawing is well lit.
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

function ShareToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.shareRow}>
      <View style={{ flex: 1, marginRight: spacing.md }}>
        <Text variant="bodyBold">Share with the community</Text>
        <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
          First name only. Teacher approves before it goes live.
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

function formatDate(iso: string, addDays = 0): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + addDays);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
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
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#E8F5EC',
  },
});
