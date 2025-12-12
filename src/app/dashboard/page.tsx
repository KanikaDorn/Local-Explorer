import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, Heart, DollarSign } from "lucide-react";
import { Rating } from "@/components/Rating"; // Using our new reusable component

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-green-500 mt-1">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Listings</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
             <p className="text-xs text-gray-500 mt-1">2 pending approval</p>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Saves</CardTitle>
            <Heart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
             <p className="text-xs text-green-500 mt-1">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234</div>
             <p className="text-xs text-green-500 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Example using Rating Component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card>
            <CardHeader>
               <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                           U{i}
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">User {i}</span>
                              <span className="text-xs text-gray-400">2 hours ago</span>
                           </div>
                           <Rating value={4} readonly className="mb-2" />
                           <p className="text-sm text-gray-600">
                              Great experience! Highly recommended spot.
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
         
         <Card>
            <CardHeader>
               <CardTitle>Popular Listings</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium border-b pb-2">
                     <span>Listing Name</span>
                     <span>Views</span>
                  </div>
                  {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Cafe Spot {i}</span>
                        <span className="font-bold">{1000 - (i * 50)}</span>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

    </div>
  );
}
