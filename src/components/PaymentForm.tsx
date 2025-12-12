"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CreditCard, Lock, Loader2 } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

export function PaymentForm({ 
  amount, 
  currency = "USD",
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      // In real app, integrate Stripe/Bakong here
      onSuccess?.(`pay_${Math.random().toString(36).substr(2, 9)}`);
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <CreditCard className="h-5 w-5" /> Secure Checkout
        </CardTitle>
        <CardDescription>
           Complete your payment of {currency} {amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input 
              id="cardName" 
              placeholder="John Doe" 
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input 
                id="cardNumber" 
                placeholder="0000 0000 0000 0000" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                required 
              />
              <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={5}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input 
                id="cvc" 
                placeholder="123" 
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                maxLength={4}
                required 
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              `Pay ${currency} ${amount.toFixed(2)}`
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" className="w-full" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
          <p className="text-xs text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Payments are secure and encrypted
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
