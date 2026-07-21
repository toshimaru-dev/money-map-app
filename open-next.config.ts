import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// 全ルートが静的なアプリのため、インクリメンタルキャッシュ等のオーバーライドは未設定。
// ISR / オンデマンド再検証を使う場合は incrementalCache（R2）などをここに追加する。
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({})
