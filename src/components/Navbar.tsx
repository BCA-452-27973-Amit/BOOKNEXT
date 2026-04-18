import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, BookOpen, Menu, X, User, LogOut, Package, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { totalItems, wishlist } = useCart();
  const { user, profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Books" },
    { to: "/wishlist", label: "Wishlist" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="transition-transform duration-300 group-hover:scale-110">
              <img src="/Modern logo for online bookstore.png" alt="BookNext Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="font-display text-xl font-bold text-foreground hidden sm:inline">
              Book<span className="text-gradient-saffron">Next</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search books, authors..." className="w-full pl-10 pr-4 py-2 bg-muted rounded-full text-sm font-body text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none transition-colors" />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="nav-link text-sm font-medium font-body">{link.label}</Link>
            ))}
            <Link to="/wishlist" className="relative text-foreground/70 hover:text-foreground transition-colors">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{wishlist.length}</span>
              )}
            </Link>
            <Link to="/cart" className="relative text-foreground/70 hover:text-foreground transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="bg-gradient-saffron text-primary-foreground px-4 py-2 rounded-full text-sm font-medium font-body hover:opacity-90 transition-opacity flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.user_metadata?.full_name?.split(" ")[0] || "Account"}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl card-shadow border border-border py-2 z-50">
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 font-body text-sm text-foreground hover:bg-muted transition-colors">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    {profile?.role === "admin" && (
                      <>
                        <div className="border-t border-border my-1" />
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 font-body text-sm text-foreground hover:bg-muted transition-colors">
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                        <Link to="/admin/books" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 font-body text-sm text-foreground hover:bg-muted transition-colors">
                          <Shield className="w-4 h-4" /> Manage Books
                        </Link>
                        <Link to="/admin/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 font-body text-sm text-foreground hover:bg-muted transition-colors">
                          <Shield className="w-4 h-4" /> Manage Orders
                        </Link>
                        <Link to="/admin/pending" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 font-body text-sm text-foreground hover:bg-muted transition-colors">
                          <Shield className="w-4 h-4" /> Verify Payments
                        </Link>
                      </>
                    )}
                    <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-4 py-2 font-body text-sm text-destructive hover:bg-muted transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-saffron text-primary-foreground px-4 py-2 rounded-full text-sm font-medium font-body hover:opacity-90 transition-opacity flex items-center gap-2">
                <User className="w-4 h-4" /> Login
              </Link>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden bg-card border-b border-border">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search books, authors..." className="w-full pl-10 pr-4 py-2 bg-muted rounded-full text-sm font-body text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
              </form>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block py-2 text-foreground font-medium font-body">{link.label}</Link>
              ))}
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground font-medium font-body">My Orders</Link>
              {profile?.role === "admin" && (
                <>
                  <div className="border-t border-border mt-2 pt-2" />
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground font-medium font-body">🛡️ Admin Dashboard</Link>
                  <Link to="/admin/books" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground font-medium font-body">🛡️ Manage Books</Link>
                  <Link to="/admin/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground font-medium font-body">🛡️ Manage Orders</Link>
                  <Link to="/admin/pending" onClick={() => setMobileOpen(false)} className="block py-2 text-foreground font-medium font-body">🛡️ Verify Payments</Link>
                </>
              )}
              <div className="flex items-center gap-4 pt-2">
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-foreground font-body">
                  <ShoppingCart className="w-5 h-5" /> Cart ({totalItems})
                </Link>
                {user ? (
                  <button onClick={async () => { await signOut(); setMobileOpen(false); }} className="text-destructive font-body text-sm">Sign Out</button>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="bg-gradient-saffron text-primary-foreground px-4 py-2 rounded-full text-sm font-medium font-body">Login</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
