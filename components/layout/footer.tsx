import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background p-5">
      <div className=" flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">
              swipe<span className="text-primary">it</span>
            </span>
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            AI-powered semantic recruitment platform
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <nav className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </nav>
          
          <div className="text-center text-sm text-muted-foreground md:text-right">
            © {new Date().getFullYear()} SwipeIt. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;