import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-xl text-foreground mb-2">Your cart is empty</p>
              <p className="font-body text-muted-foreground mb-6">Add some books to get started!</p>
              <Link to="/books" className="bg-gradient-saffron text-primary-foreground px-6 py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all">
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 bg-card rounded-xl p-4 card-shadow"
                  >
                    <Link to={`/book/${item.book.id}`} className="shrink-0 w-20 h-28 bg-gradient-saffron rounded-md flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-primary-foreground/60" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/book/${item.book.id}`}>
                        <h3 className="font-display font-semibold text-foreground truncate hover:text-primary transition-colors">{item.book.title}</h3>
                      </Link>
                      <p className="font-body text-sm text-muted-foreground">{item.book.author}</p>
                      <p className="font-display font-bold text-foreground mt-1">₹{item.book.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-border rounded-lg">
                          <button onClick={() => updateQuantity(item.book.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors rounded-l-lg">
                            <Minus className="w-3.5 h-3.5 text-foreground" />
                          </button>
                          <span className="px-3 font-body text-sm font-medium text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.book.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors rounded-r-lg">
                            <Plus className="w-3.5 h-3.5 text-foreground" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.book.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-foreground">₹{item.book.price * item.quantity}</p>
                    </div>
                  </motion.div>
                ))}
                <button onClick={clearCart} className="text-sm font-body text-destructive hover:underline">Clear Cart</button>
              </div>

              {/* Summary */}
              <div className="bg-card rounded-xl p-6 card-shadow h-fit sticky top-24 space-y-4">
                <h3 className="font-display text-xl font-bold text-foreground">Order Summary</h3>
                <div className="space-y-2 font-body text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span><span className="text-success">Free</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18%)</span><span>₹{Math.round(totalPrice * 0.18).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-lg text-foreground">
                  <span>Total</span><span>₹{Math.round(totalPrice * 1.18).toLocaleString("en-IN")}</span>
                </div>
                <Link to="/checkout" className="block w-full bg-gradient-saffron text-primary-foreground text-center py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all">
                  Proceed to Checkout
                </Link>
                <Link to="/books" className="flex items-center justify-center gap-1 text-sm font-body text-primary hover:underline">
                  <ArrowLeft className="w-3 h-3" /> Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
