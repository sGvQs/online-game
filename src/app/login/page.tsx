import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import { DashboardHeaderTitle } from '@/components/dashboard/DashboardHeaderTitle'
import { AnnoyingDinosaur } from '@/components/login/AnnoyingDinosaur'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-transparent">
            <div className="relative z-10 w-full max-w-md flex justify-center flex-col items-center gap-5">
                <DashboardHeaderTitle/>
                <AuthForm />
            </div>
            <Suspense fallback={null}>
                <AnnoyingDinosaur />
            </Suspense>
        </div>
    )
}
