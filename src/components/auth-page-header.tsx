import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type AuthPageHeaderProps = {
  title: ReactNode;
  subtitle: string;
};

export function AuthPageHeader({ title, subtitle }: AuthPageHeaderProps) {
  return (
    <>
      <div className="mb-8 flex flex-col items-center">
        <Link
          href="/"
          className="rounded-2xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Back to BarangayLink home"
        >
          <Image src="/logo.png" alt="" width={100} height={100} />
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </>
  );
}

