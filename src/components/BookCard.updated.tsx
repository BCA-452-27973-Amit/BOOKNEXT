const BookCard = ({ book, index = 0 }: BookCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(book.id);
  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative bg-card rounded-xl overflow-hidden book-shadow"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {book.bestseller && (
          <span className="bg-gradient-saffron text-primary-foreground text-[10px] font-bold font-body px-2 py-0.5 rounded-full uppercase tracking-wider">
            Bestseller
          </span>
        )}
        {discount > 0 && (
          <span className="bg-secondary text-secondary-foreground text-[10px] font-bold font-body px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(book)}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
      >
        <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      </button>

      {/* Image / Book Cover */}
      <Link to={`/book/${book.id}`} className="block overflow-hidden">
        {book.image ? (
          <div className="relative h-56 w-full overflow-hidden bg-muted">
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="relative h-56 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary/50 mb-2" />
              <p className="text-sm font-display font-semibold text-center text-primary/50 px-2">{book.title}</p>
            </div>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">{book.category}</p>
        <Link to={`/book/${book.id}`}>
          <h3 className="font-display font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm font-body text-muted-foreground">{book.author}</p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span className="text-xs font-body font-medium text-foreground">{book.rating}</span>
          <span className="text-xs font-body text-muted-foreground">({book.reviewCount.toLocaleString("en-IN")})</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-display font-bold text-foreground">₹{book.price}</span>
            {book.originalPrice && (
              <span className="text-xs font-body text-muted-foreground line-through">₹{book.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(book)}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all hover:scale-110 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
