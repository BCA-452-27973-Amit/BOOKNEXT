import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, CreditCard, Smartphone, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type PaymentStep = "input" | "processing" | "success" | "failed";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  amount: number;
  paymentMethod: "upi" | "card";
}

// ─── Mock QR Code SVG ────────────────────────────────────────────────────────
const MockQRCode = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-label="Mock UPI QR code">
    {/* Outer border squares */}
    <rect x="10" y="10" width="50" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
    <rect x="20" y="20" width="30" height="30" rx="2" fill="currentColor" />
    <rect x="100" y="10" width="50" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
    <rect x="110" y="20" width="30" height="30" rx="2" fill="currentColor" />
    <rect x="10" y="100" width="50" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
    <rect x="20" y="110" width="30" height="30" rx="2" fill="currentColor" />
    {/* Data modules */}
    <rect x="70" y="10" width="10" height="10" fill="currentColor" />
    <rect x="85" y="10" width="10" height="10" fill="currentColor" />
    <rect x="70" y="25" width="10" height="10" fill="currentColor" />
    <rect x="70" y="40" width="10" height="10" fill="currentColor" />
    <rect x="85" y="40" width="10" height="10" fill="currentColor" />
    <rect x="70" y="55" width="10" height="10" fill="currentColor" />
    <rect x="10" y="70" width="10" height="10" fill="currentColor" />
    <rect x="25" y="70" width="10" height="10" fill="currentColor" />
    <rect x="40" y="70" width="10" height="10" fill="currentColor" />
    <rect x="55" y="70" width="10" height="10" fill="currentColor" />
    <rect x="70" y="70" width="10" height="10" fill="currentColor" />
    <rect x="85" y="70" width="10" height="10" fill="currentColor" />
    <rect x="100" y="70" width="10" height="10" fill="currentColor" />
    <rect x="115" y="70" width="10" height="10" fill="currentColor" />
    <rect x="130" y="70" width="10" height="10" fill="currentColor" />
    <rect x="145" y="70" width="10" height="10" fill="currentColor" />
    <rect x="70" y="85" width="10" height="10" fill="currentColor" />
    <rect x="100" y="85" width="10" height="10" fill="currentColor" />
    <rect x="130" y="85" width="10" height="10" fill="currentColor" />
    <rect x="70" y="100" width="10" height="10" fill="currentColor" />
    <rect x="85" y="100" width="10" height="10" fill="currentColor" />
    <rect x="115" y="100" width="10" height="10" fill="currentColor" />
    <rect x="145" y="100" width="10" height="10" fill="currentColor" />
    <rect x="70" y="115" width="10" height="10" fill="currentColor" />
    <rect x="100" y="115" width="10" height="10" fill="currentColor" />
    <rect x="130" y="115" width="10" height="10" fill="currentColor" />
    <rect x="70" y="130" width="10" height="10" fill="currentColor" />
    <rect x="85" y="130" width="10" height="10" fill="currentColor" />
    <rect x="115" y="130" width="10" height="10" fill="currentColor" />
    <rect x="145" y="130" width="10" height="10" fill="currentColor" />
    <rect x="70" y="145" width="10" height="10" fill="currentColor" />
    <rect x="100" y="145" width="10" height="10" fill="currentColor" />
    <rect x="130" y="145" width="10" height="10" fill="currentColor" />
  </svg>
);

// ─── UPI Payment Form ─────────────────────────────────────────────────────────
interface UPIFormProps {
  amount: number;
  onPay: (upiId: string) => void;
}

const UPIForm = ({ amount, onPay }: UPIFormProps) => {
  const [upiId, setUpiId] = useState("");

  const handlePay = () => {
    const trimmed = upiId.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    onPay(trimmed);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-white dark:bg-white p-4 rounded-xl border border-border text-foreground">
          <MockQRCode />
        </div>
        <p className="font-body text-xs text-muted-foreground">Scan with any UPI app to pay</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="font-body text-xs text-muted-foreground px-1">or enter UPI ID</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-foreground mb-1">UPI ID</label>
        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@upi"
          className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none"
        />
      </div>

      <div className="bg-primary/5 rounded-lg p-3 flex justify-between font-body text-sm">
        <span className="text-muted-foreground">Amount to pay</span>
        <span className="font-bold text-foreground">₹{amount.toLocaleString("en-IN")}</span>
      </div>

      <button
        onClick={handlePay}
        className="w-full bg-gradient-saffron text-primary-foreground py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all"
      >
        Pay ₹{amount.toLocaleString("en-IN")}
      </button>
    </div>
  );
};

// ─── Card Payment Form ────────────────────────────────────────────────────────
interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface CardFormProps {
  amount: number;
  onPay: (card: CardData) => void;
}

const isAmex = (number: string) => {
  const n = number.replace(/\s/g, "");
  return n.startsWith("34") || n.startsWith("37");
};

const getCardType = (number: string): string => {
  const n = number.replace(/\s/g, "");
  if (n.startsWith("34") || n.startsWith("37")) return "Amex";
  if (n.startsWith("4")) return "Visa";
  if (n.startsWith("5") || n.startsWith("2")) return "Mastercard";
  if (n.startsWith("6")) return "Rupay";
  return "";
};

const CardForm = ({ amount, onPay }: CardFormProps) => {
  const [card, setCard] = useState<CardData>({ number: "", name: "", expiry: "", cvv: "" });

  const amex = isAmex(card.number);
  const maxDigits = amex ? 15 : 16;
  const cvvLength = amex ? 4 : 3;

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, maxDigits);
    if (amex || (digits.startsWith("34") || digits.startsWith("37"))) {
      // Amex format: 4-6-5
      return digits.replace(/^(\d{4})(\d{1,6})?(\d{1,5})?$/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" ")
      );
    }
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }));
  };

  const handlePay = () => {
    const rawNum = card.number.replace(/\s/g, "");
    if (rawNum.length !== maxDigits) {
      toast.error(`Enter a valid ${maxDigits}-digit card number`);
      return;
    }
    if (!card.name.trim()) { toast.error("Enter cardholder name"); return; }
    if (card.expiry.length !== 5) { toast.error("Enter expiry date (MM/YY)"); return; }
    if (card.cvv.length < cvvLength) { toast.error(`Enter valid ${cvvLength}-digit CVV`); return; }
    onPay(card);
  };

  const cardType = getCardType(card.number);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-saffron rounded-xl p-5 text-primary-foreground relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-30">
          <CreditCard className="w-16 h-16" />
        </div>
        <p className="font-body text-xs opacity-70 mb-1">{cardType || "Card"}</p>
        <p className="font-display text-xl tracking-widest font-semibold mt-3">
          {card.number || "•••• •••• •••• ••••"}
        </p>
        <div className="flex justify-between mt-4">
          <div>
            <p className="font-body text-xs opacity-60">Cardholder</p>
            <p className="font-body text-sm font-semibold">{card.name || "YOUR NAME"}</p>
          </div>
          <div>
            <p className="font-body text-xs opacity-60">Expires</p>
            <p className="font-body text-sm font-semibold">{card.expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-foreground mb-1">Card Number</label>
        <input
          value={card.number}
          onChange={handleNumberChange}
          placeholder="1234 5678 9012 3456"
          inputMode="numeric"
          className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none tracking-wide"
        />
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-foreground mb-1">Cardholder Name</label>
        <input
          value={card.name}
          onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
          placeholder="As printed on card"
          className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-body text-sm font-medium text-foreground mb-1">Expiry Date</label>
          <input
            value={card.expiry}
            onChange={handleExpiryChange}
            placeholder="MM/YY"
            inputMode="numeric"
            className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-body text-sm font-medium text-foreground mb-1">CVV</label>
          <input
            value={card.cvv}
            onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, cvvLength) }))}
            placeholder={amex ? "••••" : "•••"}
            type="password"
            inputMode="numeric"
            className="w-full px-4 py-2.5 bg-muted rounded-lg font-body text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-primary/5 rounded-lg p-3 flex justify-between font-body text-sm">
        <span className="text-muted-foreground">Amount to pay</span>
        <span className="font-bold text-foreground">₹{amount.toLocaleString("en-IN")}</span>
      </div>

      <p className="font-body text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <CreditCard className="w-3 h-3" aria-hidden="true" />
        <span>This is a mock payment — no real charges will be made</span>
      </p>

      <button
        onClick={handlePay}
        className="w-full bg-gradient-saffron text-primary-foreground py-3 rounded-full font-body font-semibold hover:opacity-90 transition-all"
      >
        Pay ₹{amount.toLocaleString("en-IN")}
      </button>
    </div>
  );
};

// ─── Main PaymentModal ────────────────────────────────────────────────────────
const PROCESSING_DELAY_MS = 2500;
const SUCCESS_REDIRECT_DELAY_MS = 1500;

// Simulate a payment failure for a specific test card to make it realistic
const isTestFailCard = (cardNumber: string) =>
  cardNumber.replace(/\s/g, "") === "4000000000000002";

const PaymentModal = ({ open, onClose, onSuccess, amount, paymentMethod }: PaymentModalProps) => {
  const [step, setStep] = useState<PaymentStep>("input");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = () => {
    if (step === "processing") return; // prevent closing during processing
    setStep("input");
    setErrorMsg("");
    onClose();
  };

  const simulatePayment = async (willSucceed: boolean) => {
    setStep("processing");
    await new Promise((r) => setTimeout(r, PROCESSING_DELAY_MS));

    if (!willSucceed) {
      setStep("failed");
      setErrorMsg("Payment declined by bank. Please try a different card.");
      return;
    }

    setStep("success");
    await new Promise((r) => setTimeout(r, SUCCESS_REDIRECT_DELAY_MS));
    await onSuccess();
    setStep("input");
    setErrorMsg("");
  };

  const handleUPIPay = (upiId: string) => {
    // UPI payments always succeed in mock (except obviously invalid patterns)
    const willFail = upiId === "fail@test";
    simulatePayment(!willFail);
  };

  const handleCardPay = (card: CardData) => {
    simulatePayment(!isTestFailCard(card.number));
  };

  const handleRetry = () => {
    setStep("input");
    setErrorMsg("");
  };

  const title = paymentMethod === "upi" ? "Pay via UPI" : "Pay via Card";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {paymentMethod === "upi"
              ? <><Smartphone className="w-5 h-5 text-primary" />{title}</>
              : <><CreditCard className="w-5 h-5 text-primary" />{title}</>
            }
          </DialogTitle>
          <DialogDescription className="font-body text-sm">
            {step === "input" && "Complete your payment securely"}
            {step === "processing" && "Please wait while we process your payment"}
            {step === "success" && "Payment successful!"}
            {step === "failed" && "Payment could not be completed"}
          </DialogDescription>
        </DialogHeader>

        {/* Input step */}
        {step === "input" && (
          paymentMethod === "upi"
            ? <UPIForm amount={amount} onPay={handleUPIPay} />
            : <CardForm amount={amount} onPay={handleCardPay} />
        )}

        {/* Processing step */}
        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-display font-semibold text-foreground text-lg">Processing Payment</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                ₹{amount.toLocaleString("en-IN")} — Please do not close this window
              </p>
            </div>
          </div>
        )}

        {/* Success step */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <div className="text-center">
              <p className="font-display font-bold text-foreground text-xl">Payment Successful!</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                ₹{amount.toLocaleString("en-IN")} paid · Placing your order…
              </p>
            </div>
          </div>
        )}

        {/* Failed step */}
        {step === "failed" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <XCircle className="w-16 h-16 text-destructive" />
            <div className="text-center">
              <p className="font-display font-bold text-foreground text-xl">Payment Failed</p>
              <p className="font-body text-sm text-muted-foreground mt-2">{errorMsg}</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-saffron text-primary-foreground py-2.5 rounded-full font-body font-semibold hover:opacity-90 transition-all"
              >
                <RefreshCcw className="w-4 h-4" /> Retry
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-full font-body font-semibold border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
