"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import apiFetch from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  tran_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_amount?: number;
}

interface PaymentHistoryTableProps {
  transactions: Transaction[];
  onRefresh?: () => void;
}

export function PaymentHistoryTable({ transactions, onRefresh }: PaymentHistoryTableProps) {
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRefund = async (tranId: string) => {
    if (!confirm("Are you sure you want to request a refund for this transaction?")) return;
    
    setRefundingId(tranId);
    try {
      const res = await apiFetch("/api/partner/billing/refund", {
        method: "POST",
        body: JSON.stringify({ tran_id: tranId, reason: "User requested via dashboard" }),
      });

      if (res?.success) {
        toast({
          title: "Refund Requested",
          description: "Your request has been submitted for review.",
        });
        if (onRefresh) onRefresh();
      } else {
        toast({
          title: "Refund Failed",
          description: res?.error || "Could not submit refund request.",
          variant: "destructive",
        });
      }
    } catch (error) {
       console.error("Refund error:", error);
       toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setRefundingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      case "refund_requested":
        return <Badge className="bg-yellow-100 text-yellow-800">Refund Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transaction History</h3>
        {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{formatDate(tx.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.tran_id}</TableCell>
                  <TableCell>
                    {formatCurrency(tx.payment_amount || tx.amount, "USD")}
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-right">
                    {(tx.status === "completed" || tx.status === "APPROVED") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRefund(tx.tran_id)}
                        disabled={!!refundingId}
                      >
                        {refundingId === tx.tran_id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : "Request Refund"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
