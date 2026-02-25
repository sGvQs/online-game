import AuthForm from '@/components/auth/AuthForm'
import { DashboardHeaderTitle } from '@/components/dashboard/DashboardHeaderTitle'
import { LoginSusumCharacter } from '@/components/login/LoginSusumCharacter'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-transparent">
            <div className="w-full max-w-md flex justify-center flex-col items-center gap-5">
                <DashboardHeaderTitle/>
                <AuthForm />
            </div>
            <LoginSusumCharacter />
        </div>
    )
}
