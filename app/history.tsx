import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import type { DailyLog } from '../types';
import { loadAllLogs } from '../utils/storage';

const CHARACTER_EMOJI: Record<string, string> = {
  angel: '👼',
  neutral: '🌤️',
  devil: '😈',
};

const STATUS_LABEL: Record<string, string> = {
  angel: '天使モード',
  neutral: 'ニュートラル',
  devil: '要注意モード',
};

const STATUS_COLOR: Record<string, string> = {
  angel: '#4A90E2',
  neutral: '#F5A623',
  devil: '#E05C5C',
};

export default function HistoryScreen() {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAllLogs().then(setLogs);
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton />
        <View style={styles.header}>
          <Text style={styles.title}>📅 振り返り履歴</Text>
          <Text style={styles.subtitle}>{logs.length}件の記録</Text>
        </View>

        {logs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>まだ記録がありません</Text>
            <Text style={styles.emptyHint}>夜の振り返りを完了すると履歴が積み上がります</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {logs.map((log) => (
              <LogCard key={log.date} log={log} />
            ))}
          </View>
        )}

        <PrimaryButton
          label="← ホームに戻る"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.backButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function LogCard({ log }: { log: DailyLog }) {
  const [expanded, setExpanded] = useState(false);
  const color = STATUS_COLOR[log.status] ?? '#8A8A9A';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded((p) => !p)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardEmoji}>{CHARACTER_EMOJI[log.status]}</Text>
          <View>
            <Text style={styles.cardDate}>{formatDate(log.date)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: color }]}>
              <Text style={styles.statusText}>{STATUS_LABEL[log.status]}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.cardScore, { color }]}>{log.score}点</Text>
          <Text style={styles.expandArrow}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.detail}>
          {log.todayAction ? (
            <DetailRow label="⚡ アクション" value={log.todayAction} />
          ) : null}
          {log.focusArea ? (
            <DetailRow label="🎯 フォーカス" value={log.focusArea} />
          ) : null}
          {log.desiredActionsDone.length > 0 && (
            <DetailRow
              label="✅ できた行動"
              value={log.desiredActionsDone.join('、')}
            />
          )}
          {log.avoidActionsDone.length > 0 && (
            <DetailRow
              label="⚠️ やった行動"
              value={log.avoidActionsDone.join('、')}
              valueColor="#E05C5C"
            />
          )}
          {log.tomorrowFix ? (
            <DetailRow label="🔧 明日の修正" value={log.tomorrowFix} />
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={[detailStyles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingVertical: 3 },
  label: { fontSize: 13, color: '#8A8A9A', fontWeight: '600', minWidth: 100 },
  value: { fontSize: 13, color: '#2C2C3E', flex: 1 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  header: { gap: 4 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#8A8A9A' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#5A5A7A' },
  emptyHint: { fontSize: 14, color: '#A0A0B8', textAlign: 'center' },
  list: { gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardEmoji: { fontSize: 32 },
  cardDate: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardScore: { fontSize: 22, fontWeight: '800' },
  expandArrow: { fontSize: 11, color: '#A0A0B8' },
  detail: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F8',
    gap: 4,
  },
  backButton: { marginTop: 8 },
});
