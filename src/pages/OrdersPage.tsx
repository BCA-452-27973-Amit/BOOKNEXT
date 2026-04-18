import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_city: string | null;
  created_at: string;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const statusColor = (s: string) => {
    if (s === "confirmed") return "bg-success/10 text-success";
    if (s === "shipped") return "bg-primary/10 text-primary";
    if (s === "delivered") return "bg-gold/10 text-gold";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">My Orders</h1>

          {!user ? (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground mb-4">Please login to view your orders</p>
              <Link to="/login" className="bg-gradient-saffron text-primary-foreground px-6 py-3 rounded-full font-body font-semibold">Login</Link>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-xl text-foreground mb-2">No orders yet</p>
              <Link to="/books" className="bg-gradient-saffron text-primary-foreground px-6 py-3 rounded-full font-body font-semibold">Shop Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-card rounded-xl p-5 card-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-body text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                      <p className="font-display font-bold text-foreground text-lg">₹{order.total_amount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-body font-semibold capitalize ${statusColor(order.status)}`}>{order.status}</span>
                      <p className="font-body text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 font-body text-xs text-muted-foreground">
                    <span>Payment: {order.payment_method?.toUpperCase()}</span>
                    <span>Status: {order.payment_status}</span>
                    {order.shipping_city && <span>City: {order.shipping_city}</span>}
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

export default OrdersPage;
