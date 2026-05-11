// Claude API を fetch で直接呼ぶ（@anthropic-ai/sdk は Node.js 依存があるため使用しない）
const API_URL = 'https://api.anthropic.com/v1/messages';

// ローカルフォールバックメッセージ（API キー未設定 / 通信失敗時）
const FALLBACK_MESSAGES = [
  '今日も一歩前進しましたね！🌱 小さな積み重ねが大きな変化を生みます。',
  '継続することが力になります💪 明日もこの調子で続けていきましょう！',
  '今日の行動が未来の自分を作っています✨ 諦めずに続けることが大切です。',
  '一歩一歩確実に進んでいます🎯 焦らず自分のペースで続けていきましょう！',
];

function getRandomFallback(): string {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}

export async function generateCoachMessage(params: {
  vision: string;
  actionTitle: string;
  elapsedMinutes: number;
  status: 'done' | 'partial' | 'failed';
  streakDays: number;
  mood: string;
}): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  // API キーが未設定ならフォールバック
  if (!apiKey) return getRandomFallback();

  const { vision, actionTitle, elapsedMinutes, status, streakDays, mood } = params;
  const statusLabel =
    status === 'done' ? 'できた' : status === 'partial' ? '一部できた' : 'できなかった';
  const moodLabel =
    mood === 'good' ? '良い' : mood === 'normal' ? '普通' : '悪い';

  const systemPrompt = `あなたは習慣化を支援するAIコーチです。
以下のルールで短いフィードバックを返してください:
- 日本語で2〜3文以内
- 否定的な表現は使わない
- 具体的で明日すぐ実行できるアドバイスを含める
- 絵文字を1〜2個使ってもよい
- 「できなかった」場合も責めずに次の一手を示す`;

  const userPrompt = `ビジョン: ${vision}
今日のアクション: ${actionTitle}
実行時間: ${elapsedMinutes}分
達成状態: ${statusLabel}
連続日数: ${streakDays}日
気分: ${moodLabel}`;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) return getRandomFallback();

    const data = (await res.json()) as {
      content: { type: string; text: string }[];
    };
    return data.content?.[0]?.text ?? getRandomFallback();
  } catch {
    // 通信失敗してもアプリを止めない
    return getRandomFallback();
  }
}
