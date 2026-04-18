import { useBooks } from "@/hooks/useBooks";
import BookCard from "./BookCard";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

const FeaturedBooks = () => {
  const { data: books = [], isLoading } = useBooks();
  const featured = books.filter((b) => b.featured).slice(0, 4);
  const bestsellers = books.filter((b) => b.bestseller).slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Featured Books</h2>
            <Link to="/books" className="flex items-center gap-1 text-primary font-body font-medium text-sm hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((book, i) => (<BookCard key={book.id} book={book} index={i} />))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-navy rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary-foreground mb-2">Flat 30% Off on First Order</h3>
              <p className="font-body text-secondary-foreground/70">Use code <span className="font-semibold text-gold">BOOKNEXT30</span> at checkout. Free delivery across India!</p>
            </div>
            <Link to="/books" className="bg-gradient-saffron text-primary-foreground px-6 py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all whitespace-nowrap">Shop Now</Link>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Bestsellers</h2>
            <Link to="/books" className="flex items-center gap-1 text-primary font-body font-medium text-sm hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestsellers.map((book, i) => (<BookCard key={book.id} book={book} index={i} />))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedBooks;
