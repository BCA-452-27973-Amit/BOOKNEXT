import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, ExternalLink, CreditCard, IndianRupee, User, Calendar } from "lucide-react";

const PendingPayments = () => {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "admin") return;
    fetchPending();
  }, [profile]);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("payments").select("*, orders(*)").eq("status", "pending").order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Failed to load pending payments");
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  const getProofUrl = async (path: string) => {
    if (!path) return null;
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60 * 60);
    if (error) return null;
    return data.signedUrl;
  };

  const verify = async (paymentId: string) => {
    setVerifying(paymentId);
    try {
      const res = await supabase.functions.invoke("verify-payment", { method: "POST", body: JSON.stringify({ payment_id: paymentId }) });
      if (res?.error) throw res.error;
      toast.success("Payment verified successfully!");
      await fetchPending();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Verification failed");
    }
    setVerifying(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">Please login.</main><Footer /></div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 container mx-auto p-8">Not authorized.</main><Footer /></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Payment Verification</h1>
              <p className="text-muted-foreground font-body text-sm">{payments.length} pending payment(s)</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-20">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <p className="font-display text-xl text-foreground mb-2">All caught up!</p>
              <p className="text-muted-foreground font-body">No pending payments to verify.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((p) => (
                <div key={p.id} className="bg-card rounded-xl card-shadow overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Payment Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span className="font-mono text-xs text-muted-foreground">Payment #{p.id.slice(0, 8)}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 capitalize">{p.status}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-body text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5" />
                            <strong className="text-foreground text-lg font-display">₹{(p.amount || 0).toLocaleString("en-IN")}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {p.user_id.slice(0, 8)}…
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(p.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <div className="text-sm font-body text-muted-foreground">
                          <span>Method: <strong className="text-foreground">{p.method?.toUpperCase() || "N/A"}</strong></span>
                          {p.order_id && <span className="ml-4">Order: <strong className="text-foreground font-mono">{p.order_id.slice(0, 8)}…</strong></span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {p.proof_path && (
                          <button
                            onClick={async () => {
                              const url = await getProofUrl(p.proof_path);
                              if (url) window.open(url, "_blank");
                            }}
                            className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-600 text-sm font-body font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Proof
                          </button>
                        )}
                        <button
                          onClick={() => verify(p.id)}
                          disabled={verifying === p.id}
                          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-body font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {verifying === p.id ? "Verifying..." : "Verify Payment"}
                        </button>
                      </div>
                    </div>
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

export default PendingPayments;
