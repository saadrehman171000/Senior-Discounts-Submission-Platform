import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the Senior Discounts admin panel
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-amber-600 hover:bg-amber-700 text-sm',
              card: 'shadow-lg',
            }
          }}
          routing="path"
          path="/sign-in"
          redirectUrl="/admin"
        />
      </div>
    </div>
  )
}
