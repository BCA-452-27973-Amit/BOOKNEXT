import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  shipping_name: string | null;
  shipping_email: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  created_at: string;
}

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

const AdminOrders = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    fetchOrders();
  }, [profile]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      console.error(error);
      toast.error("Failed to update order status");
    } else {
      toast.success(`Order marked as ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">Please login.</main><Footer /></div>
  );
  if (profile?.role !== "admin") return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">Not authorized.</main><Footer /></div>
  );

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const statusColor = (s: string) => {
    if (s === "delivered") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (s === "shipped") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (s === "confirmed") return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-muted text-muted-foreground border-border";
  };

  const payColor = (s: string) => {
    return s === "paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Order Management</h1>
              <p className="text-muted-foreground font-body text-sm">{orders.length} total orders</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["all", ...statusSteps].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors capitalize ${
                  filter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                {s} {s !== "all" && `(${orders.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-body">No orders found.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => (
                <div key={order.id} className="bg-card rounded-xl card-shadow overflow-hidden">
                  {/* Order Header */}
                  <div
                    className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                          <p className="font-display font-bold text-foreground">₹{order.total_amount.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${payColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                        <span className="text-xs text-muted-foreground font-body">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === order.id && (
                    <div className="px-5 pb-5 border-t border-border">
                      <div className="grid md:grid-cols-2 gap-6 pt-4">
                        {/* Shipping Info */}
                        <div>
                          <h3 className="font-display font-semibold text-foreground mb-2">Shipping Details</h3>
                          <div className="space-y-1 text-sm font-body text-muted-foreground">
                            <p><strong className="text-foreground">Name:</strong> {order.shipping_name || "-"}</p>
                            <p><strong className="text-foreground">Email:</strong> {order.shipping_email || "-"}</p>
                            <p><strong className="text-foreground">Phone:</strong> {order.shipping_phone || "-"}</p>
                            <p><strong className="text-foreground">Address:</strong> {order.shipping_address || "-"}</p>
                            <p><strong className="text-foreground">City:</strong> {order.shipping_city || "-"}, {order.shipping_state || "-"} — {order.shipping_pincode || "-"}</p>
                            <p><strong className="text-foreground">Payment:</strong> {order.payment_method?.toUpperCase() || "-"}</p>
                          </div>
                        </div>

                        {/* Status Update */}
                        <div>
                          <h3 className="font-display font-semibold text-foreground mb-3">Update Status</h3>
                          <div className="flex flex-wrap gap-2">
                            {statusSteps.map(step => (
                              <button
                                key={step}
                                onClick={() => updateStatus(order.id, step)}
                                disabled={order.status === step}
                                className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all capitalize ${
                                  order.status === step
                                    ? "bg-primary text-primary-foreground cursor-default"
                                    : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary border border-border"
                                }`}
                              >
                                {step === "pending" && <Clock className="w-3.5 h-3.5 inline mr-1" />}
                                {step === "confirmed" && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                                {step === "shipped" && <Truck className="w-3.5 h-3.5 inline mr-1" />}
                                {step === "delivered" && <Package className="w-3.5 h-3.5 inline mr-1" />}
                                {step}
                              </button>
                            ))}
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4 flex items-center gap-1">
                            {statusSteps.map((step, i) => (
                              <div key={step} className="flex items-center flex-1">
                                <div className={`w-full h-1.5 rounded-full ${
                                  statusSteps.indexOf(order.status) >= i ? "bg-primary" : "bg-muted"
                                }`} />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-1">
                            {statusSteps.map(step => (
                              <span key={step} className="text-[10px] text-muted-foreground font-body capitalize">{step}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

export default AdminOrders;
