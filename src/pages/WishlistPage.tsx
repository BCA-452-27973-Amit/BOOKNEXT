import { useCart } from "@/context/CartContext";
import BookCard from "@/components/BookCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const WishlistPage = () => {
  const { wishlist } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">My Wishlist</h1>
          {wishlist.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-xl text-foreground mb-2">Your wishlist is empty</p>
              <p className="font-body text-muted-foreground mb-6">Save books you love for later!</p>
              <Link to="/books" className="bg-gradient-saffron text-primary-foreground px-6 py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all">
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
