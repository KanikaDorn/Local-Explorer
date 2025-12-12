"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";

interface Payment {
  id: string;
  user_email: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  created_at: string;
  payment_method: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/admin/payments");
        if (res?.success) {
          setPayments(res.data?.payments || []);
          setTotalRevenue(res.data?.total_revenue || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading payments...</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
        <p className="text-gray-600">View and manage platform payments</p>
      </div>

      {/* Revenue Summary */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50">
        <div>
          <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">All time revenue</p>
        </div>
      </Card>

      {/* Payments Table */}
      {payments.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{payment.user_email}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`text-xs px-2 py-1 rounded ${statusBadge(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No payments recorded</p>
        </Card>
      )}
    </div>
  );
}
