import AuthForm from '@/frontend/components/auth/AuthForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-brand-100">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8 text-brand-900">Welcome Back</h1>
                <AuthForm />
            </div>
        </div>
    )
}
