import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/payment/PaymentModal";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [manualMethod, setManualMethod] = useState("bank_transfer");
  const [placing, setPlacing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const placeManualOrder = async () => {
    if (!user) return;
    setPlacing(true);
    const total = Math.round(totalPrice * 1.18);

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: total,
      shipping_name: form.name,
      shipping_email: form.email,
      shipping_phone: form.phone,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_state: form.state,
      shipping_pincode: form.pincode,
      payment_method: "manual",
      status: "confirmed",
      payment_status: "pending",
    }).select().single();

    if (orderError || !order) {
      toast.error("Failed to place order");
      setPlacing(false);
      return;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      book_id: item.book.id,
      quantity: item.quantity,
      price: item.book.price,
    }));

    await supabase.from("order_items").insert(orderItems);

    const paymentMethodName = manualMethod === "bank_transfer" ? "bank_transfer" : "upi";
    const { data: payment, error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      order_id: order.id,
      amount: total,
      method: paymentMethodName,
      status: "pending",
    }).select().single();

    if (paymentError || !payment) {
      toast.error("Failed to create payment record");
      setPlacing(false);
      return;
    }

    await clearCart();
    setPlacing(false);
    toast.success("Order placed. Please upload payment proof for verification.");
    navigate(`/payments/upload?payment_id=${payment.id}`);
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.pincode) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (!user) { toast.error("Please login to place an order"); navigate("/login"); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!user) return;
    setPlacing(true);
    const total = Math.round(totalPrice * 1.18);

    const { data: order, error: orderError } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: total,
      shipping_name: form.name,
      shipping_email: form.email,
      shipping_phone: form.phone,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_state: form.state,
      shipping_pincode: form.pincode,
      payment_method: paymentMethod,
      status: "confirmed",
      payment_status: paymentMethod === "cod" ? "pending" : "paid",
    }).select().single();

    if (orderError || !order) {
      toast.error("Failed to place order");
      setPlacing(false);
      return;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      book_id: item.book.id,
      quantity: item.quantity,
      price: item.book.price,
    }));

    await supabase.from("order_items").insert(orderItems);
    await clearCart();
    setPlacing(false);
    toast.success("Order placed successfully! 🎉");
    navigate("/orders");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (paymentMethod === "cod") {
      // COD: place order directly without opening payment modal
      await placeOrder();
    } else if (paymentMethod === "manual") {
      // Manual bank/UPI transfer: create order and payments row, redirect to upload proof
      await placeManualOrder();
    } else {
      // UPI / Card: open payment modal first, then place order on success
      setPaymentModalOpen(true);
    }
  };
  const total = Math.round(totalPrice * 1.18);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-xl text-foreground mb-4">No items to checkout</p>
            <Link to="/books" className="text-primary font-body hover:underline">Browse books</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>
          <div className="grid lg:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-xl font-semibold text-foreground">Delivery Details</h3>
              {[
                { name: "name", label: "Full Name", type: "text" },
                { name: "email", label: "Email", type: "email" },
                { name: "phone", label: "Phone Number", type: "tel" },
                { name: "address", label: "Address", type: "text" },
                { name: "city", label: "City", type: "text" },
                { name: "state", label: "State", type: "text" },
                { name: "pincode", label: "PIN Code", type: "text" },
              ].map(field => (
                <div key={field.name}>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">{field.label}</label>
                  <input name={field.name} type={field.type} value={(form as Record<string, string>)[field.name]} onChange={handleChange} className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none" placeholder={field.label} />
                </div>
              ))}

              <h3 className="font-display text-xl font-semibold text-foreground pt-4">Payment Method</h3>
              <div className="space-y-2">
                {[
                  { value: "cod", label: "Cash on Delivery (COD)", desc: "Pay when your order arrives" },
                  { value: "upi", label: "UPI Payment", desc: "Pay via QR code or UPI ID" },
                  { value: "manual", label: "Bank / UPI (Manual)", desc: "Upload transfer proof and admin will verify" },
                  { value: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Rupay & more" },
                ].map(method => (
                  <label key={method.value} className={`flex items-start gap-3 p-3 bg-card rounded-lg card-shadow cursor-pointer hover:bg-muted transition-colors ${paymentMethod === method.value ? "ring-2 ring-primary" : ""}`}>
                    <input type="radio" name="payment" checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="accent-primary mt-0.5" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{method.label}</p>
                      <p className="font-body text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === "manual" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-foreground mb-1">Manual Payment Type</label>
                  <select value={manualMethod} onChange={(e) => setManualMethod(e.target.value)} className="w-full px-3 py-2 rounded bg-muted">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI Transfer</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">After placing the order you'll be asked to upload a payment proof; an admin will verify it.</p>
                </div>
              )}

              <button type="submit" disabled={placing} className="w-full bg-gradient-saffron text-primary-foreground py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all mt-4 disabled:opacity-50">
                {placing
                  ? "Placing Order..."
                  : paymentMethod === "cod"
                    ? `Place Order — ₹${total.toLocaleString("en-IN")}`
                    : `Proceed to Pay — ₹${total.toLocaleString("en-IN")}`}
              </button>
            </form>

            <PaymentModal
              open={paymentModalOpen}
              onClose={() => setPaymentModalOpen(false)}
              onSuccess={placeOrder}
              amount={total}
              paymentMethod={paymentMethod as "upi" | "card"}
            />
            <div className="bg-card rounded-xl p-6 card-shadow h-fit sticky top-24">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.book.id} className="flex justify-between font-body text-sm">
                    <span className="text-foreground truncate mr-2">{item.book.title} × {item.quantity}</span>
                    <span className="text-foreground font-medium shrink-0">₹{(item.book.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-3 space-y-1 font-body text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{totalPrice.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>GST (18%)</span><span>₹{Math.round(totalPrice * 0.18).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="text-success">Free</span></div>
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-display font-bold text-lg text-foreground">
                <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
