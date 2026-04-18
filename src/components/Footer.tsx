import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-saffron p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">BookNext</span>
          </div>
          <p className="font-body text-sm text-secondary-foreground/70">
            India's favourite online bookstore. Delivering great reads to your doorstep since 2024.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Quick Links</h4>
          <div className="space-y-2 font-body text-sm text-secondary-foreground/70">
            <Link to="/books" className="block hover:text-secondary-foreground transition-colors">All Books</Link>
            <Link to="/books?category=Fiction" className="block hover:text-secondary-foreground transition-colors">Fiction</Link>
            <Link to="/books?category=Non-Fiction" className="block hover:text-secondary-foreground transition-colors">Non-Fiction</Link>
            <Link to="/books?category=Self-Help" className="block hover:text-secondary-foreground transition-colors">Self-Help</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Support</h4>
          <div className="space-y-2 font-body text-sm text-secondary-foreground/70">
            <p className="hover:text-secondary-foreground cursor-pointer transition-colors">Shipping Policy</p>
            <p className="hover:text-secondary-foreground cursor-pointer transition-colors">Return Policy</p>
            <p className="hover:text-secondary-foreground cursor-pointer transition-colors">FAQ</p>
            <p className="hover:text-secondary-foreground cursor-pointer transition-colors">Privacy Policy</p>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Contact Us</h4>
          <div className="space-y-3 font-body text-sm text-secondary-foreground/70">
            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@booknext.in</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> New Delhi, India</p>
          </div>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10 mt-8 pt-6 text-center font-body text-sm text-secondary-foreground/50">
        © 2024 BookNext. Made with ❤️ in India. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
