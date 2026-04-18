import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, Save, X } from "lucide-react";

const emptyForm = {
  title: "",
  author: "",
  category: "",
  price: 0,
  original_price: null as number | null,
  stock: 0,
  image: "",
  description: "",
  language: "English",
};

const BooksAdmin: React.FC = () => {
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    fetchBooks();
  }, [profile]);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Failed to fetch books");
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s: any) => ({ ...s, [name]: name === "price" || name === "stock" || name === "original_price" ? (value === "" ? null : Number(value)) : value }));
  };

  const startEdit = (b: any) => {
    setEditingId(b.id);
    setForm({
      title: b.title ?? "",
      author: b.author ?? "",
      category: b.category ?? "",
      price: b.price ?? 0,
      original_price: b.original_price ?? null,
      stock: b.stock ?? 0,
      image: b.image ?? "",
      description: b.description ?? "",
      language: b.language ?? "English",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const save = async () => {
    if (!form.title || !form.author || !form.category || !form.price) {
      toast.error("Please fill title, author, category, and price");
      return;
    }
    try {
      let res;
      if (editingId) {
        res = await supabase.from("books").update(form).eq("id", editingId).select().single();
      } else {
        res = await supabase.from("books").insert(form).select().single();
      }
      if (res.error) throw res.error;
      toast.success(editingId ? "Book updated" : "Book created");
      resetForm();
      await fetchBooks();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Delete failed");
    } else {
      toast.success("Book deleted");
      await fetchBooks();
    }
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">Please login.</main><Footer /></div>
  );
  if (profile?.role !== "admin") return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">Not authorized.</main><Footer /></div>
  );

  const categories = ["Fiction", "Non-Fiction", "Self-Help", "History", "Science & Technology", "Literature", "Philosophy", "Business", "Poetry", "Children", "Other"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Book Management</h1>
                <p className="text-muted-foreground font-body text-sm">{books.length} books in catalog</p>
              </div>
            </div>
            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-body font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Book
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <section className="mb-8 bg-card rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-foreground">{editingId ? "Edit Book" : "Add New Book"}</h2>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Book title" className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Author *</label>
                  <input name="author" value={form.author} onChange={handleChange} placeholder="Author name" className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground border border-transparent focus:border-primary focus:outline-none">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Language</label>
                  <input name="language" value={form.language} onChange={handleChange} placeholder="Language" className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Price (₹) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="299" className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Original Price (₹)</label>
                  <input name="original_price" type="number" value={form.original_price ?? ""} onChange={handleChange} placeholder="499" className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Stock</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="50" className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Image URL</label>
                  <input name="image" value={form.image} onChange={handleChange} placeholder="/book-cover-pic/book1.jpg" className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-body font-medium text-foreground mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Book description..." rows={3} className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none resize-none" />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={save} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-body font-medium text-sm hover:opacity-90 flex items-center gap-2">
                  <Save className="w-4 h-4" /> {editingId ? "Update Book" : "Save Book"}
                </button>
                <button onClick={resetForm} className="bg-muted text-foreground px-5 py-2.5 rounded-lg font-body font-medium text-sm hover:bg-muted/80">Cancel</button>
              </div>
            </section>
          )}

          {/* Books Grid */}
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading books...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-xl text-foreground mb-2">No books in catalog</p>
              <button onClick={() => setShowForm(true)} className="text-primary font-body hover:underline">Add your first book</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b) => (
                <div key={b.id} className="bg-card rounded-xl card-shadow p-4 hover:scale-[1.01] transition-transform">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {b.image ? (
                        <img src={b.image} alt={b.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-primary/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground text-sm truncate">{b.title}</h3>
                      <p className="text-xs font-body text-muted-foreground">{b.author}</p>
                      <p className="text-xs font-body text-muted-foreground mt-1">{b.category} · {b.language}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-display font-bold text-foreground">₹{b.price}</span>
                        {b.original_price && <span className="text-xs text-muted-foreground line-through">₹{b.original_price}</span>}
                        <span className="text-xs text-muted-foreground">· Stock: {b.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    <button onClick={() => startEdit(b)} className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-body font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => remove(b.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-xs font-body font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BooksAdmin;
