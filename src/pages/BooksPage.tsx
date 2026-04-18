import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";
import BookCard from "@/components/BookCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = ["Fiction", "Non-Fiction", "Self-Help", "History", "Science & Technology", "Literature", "Philosophy", "Business", "Poetry", "Children"];

const priceRanges = [
  { label: "Under ₹200", min: 0, max: 200 },
  { label: "₹200 - ₹400", min: 200, max: 400 },
  { label: "₹400 - ₹600", min: 400, max: 600 },
  { label: "Above ₹600", min: 600, max: Infinity },
];

const BooksPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const { data: books = [], isLoading } = useBooks();

  const filtered = useMemo(() => {
    let result = [...books];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
    }
    if (selectedCategory) result = result.filter(b => b.category === selectedCategory);
    if (selectedPrice !== null) {
      const range = priceRanges[selectedPrice];
      result = result.filter(b => b.price >= range.min && b.price < range.max);
    }
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [books, searchQuery, selectedCategory, selectedPrice, sortBy]);

  const clearFilters = () => { setSelectedCategory(""); setSelectedPrice(null); setSearchQuery(""); setSortBy("relevance"); };
  const hasFilters = selectedCategory || selectedPrice !== null || searchQuery;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">All Books</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">{filtered.length} books found</p>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2 bg-muted rounded-full font-body text-sm">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-8">
              <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-60 shrink-0 space-y-6`}>
                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-2">Search</label>
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full px-3 py-2 bg-muted rounded-lg text-sm font-body text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-2">Category</label>
                  <div className="space-y-1">
                    <button onClick={() => setSelectedCategory("")} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>All</button>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-2">Price Range</label>
                  <div className="space-y-1">
                    {priceRanges.map((range, i) => (
                      <button key={i} onClick={() => setSelectedPrice(selectedPrice === i ? null : i)} className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${selectedPrice === i ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>{range.label}</button>
                    ))}
                  </div>
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-body text-primary hover:underline">
                    <X className="w-3 h-3" /> Clear all filters
                  </button>
                )}
              </aside>

              <div className="flex-1">
                <div className="flex items-center justify-end mb-4">
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 bg-muted rounded-lg text-sm font-body text-foreground border border-transparent focus:border-primary focus:outline-none">
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
                {filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="font-display text-xl text-foreground mb-2">No books found</p>
                    <p className="font-body text-muted-foreground">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filtered.map((book, i) => (<BookCard key={book.id} book={book} index={i} />))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BooksPage;
