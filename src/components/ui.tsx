import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SUPPORT_LABEL, SUPPORT_PLATFORMS, SUPPORT_URL } from '@/constants/support';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import type { ReactNode } from 'react';

/** Scrolling page shell: safe-area aware, centred and width-capped on the web. */
export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const inner = (
    <View style={[styles.contentWrap, contentStyle]}>
      <View style={styles.contentInner}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: c.background }]}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return <Text style={[styles.title, { color: c.text }, style]}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  const c = useTheme();
  return <Text style={[styles.subtitle, { color: c.textSecondary }]}>{children}</Text>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  const c = useTheme();
  return <Text style={[styles.sectionHeading, { color: c.text }]}>{children}</Text>;
}

export function Body({
  children,
  muted,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const c = useTheme();
  return (
    <Text style={[styles.body, { color: muted ? c.textSecondary : c.text }, style]}>{children}</Text>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>
      {children}
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();

  const bg = {
    primary: c.primary,
    secondary: c.card,
    ghost: 'transparent',
    danger: c.dangerSoft,
  }[variant];

  const fg = {
    primary: c.primaryText,
    secondary: c.text,
    ghost: c.primary,
    danger: c.danger,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor: variant === 'secondary' ? c.border : 'transparent',
          borderWidth: variant === 'secondary' ? 2 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Checkbox({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const c = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={({ pressed }) => [styles.checkboxRow, { opacity: pressed ? 0.85 : 1 }]}>
      <View
        style={[
          styles.checkboxBox,
          {
            borderColor: checked ? c.primary : c.border,
            backgroundColor: checked ? c.primary : 'transparent',
          },
        ]}>
        {checked ? <Text style={[styles.checkboxMark, { color: c.primaryText }]}>✓</Text> : null}
      </View>
      <Text style={[styles.checkboxLabel, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({
  value,
  max,
  label,
  showPercent,
  colorOverride,
}: {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  colorOverride?: string;
}) {
  const c = useTheme();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const percent = Math.round(ratio * 100);
  const fill = colorOverride ?? (ratio >= 0.8 ? c.success : ratio > 0 ? c.warning : c.track);

  return (
    <View style={styles.progressWrap}>
      {(label || showPercent) && (
        <View style={styles.progressLabelRow}>
          {label ? (
            <Text style={[styles.progressLabel, { color: c.textSecondary }]}>{label}</Text>
          ) : null}
          {showPercent ? (
            <Text style={[styles.progressLabel, { color: c.textSecondary }]}>{percent}%</Text>
          ) : null}
        </View>
      )}
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max, now: value }}
        style={[styles.progressTrack, { backgroundColor: c.track }]}>
        <View
          style={[styles.progressFill, { width: `${percent}%`, backgroundColor: fill }]}
        />
      </View>
    </View>
  );
}

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}) {
  const c = useTheme();
  const map = {
    neutral: { bg: c.cardAlt, fg: c.textSecondary },
    primary: { bg: c.primarySoft, fg: c.primarySoftText },
    success: { bg: c.successSoft, fg: c.success },
    warning: { bg: c.warningSoft, fg: c.warning },
    danger: { bg: c.dangerSoft, fg: c.danger },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: map.bg }]}>
      <Text style={[styles.pillText, { color: map.fg }]}>{children}</Text>
    </View>
  );
}

export function StatTile({ value, label }: { value: string | number; label: string }) {
  const c = useTheme();
  return (
    <View style={[styles.statTile, { backgroundColor: c.card, borderColor: c.border }]}>
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

/**
 * Optional support link. Renders nothing unless SUPPORT_URL is set and the
 * current platform is allowed — see constants/support.ts for why that matters.
 */
export function SupportLink() {
  const c = useTheme();

  const allowed = (SUPPORT_PLATFORMS as readonly string[]).includes(Platform.OS);
  if (!SUPPORT_URL || !allowed) return null;

  // react-native-web turns `href` into a real <a>, which keeps middle-click,
  // open-in-new-tab and copy-link-address working. Those props aren't in the
  // React Native types, hence the cast.
  const webLinkProps = {
    href: SUPPORT_URL,
    hrefAttrs: { target: '_blank', rel: 'noopener noreferrer' },
  } as object;

  return (
    <Text
      {...webLinkProps}
      accessibilityRole="link"
      onPress={() => {
        Linking.openURL(SUPPORT_URL).catch(() => {});
      }}
      style={[styles.supportText, styles.supportLink, { color: c.textSecondary }]}>
      {SUPPORT_LABEL}
    </Text>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  const c = useTheme();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={c.primary} />
      <Text style={[styles.body, { color: c.textSecondary, marginTop: Spacing.md }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>🎉</Text>
      <SectionHeading>{title}</SectionHeading>
      <Body muted style={styles.centerText}>
        {message}
      </Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  contentWrap: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg },
  contentInner: { width: '100%', maxWidth: MaxContentWidth, paddingVertical: Spacing.lg, gap: Spacing.md },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21 },
  sectionHeading: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22 },
  centerText: { textAlign: 'center' },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  button: {
    minHeight: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: 44 },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: { fontSize: 14, fontWeight: '700', lineHeight: 18 },
  checkboxLabel: { fontSize: 15, flexShrink: 1 },
  progressWrap: { gap: Spacing.xs },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13 },
  progressTrack: { height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.pill },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  statTile: {
    flex: 1,
    minWidth: 96,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, textAlign: 'center' },
  supportLink: { alignSelf: 'center', paddingVertical: Spacing.md, minHeight: 44, justifyContent: 'center' },
  supportText: { fontSize: 13 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyCard: { alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 40 },
});
