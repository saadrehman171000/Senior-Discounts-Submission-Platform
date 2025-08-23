import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to access Senior Discounts
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-amber-600 hover:bg-amber-700 text-sm',
              card: 'shadow-lg',
            }
          }}
          routing="path"
          path="/sign-up"
          redirectUrl="/admin"
        />
      </div>
    </div>
  )
}
