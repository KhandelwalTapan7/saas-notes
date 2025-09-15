import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 text-white">
      <h1 className="text-xl mb-2">SaaS Notes</h1>
      <p className="mb-4">Login → then manage your notes.</p>
      <Link href="/login" className="underline text-blue-400">
        Go to Login
      </Link>
    </main>
  );
}
