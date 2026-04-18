import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Props = {
  paymentId: string;
};

export default function PaymentProofForm({ paymentId }: Props) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    if (!paymentId) return;
    // load payment row
    supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single()
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setPayment(data);
        if (data?.proof_path) {
          supabase.storage
            .from("payment-proofs")
            .createSignedUrl(data.proof_path, 60 * 60)
            .then(({ data: urlData, error: urlErr }) => {
              if (!urlErr) setSignedUrl(urlData.signedUrl);
            });
        }
      });
  }, [paymentId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
  };

  const uploadProof = async () => {
    if (!file) return toast.error("Please select a file to upload");
    if (!user) return toast.error("Please login to upload proof");
    if (!paymentId) return toast.error("Missing payment id");

    setUploading(true);
    try {
      const path = `payment-proofs/${user.id}/${paymentId}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData, error: urlErr } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60 * 60);
      if (urlErr) throw urlErr;

      // attach proof path to payment row
      const { error: updateErr } = await supabase
        .from("payments")
        .update({ proof_path: path, updated_at: new Date().toISOString() })
        .eq("id", paymentId);
      if (updateErr) throw updateErr;

      setSignedUrl(urlData.signedUrl);
      toast.success("Proof uploaded. An admin will verify it shortly.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-lg font-semibold">Payment</p>
        {payment ? (
          <div className="text-sm text-muted-foreground">
            <div>Amount: ₹{(payment.amount || 0).toLocaleString("en-IN")}</div>
            <div>Method: {payment.method}</div>
            <div>Status: {payment.status}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Upload payment proof (screenshot / receipt)</label>
        <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
      </div>

      {signedUrl && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Uploaded proof preview (signed URL valid for 1 hour):</p>
          <a href={signedUrl} target="_blank" rel="noreferrer" className="text-primary underline">Open proof</a>
        </div>
      )}

      <div>
        <button onClick={uploadProof} disabled={uploading} className="bg-primary text-white px-4 py-2 rounded">
          {uploading ? "Uploading..." : "Upload Proof"}
        </button>
      </div>
    </div>
  );
}
