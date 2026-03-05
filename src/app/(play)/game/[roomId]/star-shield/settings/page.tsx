import { redirect } from 'next/navigation'

/** 後方互換: /settings を /skill にリダイレクト */
export default async function StarShieldSettingsRedirect({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params
    redirect(`/game/${roomId}/star-shield/skill`)
}
