import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, BookOpen, ArrowLeft, Truck, ShieldCheck, RotateCcw, Loader2 } from "lucide-react";
import { useBook, useBooks } from "@/hooks/useBooks";
import { useReviews, useAddReview } from "@/hooks/useReviews";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { motion } from "framer-motion";
import { useState } from "react";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: book, isLoading } = useBook(id || "");
  const { data: allBooks = [] } = useBooks();
  const { data: reviews = [] } = useReviews(id || "");
  const addReview = useAddReview(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">Book Not Found</h1>
            <Link to="/books" className="text-primary font-body hover:underline">Browse all books</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const related = allBooks.filter(b => b.category === book.category && b.id !== book.id).slice(0, 4);
  const wishlisted = isInWishlist(book.id);
  const discount = book.originalPrice ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100) : 0;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addReview.mutate({ rating: reviewRating, comment: reviewComment });
    setReviewComment("");
    setReviewRating(5);
  };

  const handleBuyNow = () => {
    addToCart(book, qty);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link to="/books" className="inline-flex items-center gap-2 text-muted-foreground font-body text-sm hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Books
          </Link>

          <div className="grid md:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center perspective-book">
              <div className="book-3d">
                <div className="w-56 h-80 bg-gradient-saffron rounded-lg flex flex-col items-center justify-center p-6 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-transparent rounded-lg" />
                  <div className="absolute left-0 top-0 bottom-0 w-5 bg-foreground/10 rounded-l-lg" />
                  <BookOpen className="w-14 h-14 text-primary-foreground/70 mb-4" />
                  <h3 className="text-primary-foreground font-display font-bold text-lg text-center leading-snug">{book.title}</h3>
                  <p className="text-primary-foreground/70 text-sm font-body mt-2">{book.author}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-1">{book.category}</p>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{book.title}</h1>
                <p className="font-body text-lg text-muted-foreground mt-1">by {book.author}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">{[1,2,3,4,5].map(s => (<Star key={s} className={`w-5 h-5 ${s <= Math.round(book.rating) ? "fill-gold text-gold" : "text-muted"}`} />))}</div>
                <span className="font-body text-sm font-medium text-foreground">{book.rating}</span>
                <span className="font-body text-sm text-muted-foreground">({book.reviewCount.toLocaleString("en-IN")} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-foreground">₹{book.price}</span>
                {book.originalPrice && (
                  <>
                    <span className="font-body text-lg text-muted-foreground line-through">₹{book.originalPrice}</span>
                    <span className="bg-success/10 text-success text-sm font-body font-semibold px-2 py-0.5 rounded-full">{discount}% off</span>
                  </>
                )}
              </div>

              <p className="font-body text-muted-foreground leading-relaxed">{book.description}</p>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 font-body text-foreground hover:bg-muted transition-colors rounded-l-lg">−</button>
                  <span className="px-4 py-2 font-body font-medium text-foreground">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2 font-body text-foreground hover:bg-muted transition-colors rounded-r-lg">+</button>
                </div>
                <span className="text-sm font-body text-muted-foreground">{book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => addToCart(book, qty)} className="bg-gradient-saffron text-primary-foreground px-6 py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95">
                  Buy Now
                </button>
                <button onClick={() => toggleWishlist(book)} className={`p-3 rounded-full border transition-all hover:scale-110 ${wishlisted ? "border-primary bg-primary/10" : "border-border"}`}>
                  <Heart className={`w-5 h-5 ${wishlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="flex flex-col items-center text-center gap-1"><Truck className="w-5 h-5 text-primary" /><span className="text-xs font-body text-muted-foreground">Free Delivery</span></div>
                <div className="flex flex-col items-center text-center gap-1"><ShieldCheck className="w-5 h-5 text-primary" /><span className="text-xs font-body text-muted-foreground">Secure Payment</span></div>
                <div className="flex flex-col items-center text-center gap-1"><RotateCcw className="w-5 h-5 text-primary" /><span className="text-xs font-body text-muted-foreground">7-Day Return</span></div>
              </div>
            </motion.div>
          </div>

          {/* Reviews */}
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
            
            {user && (
              <form onSubmit={handleSubmitReview} className="bg-card rounded-xl p-5 card-shadow mb-6 space-y-3">
                <h3 className="font-body font-semibold text-foreground">Write a Review</h3>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewRating(s)}>
                      <Star className={`w-6 h-6 cursor-pointer ${s <= reviewRating ? "fill-gold text-gold" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-2 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none resize-none h-20"
                />
                <button type="submit" disabled={addReview.isPending} className="bg-gradient-saffron text-primary-foreground px-5 py-2 rounded-full font-body font-semibold text-sm hover:opacity-90 disabled:opacity-50">
                  {addReview.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {reviews.length === 0 && <p className="font-body text-muted-foreground">No reviews yet. Be the first!</p>}
              {reviews.map(r => (
                <div key={r.id} className="bg-card rounded-xl p-5 card-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body font-semibold text-foreground">{r.user_name}</span>
                    <span className="font-body text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex mb-2">{[1,2,3,4,5].map(s => (<Star key={s} className={`w-4 h-4 ${s <= r.rating ? "fill-gold text-gold" : "text-muted"}`} />))}</div>
                  <p className="font-body text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map((b, i) => (<BookCard key={b.id} book={b} index={i} />))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookDetailPage;
