import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20 flex flex-col items-center justify-center text-center">
      <main className="flex flex-col items-center gap-[32px]">
        {/* You can replace this with your app's logo or icon if you have one */}
        <Image
          src="/next.svg"
          alt="App Logo"
          width={180}
          height={38}
          priority
        />
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          Buyer Lead Intake System
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Capture, manage, and track your buyer leads with ease.
          This simple application helps you stay on top of your sales pipeline.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
          <Link
            href="/buyers"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm sm:text-base h-12 px-5 w-full sm:w-auto"
          >
            Manage Leads
          </Link>
          <Link
            href="/buyers/new"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm sm:text-base h-12 px-5 w-full sm:w-auto"
          >
            Add New Lead
          </Link>
        </div>
      </main>
      
      <footer className="mt-auto text-sm text-gray-500">
        &copy; {new Date().getFullYear()} created by Kartik Goel. All rights reserved.
      </footer>
    </div>
  );
}