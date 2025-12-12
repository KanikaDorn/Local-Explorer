import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white dark:bg-black dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Explorer Hub</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Discover the best weekend getaways and plan your perfect trip in minutes with AI.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/explore" className="hover:text-blue-600 transition-colors">Explore</Link></li>
              <li><Link href="/generate-plan" className="hover:text-blue-600 transition-colors">AI Planner</Link></li>
              <li><Link href="/plans" className="hover:text-blue-600 transition-colors">My Plans</Link></li>
              <li><Link href="/bucket-list" className="hover:text-blue-600 transition-colors">Bucket List</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Social</h4>
             <div className="flex items-center gap-4">
               <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                 <Twitter className="h-5 w-5" />
               </Link>
               <Link href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                 <Instagram className="h-5 w-5" />
               </Link>
               <Link href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                 <Github className="h-5 w-5" />
               </Link>
             </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Explorer Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
