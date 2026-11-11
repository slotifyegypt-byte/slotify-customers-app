import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { radius, spacing, useColors } from '@/theme';

type CameraModule = typeof import('expo-camera');

/** The camera module is loaded only when the scanner opens. A build made before the module was added has no native camera;
 *  the screen then says so and the customer types the code instead of the app crashing. */
function loadCamera(): CameraModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded on demand so a build without the native module still runs
    const mod = require('expo-camera') as CameraModule;
    return mod?.CameraView ? mod : null;
  } catch {
    return null;
  }
}

interface Props {
  /** Every QR the camera reads (the first one only, until `rearm` is called by remounting). */
  onScan: (text: string) => void;
}

export function JoinScanner({ onScan }: Props) {
  const { t } = useTranslation();
  const camera = loadCamera();
  if (!camera) return <Message text={t('loyalty.join.noCamera')} />;
  return <Live camera={camera} onScan={onScan} />;
}

function Live({ camera, onScan }: Props & { camera: CameraModule }) {
  const { t } = useTranslation();
  const colors = useColors();
  const [permission, request] = camera.useCameraPermissions();
  const busy = useRef(false);

  if (!permission) return <Message text={t('loyalty.join.checkingCamera')} />;
  if (!permission.granted) {
    return (
      <Message
        text={permission.canAskAgain ? t('loyalty.join.allowCamera') : t('loyalty.join.cameraOff')}
        {...(permission.canAskAgain ? { actionLabel: t('loyalty.join.allowAction'), onAction: () => void request() } : {})}
      />
    );
  }
  const CameraView = camera.CameraView;
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={[styles.frame, { borderColor: colors.border }]}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            // The camera reports the same code many times a second: handle one at a time.
            if (busy.current) return;
            busy.current = true;
            onScan(data);
            setTimeout(() => (busy.current = false), 2000);
          }}
        />
        <View pointerEvents="none" style={[styles.target, { borderColor: colors.textInverse }]} />
      </View>
      <ThemedText variant="caption" color="textTertiary" style={{ textAlign: 'center' }}>
        {t('loyalty.join.scanHint')}
      </ThemedText>
    </View>
  );
}

function Message({ text, actionLabel, onAction }: { text: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.message}>
      <Ionicons name="camera-outline" size={28} color={colors.textTertiary} />
      <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
        {text}
      </ThemedText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 300, borderRadius: radius.lg, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, backgroundColor: '#000' },
  target: { position: 'absolute', top: '22%', left: '18%', right: '18%', bottom: '22%', borderWidth: 2, borderRadius: radius.md, opacity: 0.8 },
  message: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
});
