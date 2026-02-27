import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export const metadata: Metadata = {
    title: '利用規約 | Pukapuka Space',
    description: 'Pukapuka Space（ぷかぷか宇宙）の利用規約です。',
}

export default function TermsPage() {
    return (
        <LegalPageLayout title="利用規約">
            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6 first:mt-0">第1条（適用）</h2>
                <p>
                    本利用規約（以下「本規約」）は、Pukapuka Space（ぷかぷか宇宙）（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第2条（サービス概要）</h2>
                <p>
                    本サービスは、オンラインで友人とゲームを楽しむためのプラットフォームです。ルームの作成・参加、各種ゲームのプレイ、ランキングの閲覧・競争などの機能を提供します。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第3条（アカウント）</h2>
                <p>
                    本サービスの利用には、Google アカウントによるログインが必要です。アカウントの管理責任はユーザー本人にあり、パスワード等の漏洩による不正利用について、運営は責任を負いません。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第4条（禁止事項）</h2>
                <p>ユーザーは、以下の行為を行ってはなりません。</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>法令または公序良俗に反する行為</li>
                    <li>他のユーザーや第三者に迷惑、不利益、損害を与える行為</li>
                    <li>本サービスの運営を妨害する行為</li>
                    <li>不正アクセス、なりすまし、その他の不正利用</li>
                    <li>
                        <strong>不正行為</strong>：チートツール・マクロ・ボット等の使用、複数アカウントの作成によるポイントの不正獲得、バグを意図的に利用してポイントを稼ぐ行為、その他運営が不正と判断する行為。違反した場合、運営は事前の通知なくアカウントを即時停止し、ポイントの没収等の措置を講じることができるものとします。
                    </li>
                </ul>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第5条（ユーザー生成コンテンツ）</h2>
                <p>
                    ルーム名、プロフィールのコメント等、ユーザーが投稿するコンテンツについて、その責任はユーザー本人に帰属します。運営は、ユーザー生成コンテンツの内容について、監視義務を負うものではありません。ただし、法令違反や本規約に反するコンテンツを発見した場合、運営は削除等の措置を講じることができます。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第6条（免責事項）</h2>
                <p>
                    運営は、本サービスの正確性、完全性、有用性等について保証しません。ゲームの結果表示、ランキング、その他サービス上のデータに誤りや欠落が生じた場合でも、運営は責任を負いません。
                </p>
                <p className="mt-2 font-medium">
                    サーバー障害、バグ、その他の技術的トラブルにより、戦闘ログ・ゲーム結果・ポイント等のデータが消失または破損した場合においても、運営は復旧の義務を負わず、一切の責任を負わないものとします。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第7条（サービスの変更・終了）</h2>
                <p>
                    運営は、事前の通知なく、本サービスの内容の変更、一部機能の廃止、またはサービス全体の終了を行うことができます。
                </p>
                <p className="mt-2 font-medium">
                    ゲーム内容の変更やサービスの終了に際し、ユーザーが保有するポイントその他のデータについて、運営は補償・返還等の義務を負わないものとします。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第8条（準拠法・管轄）</h2>
                <p>
                    本規約は日本法に準拠し、本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-base font-bold mt-6">第9条（改定）</h2>
                <p>
                    運営は、必要に応じて本規約を改定することがあります。改定した場合は、本ページに掲載し、施行日を明記します。改定後の利用により、ユーザーは改定後の規約に同意したものとみなされます。
                </p>
                <p className="text-brand-600 text-xs mt-4">
                    制定日：2026年2月25日
                </p>
            </section>
        </LegalPageLayout>
    )
}
