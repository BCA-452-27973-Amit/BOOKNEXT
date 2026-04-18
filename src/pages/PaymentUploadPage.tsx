import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentProofForm from "@/components/PaymentProofForm";

const PaymentUploadPage = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id") || "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold mb-6">Upload Payment Proof</h1>
          {paymentId ? (
            <div className="max-w-xl">
              <PaymentProofForm paymentId={paymentId} />
            </div>
          ) : (
            <div className="text-muted-foreground">Missing payment id in the URL.</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentUploadPage;
