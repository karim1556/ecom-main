"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        (typeof window !== "undefined" ? window.location.origin : undefined)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })

      if (error) throw error
      // Supabase will handle the redirect; no need to router.push here
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (signInError) throw signInError
        router.push("/")
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match")
        }
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
            data: { full_name: formData.fullName },
          },
        })
        if (signUpError) throw signUpError
        // If session or user is returned (e.g., email confirmation disabled), attempt to update profile name now
        try {
          const { data: userRes } = await supabase.auth.getUser()
          const newUser = userRes?.user || signUpData.user
          if (newUser?.id && formData.fullName.trim()) {
            await supabase.from("profiles").update({ full_name: formData.fullName.trim() }).eq("id", newUser.id)
          }
        } catch {}
        setSuccess("Account created! Please check your email to confirm.")
        setMode('login')
        setFormData({ fullName: "", email: "", password: "", confirmPassword: "" })
      } else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `₹{window.location.origin}/auth/reset`,
        })
        if (resetError) throw resetError
        setSuccess("Password reset link sent! Please check your email.")
        setFormData({ fullName: "", email: "", password: "", confirmPassword: "" })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Discoverprojects</CardTitle>
            <CardDescription>
              {mode === 'login' ? "Welcome back" : 
               mode === 'signup' ? "Join our community" : 
               "Reset your password"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={mode === 'login' || mode === 'signup'}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">{error}</div>
              )}

              {success && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-sm text-primary">{success}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Processing..." : 
                 mode === 'login' ? "Sign In" : 
                 mode === 'signup' ? "Create Account" : 
                 "Send Reset Link"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    onClick={() => {
                      setMode('signup')
                      setError(null)
                      setSuccess(null)
                    }}
                    className="p-0 h-auto font-semibold"
                  >
                    Sign Up
                  </Button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                      setSuccess(null)
                    }}
                    className="p-0 h-auto font-semibold"
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <Button
                  variant="link"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                    setSuccess(null)
                  }}
                  className="p-0 h-auto font-semibold"
                >
                  Back to Sign In
                </Button>
              )}
            </div>
            
            {mode === 'login' && (
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setMode('reset')
                    setError(null)
                    setSuccess(null)
                  }}
                  className="p-0 h-auto text-sm"
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            {mode === 'login' && (
              <div className="relative flex items-center justify-center">
                <span className="absolute inset-x-0 top-1/2 border-t border-border" aria-hidden="true" />
                <span className="relative bg-card px-2 text-xs text-muted-foreground">or</span>
              </div>
            )}

            {mode === 'login' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                Continue with Google
              </Button>
            )}

            {mode === 'signup' && (
              <div className="relative flex items-center justify-center">
                <span className="absolute inset-x-0 top-1/2 border-t border-border" aria-hidden="true" />
                <span className="relative bg-card px-2 text-xs text-muted-foreground">or</span>
              </div>
            )}

            {mode === 'signup' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                Sign up with Google
              </Button>
            )}

            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
                Continue as guest
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
