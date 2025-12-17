import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "processing" | "requires_action" | "success" | "failed";
  paymentData?: {
    qrImage?: string;
    qrString?: string;
    transactionId?: string;
    abapay_deeplink?: string;
  };
  onVerify?: () => void;
}

export function PaymentProcessingModal({
  isOpen,
  onClose,
  status,
  paymentData,
  onVerify
}: PaymentProcessingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === "processing" && "Processing Payment"}
            {status === "requires_action" && "Scan to Pay"}
            {status === "success" && "Payment Successful"}
            {status === "failed" && "Payment Failed"}
          </DialogTitle>
          <DialogDescription className="text-center">
             {status === "requires_action" && "Please scan the QR code with your ABA Mobile App to complete the transaction."}
             {status === "success" && "Thank you! Your subscription is now active."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          
          {/* Processing State */}
          {status === "processing" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-sm text-gray-500">Initializing secure payment...</p>
            </div>
          )}

          {/* QR Code / Action State */}
          {status === "requires_action" && paymentData?.qrImage && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative w-64 h-64 border-4 border-black rounded-xl overflow-hidden shadow-lg">
                 {/* Use simple img tag for base64 to avoid Next/Image config issues with data URIs if strict */}
                 <img 
                    src={paymentData.qrImage} 
                    alt="ABA Pay QR" 
                    className="w-full h-full object-contain"
                 />
              </div>
              
              <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500 font-mono break-all px-4">
                      TxID: {paymentData.transactionId}
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Open ABA Mobile App & Scan
                  </p>
              </div>

              {/* Deeplink for Mobile */}
              {paymentData.abapay_deeplink && (
                  <Button className="w-full sm:hidden" onClick={() => window.location.href = paymentData.abapay_deeplink!}>
                      Open ABA App
                  </Button>
              )}

              <Button 
                onClick={onVerify} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                I have paid, verify now
              </Button>
            </div>
          )}

           {/* Success State */}
           {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <Button onClick={() => window.location.reload()} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          )}

          {/* Failed State */}
          {status === "failed" && (
             <div className="flex flex-col items-center">
             <XCircle className="h-16 w-16 text-red-500 mb-4" />
             <p className="text-center text-gray-600 mb-4">
                 We couldn't verify your payment. Please try again or contact support.
             </p>
             <Button onClick={onClose} variant="outline" className="w-full">
               Close
             </Button>
           </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
