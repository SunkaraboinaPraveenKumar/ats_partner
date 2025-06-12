import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Info, Shield, FileText, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
        {/* Brand and Tagline */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <span className="font-bold text-2xl">
              swipe<span className="text-primary">it</span>
            </span>
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            AI-powered semantic recruitment platform
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <nav className="flex flex-col gap-3">
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2">
              <Info className="h-4 w-4" /> About
            </Link>
            <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2">
              <Shield className="h-4 w-4" /> Privacy
            </Link>
            <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2">
              <FileText className="h-4 w-4" /> Terms
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2">
              <Phone className="h-4 w-4" /> Contact
            </Link>
          </nav>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook className="h-6 w-6" /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Twitter className="h-6 w-6" /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Linkedin className="h-6 w-6" /></a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram className="h-6 w-6" /></a>
          </div>
        </div>

        {/* Contact Info (Placeholder - can be removed or filled) */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            JNTUH, Kukatpally<br/>
            Email: sunkaraboinap@gmail.com<br/>
            Phone: 9347160766
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground border-t pt-8 mt-8">
        © {new Date().getFullYear()} SwipeIt. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;