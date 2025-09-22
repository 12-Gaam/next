import React from 'react';
import Link from "next/link";

function FooterPage() {
  return (
    <>
    <footer className="bg-primary text-white pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 mb-4 justify-between items-center">
            <div className='text-center'>
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <Link href="/">
                        
                    <span className="text-2xl font-bold text-white">12Gaam</span>
                    </Link>
                </div>
                {/* <p className="text-blue-100 text-sm">
                Connecting twelve villages through shared heritage, values, and community spirit.
                </p> */}
            </div>
            
            <div className='flex gap-4'>
                <ul className="space-x-10 text-sm text-blue-100 inline-flex list-disc pl-4 mb-0">
                    <li className="list-none"><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                    <li className='pl-4 pr-4'><Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                </ul>
            </div>
            </div>
            
            <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-blue-100 text-sm mb-0">
                © {new Date().getFullYear()} 12Gaam. All rights reserved.
            </p>
            </div>
        </div>
    </footer>
    </>
  )
}

export default FooterPage