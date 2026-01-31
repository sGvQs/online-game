'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [message, setMessage] = useState('')
    const router = useRouter()
    const supabase = createClient()

    async function handleAuth() {
        setMessage('')
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) setMessage(error.message)
            else router.push('/realtime')
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    },
                },
            })
            if (error) {
                setMessage(error.message)
            } else {
                setMessage('Signup successful! Attempting auto-login...')
                // In local dev, email checking might be skipped depending on config.
                // We attempt login immediately.
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (loginError) {
                    setMessage(`Please check your email. Login error: ${loginError.message}`)
                } else {
                    router.push('/realtime')
                }
            }
        }
    }

    return (
        <div className="p-8 border rounded-lg max-w-md mx-auto bg-brand-400 text-brand-900 shadow-lg">
            <h2 className="text-2xl mb-6 text-brand-900 font-bold text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
            {message && <div className="p-3 mb-4 bg-brand-100 text-brand-900 border border-brand-700 rounded text-sm whitespace-pre-wrap">{message}</div>}
            {!isLogin && (
                <input
                    className="block w-full mb-4 p-3 border rounded-md text-black focus:outline-brand-700"
                    placeholder="Display Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            )}
            <input
                className="block w-full mb-4 p-3 border rounded-md text-black focus:outline-brand-700"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="block w-full mb-6 p-3 border rounded-md text-black focus:outline-brand-700"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                onClick={handleAuth}
                className="bg-brand-700 hover:bg-brand-900 text-white p-3 rounded-md w-full font-bold transition-colors"
            >
                {isLogin ? 'Login' : 'Sign Up'}
            </button>
            <button
                onClick={() => setIsLogin(!isLogin)}
                className="mt-4 text-sm text-brand-900 underline w-full text-center"
            >
                {isLogin ? 'Create Account' : 'Have an account? Login'}
            </button>
        </div>
    )
}
