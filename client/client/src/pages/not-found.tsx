import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-[250px]">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link href="/" className="w-full max-w-xs">
          <button className="w-full py-4 rounded-xl bg-gray-900 text-white font-semibold shadow-lg shadow-gray-200 active:scale-[0.98] transition-all">
            Return Home
          </button>
        </Link>
      </div>
    </Layout>
  );
}
