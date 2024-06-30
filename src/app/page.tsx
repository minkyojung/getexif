"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Landing() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/Protected'); // 로그인 상태라면 Protected 페이지로 리다이렉션
      }
    };
    checkSession();
  }, [router, pathname]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://nfdylwwxccgaajqzrvop.supabase.co/auth/v1/callback`,
      },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1>Welcome to EXIF Extractor</h1>
      <p>Upload your images and extract EXIF data easily.</p>
      <button onClick={handleLogin}>Log in with Google</button>
    </main>
  );
}
