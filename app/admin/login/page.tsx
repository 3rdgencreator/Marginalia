import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect('/admin');

  return (
    <div className="min-h-screen bg-[#1F1F21] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Marginalia</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        <form
          action={async (formData) => {
            'use server';
            await signIn('credentials', {
              email: formData.get('email'),
              password: formData.get('password'),
              redirectTo: '/admin',
            });
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-[#2A2A2C] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#9EFF0A]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-[#2A2A2C] border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#9EFF0A]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#580AFF] text-white py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150 mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
