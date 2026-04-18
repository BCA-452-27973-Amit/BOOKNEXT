import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Package, CreditCard, Users, TrendingUp, ShieldCheck, AlertCircle, IndianRupee } from "lucide-react";

interface Stats {
  totalBooks: number;
  totalOrders: number;
  pendingPayments: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0, totalOrders: 0, pendingPayments: 0, totalRevenue: 0,
    totalUsers: 0, pendingOrders: 0, confirmedOrders: 0, deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadStats();
  }, [profile]);

  const loadStats = async () => {
    setLoading(true);
    const [booksRes, ordersRes, paymentsRes, profilesRes] = await Promise.all([
      supabase.from("books").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("*"),
      supabase.from("payments").select("id,status", { count: "exact" }).eq("status", "pending"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const orders = ordersRes.data || [];
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

    setStats({
      totalBooks: booksRes.count || 0,
      totalOrders: orders.length,
      pendingPayments: paymentsRes.count || 0,
      totalRevenue,
      totalUsers: profilesRes.count || 0,
      pendingOrders: orders.filter((o: any) => o.status === "pending").length,
      confirmedOrders: orders.filter((o: any) => o.status === "confirmed").length,
      deliveredOrders: orders.filter((o: any) => o.status === "delivered").length,
    });

    // recent 5 orders
    const { data: recent } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
    setRecentOrders(recent || []);
    setLoading(false);
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">Please login.</main><Footer /></div>
  );
  if (profile?.role !== "admin") return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">You are not authorized.</main><Footer /></div>
  );

  const statCards = [
    { label: "Total Books", value: stats.totalBooks, icon: BookOpen, color: "from-blue-500 to-blue-600", link: "/admin/books" },
    { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "from-emerald-500 to-emerald-600", link: "/admin/orders" },
    { label: "Pending Payments", value: stats.pendingPayments, icon: AlertCircle, color: "from-amber-500 to-amber-600", link: "/admin/pending" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "from-purple-500 to-purple-600", link: "/admin/orders" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-pink-500 to-pink-600", link: "#" },
    { label: "Delivered", value: stats.deliveredOrders, icon: ShieldCheck, color: "from-teal-500 to-teal-600", link: "/admin/orders" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground font-body mt-1">Overview of your bookstore</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 text-muted-foreground">Loading dashboard...</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {statCards.map((s) => (
                  <Link to={s.link} key={s.label} className="bg-card rounded-xl p-4 card-shadow hover:scale-[1.02] transition-transform">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                    <p className="text-xs font-body text-muted-foreground mt-1">{s.label}</p>
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Link to="/admin/books" className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
                  <h3 className="font-display font-bold text-foreground">Manage Books</h3>
                  <p className="text-sm font-body text-muted-foreground">Add, edit, or delete books</p>
                </Link>
                <Link to="/admin/orders" className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition-colors">
                  <Package className="w-6 h-6 text-emerald-500 mb-2" />
                  <h3 className="font-display font-bold text-foreground">Manage Orders</h3>
                  <p className="text-sm font-body text-muted-foreground">Update order status & tracking</p>
                </Link>
                <Link to="/admin/pending" className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-5 hover:border-amber-500/40 transition-colors">
                  <CreditCard className="w-6 h-6 text-amber-500 mb-2" />
                  <h3 className="font-display font-bold text-foreground">Verify Payments</h3>
                  <p className="text-sm font-body text-muted-foreground">Review pending payment proofs</p>
                </Link>
              </div>

              {/* Recent Orders */}
              <div className="bg-card rounded-xl card-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold text-foreground">Recent Orders</h2>
                  <Link to="/admin/orders" className="text-primary text-sm font-body hover:underline">View all →</Link>
                </div>
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground font-body text-sm">No orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="pb-2">Order ID</th>
                          <th className="pb-2">Amount</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Payment</th>
                          <th className="pb-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((o) => (
                          <tr key={o.id} className="border-b border-border/50 last:border-0">
                            <td className="py-3 font-mono text-xs">{o.id.slice(0, 8)}…</td>
                            <td className="py-3 font-semibold">₹{o.total_amount?.toLocaleString("en-IN")}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                o.status === "delivered" ? "bg-emerald-500/10 text-emerald-600" :
                                o.status === "shipped" ? "bg-blue-500/10 text-blue-600" :
                                o.status === "confirmed" ? "bg-amber-500/10 text-amber-600" :
                                "bg-muted text-muted-foreground"
                              }`}>{o.status}</span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                o.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-600" :
                                "bg-amber-500/10 text-amber-600"
                              }`}>{o.payment_status}</span>
                            </td>
                            <td className="py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
