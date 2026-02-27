import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import { DashboardHeaderTitle } from '@/components/dashboard/DashboardHeaderTitle'
import { AnnoyingDinosaur } from '@/components/login/AnnoyingDinosaur'

const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'


export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-transparent">
            <div className="relative z-10 w-full max-w-md flex justify-center flex-col items-center gap-5">
                <DashboardHeaderTitle/>
                <AuthForm />
                <p
                className="font-black tracking-tight text-brand-900 flex items-center gap-2 text-sm"
                style={{ fontFamily: RUBIK_PUDDLES_FONT }}
                >
               <span>Music</span><span>by</span><span>Dream</span><span>or</span><span>real?</span>
               </p>
            </div>
            <Suspense fallback={null}>
                <AnnoyingDinosaur />
            </Suspense>
        </div>
    )
}
