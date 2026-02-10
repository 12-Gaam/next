import React from 'react';
import Link from 'next/link';

function FooterPage() {
    return (
        <footer className="bg-primary text-white border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <Link href="/" className="group">
                            <span className="text-2xl font-black tracking-tighter text-white transition-transform group-hover:scale-105 block">
                                12<span className="text-secondary">Gaam</span>
                            </span>
                        </Link>
                        <p className="text-blue-100/60 text-xs max-w-xs text-center md:text-left leading-relaxed">
                            Connecting our villages through tradition and community.
                        </p>
                    </div>

                    {/* Navigation Section */}
                    <nav className="flex items-center space-x-6 text-xs font-medium">
                        <Link href="/" className="text-blue-100/80 hover:text-white transition-colors">
                            Home
                        </Link>
                        <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                        <Link href="/terms-and-conditions" className="text-blue-100/80 hover:text-white transition-colors">
                            Terms & Conditions
                        </Link>
                    </nav>
                </div>

                {/* Bottom Bar */}
                <div className="mt-6 md:mt-8 pt-4 border-t border-white/10 text-center">
                    <p className="text-blue-100/40 text-[10px] tracking-widest uppercase mb-0">
                        © {new Date().getFullYear()} 12Gaam Community • All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default FooterPage;