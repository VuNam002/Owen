import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useAuth } from "../../context/AuthContext" 
import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      return
    }
    setIsSubmitting(true)
    try {
      const success = await login(email.trim(), password)
      
      console.log("Login result:", success) 
      
      if (success) {
        navigate("/admin/dashboard")
      }
    } catch (err) {
      console.error("Login failed:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormDisabled = loading || isSubmitting
  const isSubmitDisabled = isFormDisabled || !email.trim() || !password.trim()

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {error}
                </div>
              )}
              
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isFormDisabled}
                  autoComplete="email"
                />
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="inline-block ml-auto text-sm underline-offset-4 hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isFormDisabled}
                  autoComplete="current-password"
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitDisabled}
                >
                  {isFormDisabled ? "Logging in..." : "Login"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  type="button"
                  disabled={isFormDisabled}
                  onClick={() => {
                    console.log("Google login clicked")
                  }}
                >
                  Login with Google
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-center">
              Don&apos;t have an account?{" "}
              <a 
                href="/signup" 
                className="underline underline-offset-4 hover:text-primary"
                onClick={(e) => {
                  e.preventDefault()
                  navigate("/signup")
                }}
              >
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}