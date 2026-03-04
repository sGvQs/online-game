import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/legal/legalPageLayout'

export const metadata: Metadata = {
    title: 'プライバシーポリシー | Pukapuka Space',
    description: 'Pukapuka Space（ぷかぷか宇宙）のプライバシーポリシーです。',
}

export default function PrivacyPage() {
    return (
        <LegalPageLayout title="プライバシーポリシー">
            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6 first:mt-0">1. はじめに</h2>
                <p>
                    Pukapuka Space（ぷかぷか宇宙）（以下「本サービス」）は、ユーザーの個人情報の保護を重要な責務と認識しています。本プライバシーポリシーは、本サービスが収集する情報、その利用目的、および取り扱いについて定めるものです。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">2. 運営者</h2>
                <p>
                    本サービスは、Pukapuka Space 運営チーム（以下「運営」）が提供・運営しています。お問い合わせ窓口については、本サービス内で別途ご案内します。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">3. 収集する情報</h2>
                <p>本サービスでは、以下の情報を収集・利用します。</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>
                        <strong>認証情報</strong>：Google アカウントによるログイン時に、メールアドレスおよび表示名を取得します。
                    </li>
                    <li>
                        <strong>プロフィール情報</strong>：ユーザーが設定する表示名、コメント、アイコン（顔アイコン）を保存します。
                    </li>
                    <li>
                        <strong>利用データ</strong>：ルームの作成・参加、ゲームのプレイ履歴、勝敗結果、月間ランキングのスコアを記録します。
                    </li>
                    <li>
                        <strong>ローカルストレージ・セッションストレージ</strong>：訪問回数やログイン状態の判定など、サービス体験の向上のためにブラウザのローカルストレージ・セッションストレージを使用します。
                    </li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">4. 利用目的</h2>
                <p>収集した情報は、以下の目的で利用します。</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>ユーザー認証およびアカウント管理</li>
                    <li>プロフィールの表示、ルーム・ゲームの運営</li>
                    <li>ランキングの集計・表示</li>
                    <li>サービスの改善、不具合の修正</li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">5. 第三者への提供</h2>
                <p>
                    本サービスは、認証・データベース・ホスティングのため、Supabase およびホスティング事業者にデータを委託しています。これらの事業者は、サービス提供に必要な範囲でデータを処理します。法令に基づく開示請求を除き、ユーザーの同意なく第三者に個人情報を販売・譲渡することはありません。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">6. Cookie・ローカルストレージ</h2>
                <p>
                    本サービスでは、ログイン状態の維持や訪問履歴の記録のため、Cookie およびブラウザのローカルストレージ・セッションストレージを使用します。これらはサービス提供に必要な範囲で使用し、広告配信等の目的では使用しません。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">7. お問い合わせ</h2>
                <p>
                    プライバシーに関するお問い合わせは、本サービス内で案内する窓口までご連絡ください。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">8. 改定</h2>
                <p>
                    運営は、必要に応じて本プライバシーポリシーを改定することがあります。改定した場合は、本ページに掲載し、施行日を明記します。
                </p>
                <p className="text-brand-600 text-xs mt-4">
                    制定日：2026年2月25日
                </p>
            </section>
        </LegalPageLayout>
    )
}
