# CLAUDE.md — Claude Code 開発ルール

このファイルは、Claude Code が本プロジェクトを安全かつ継続的に開発するための専用指示書です。

本プロジェクトでは、共通ルールとして `AGENTS.md` を使用します。  
Claude Code は、作業開始時に必ず `AGENTS.md` とこの `CLAUDE.md` の両方を確認してください。

ルールの優先順位は以下です。

1. ユーザーからの最新指示
2. `CLAUDE.md`
3. `AGENTS.md`
4. README / 既存コード / package.json
5. 一般的なベストプラクティス

---

## 1. プロジェクト概要

このプロジェクトは、Expo / React Native / TypeScript を使ったスマホアプリです。

現在のアプリ方針は、習慣化・目標管理アプリ **OneStep** です。

目的は、ユーザーの

- 叶えたい未来のビジョン
- 今日行う最低限のアクション1つ
- 実行時間
- 振り返り
- 継続日数
- AIコーチのフィードバック

をつなげ、行動継続率を高めることです。

---

## 2. 作業開始時に必ず行うこと

Claude Code は、作業開始時に必ず以下を実行してください。

```bash
cd /Volumes/SSD001/Dev/life-reset-coach
pwd
git status
ls
cat package.json
```

存在する場合は以下も確認してください。

```bash
cat README.md
cat AGENTS.md
cat CLAUDE.md
```

確認せずに実装を始めないでください。

---

## 3. 絶対に守る作業方針

- 既存プロジェクトフォルダ `/Volumes/SSD001/Dev/life-reset-coach` の中で作業する。
- 勝手に別フォルダへ新規プロジェクトを作らない。
- 既存コードを大量削除する場合は、削除理由を明確にする。
- 実装は小さく、安全に進める。
- 画面が壊れる可能性がある変更は、必ず関連ファイルを確認してから行う。
- APIキー、トークン、秘密情報をコードに直書きしない。
- `.env`、秘密情報、ビルド成果物、キャッシュを Git に含めない。
- 不要な console.log を残さない。
- TODOだけ残して完了扱いしない。

---

## 4. 技術スタック方針

原則として以下を使用します。

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand
- expo-sqlite
- Drizzle ORM
- expo-notifications
- date-fns
- react-hook-form
- zod
- react-native-gifted-charts
- @expo/vector-icons / Ionicons
- StyleSheet

NativeWind は使用しません。

スタイリングは原則として `StyleSheet.create()` を使用してください。  
インラインスタイルは避けてください。

---

## 5. デザインルール

デザイン定数は以下のようなファイルに集約してください。

```txt
constants/colors.ts
constants/typography.ts
constants/categories.ts
```

画面やコンポーネント内で、色・余白・角丸・フォントサイズを直接ハードコードしないでください。

特に OneStep の基本カラーは以下を優先します。

```ts
primary: '#7B5EA7'
primaryDark: '#3D2D6E'
primaryLight: '#F0EBFF'
primaryMid: '#C5B8E8'
background: '#F6F4FF'
card: '#FFFFFF'
border: '#EDE9F8'
textMuted: '#8878B8'
success: '#66BB6A'
warning: '#FFA726'
danger: '#EF9A9A'
streak: '#FF6D00'
```

---

## 6. Expo Router 注意点

以前、`app/_layout.tsx` 周辺で以下のエラーが発生しています。

```txt
Exception in HostFunction: TypeError: expected dynamic type 'boolean', but had type 'string'
```

そのため、Expo Router / React Navigation の options に渡す値は型に注意してください。

特に以下に注意してください。

- `headerShown` は boolean
- `animation` や `presentation` などで string 指定してエラーが出る場合は一度外す
- まずは安定起動を優先する
- 複雑な画面遷移演出は後回しにする

安定構成の例。

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="record" />
</Stack>
```

---

## 7. 実装時の基本ルール

- コンポーネントは関数コンポーネント + hooks を使う。
- TypeScript の型安全を優先する。
- 画面コンポーネントに複雑なロジックを書きすぎない。
- UI、ロジック、DB操作、外部API接続は可能な限り分離する。
- DB/API/通知処理は try/catch を使う。
- ユーザーに見えるエラー表示を用意する。
- AI/API が失敗しても、アプリの基本機能は使えるようにする。
- 主要ロジックには日本語コメントを入れる。

---

## 8. 作業後に必ず確認すること

実装後は、可能な範囲で以下を実行してください。

```bash
npm install
npm run lint
npm run typecheck
npm test
```

上記の script が存在しない場合は、`package.json` を確認し、利用可能な検証コマンドを実行してください。

最低限、以下は必ず実行してください。

```bash
git status
git diff
```

Expo の起動確認が必要な場合は以下を実行してください。

```bash
npx expo start --clear
```

ただし、長時間起動したままにせず、確認できたら終了してください。

---

## 9. Git / GitHub 保存ルール

Claude Code は、ユーザーから実装・修正・ファイル作成を依頼された場合、作業完了後に必ず以下を行ってください。

1. Git差分確認
2. 不要ファイルや秘密情報が含まれていないか確認
3. コミット
4. GitHubへpush

標準コマンドは以下です。

```bash
git status
git diff
git add .
git commit -m "chore: update project files"
git branch --show-current
git remote -v
git push origin $(git branch --show-current)
```

もし upstream が未設定で push に失敗した場合は、以下を実行してください。

```bash
git push -u origin $(git branch --show-current)
```

remote が設定されていない場合は、push できない理由を報告してください。

`.env` や APIキーが差分に含まれている場合は、絶対にコミットしないでください。

---

## 10. コミットメッセージルール

コミットメッセージは以下の形式を使ってください。

```txt
<type>: <変更内容>
```

type の例。

```txt
feat: 機能追加
fix: バグ修正
docs: ドキュメント
style: 見た目・整形
refactor: リファクタリング
test: テスト
chore: 設定・雑務
```

例。

```bash
git commit -m "docs: add Claude Code development rules"
git commit -m "feat: implement OneStep home screen"
git commit -m "fix: resolve Expo Router layout error"
```

---

## 11. ファイル追加・変更時の注意

新しいファイルを作る場合は、責務が分かる名前にしてください。

悪い例。

```txt
data.ts
util.ts
test2.tsx
temp.tsx
```

良い例。

```txt
goalProgressCalculator.ts
DailyActionCard.tsx
useStreak.ts
anthropicCoachClient.ts
```

1ファイルに責務を詰め込みすぎないでください。

---

## 12. AIコーチ機能の安全ルール

AIコーチはユーザーを責めない表現にしてください。

AI出力は以下を満たす必要があります。

- 短い
- 具体的
- 明日すぐできる一手がある
- 否定しない
- 不確実なことを断定しない
- 医療・法律・金融など高リスク領域で断定的助言をしない

AI API が失敗した場合は、ローカルの固定メッセージにフォールバックしてください。

---

## 13. 完了報告ルール

作業完了時は、必ず以下を報告してください。

1. 実装・変更した内容
2. 変更した主なファイル
3. 実行した確認コマンド
4. 成功した確認
5. 失敗・未確認の確認
6. 発生したエラーと対応内容
7. Git commit の結果
8. GitHub push の結果

「完了しました」だけで終わらないでください。

---

## 14. 最重要ルール

このプロジェクトでは、毎回の作業後に以下を必ず行います。

```bash
git status
git diff
git add .
git commit -m "<適切なコミットメッセージ>"
git push
```

ただし、秘密情報が含まれる場合はコミット・push しないでください。

このアプリの成功条件は、機能量ではなく、ユーザーが毎日開き、未来に向けて小さな一歩を続けられることです。

常に以下を判断基準にしてください。

```txt
この変更で、ユーザーは今日の行動を始めやすくなるか？
この変更で、操作は簡単になるか？
この変更で、継続したくなるか？
```
