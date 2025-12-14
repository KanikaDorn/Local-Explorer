"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  issuedDate: string;
  dueDate: string;
  description: string;
  items?: Array<{
    description: string;
    amount: number;
  }>;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "aba";
  label: string;
  last4?: string;
  isDefault: boolean;
  expiryDate?: string;
}

interface BillingData {
  currentBalance: number;
  totalSpent: number;
  nextBillingDate: string;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
}

export default function PartnerBilling() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const res = await apiFetch("/api/partner/billing");
        if (res?.success) {
          setBillingData(res.data);
        }
      } catch (err) {
        console.error("Error loading billing data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, []);

  const handleDownloadInvoice = async (invoiceId: string) => {
    setDownloadingId(invoiceId);
    try {
      const res = await apiFetch(
        `/api/partner/billing/invoices/${invoiceId}/download`
      );
      if (res?.success) {
        // Create a blob and download
        const link = document.createElement("a");
        link.href = res.data.url;
        link.download = `invoice-${invoiceId}.pdf`;
        link.click();
      } else {
        toast({
          title: "Error",
          description: "Failed to download invoice",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Billing & Invoices</h1>
          <p className="text-gray-600">
            Manage your payments and subscription billing
          </p>
        </div>
        <Link href="/partner/subscriptions">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Change Plan
          </Button>
        </Link>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Current Balance
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${billingData?.currentBalance.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Total Spent
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${billingData?.totalSpent.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Next Billing
              </p>
              <p className="text-lg font-bold text-gray-900">
                {billingData?.nextBillingDate
                  ? new Date(billingData.nextBillingDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Methods */}
      {billingData?.paymentMethods && billingData.paymentMethods.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Payment Methods
            </h2>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Method
            </Button>
          </div>

          <div className="space-y-3">
            {billingData.paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg flex justify-between items-center ${
                  method.isDefault
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {method.type === "card" && "💳"}
                    {method.type === "bank" && "🏦"}
                    {method.type === "aba" && "🏧"}
                    {method.label}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {method.type === "card" &&
                      method.last4 &&
                      `•••• ${method.last4}`}
                    {method.type === "aba" && "Acleda Bank Transfer"}
                    {method.type === "bank" && "Bank Account"}
                    {method.expiryDate && ` • Expires ${method.expiryDate}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {method.isDefault && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-medium">
                      Default
                    </span>
                  )}
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invoices */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Invoices & Receipts
        </h2>

        {billingData?.invoices && billingData.invoices.length > 0 ? (
          <div className="space-y-3">
            {billingData.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {invoice.description ||
                        `Invoice #${invoice.invoiceNumber}`}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyles(
                        invoice.status
                      )}`}
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-x-4">
                    <span>
                      📅 {new Date(invoice.issuedDate).toLocaleDateString()}
                    </span>
                    {invoice.dueDate && (
                      <span>
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${invoice.amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    disabled={downloadingId === invoice.id}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No invoices yet</p>
            <Link href="/partner/subscriptions">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Support */}
      <Card className="mt-8 p-6 bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-2">Need Help?</h3>
        <p className="text-amber-800 text-sm mb-4">
          For billing inquiries or payment issues, please contact our support
          team
        </p>
        <div className="flex gap-4">
          <Button variant="outline" size="sm">
            📧 Email Support
          </Button>
          <Button variant="outline" size="sm">
            💬 Live Chat
          </Button>
        </div>
      </Card>
    </div>
  );
}
