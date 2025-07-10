import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import StatsCard from './StatsCard';
import { Car, DollarSign, Calendar, Users, Clock, MapPin } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, slots, vehicleLogs, reservations } = useParking();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRecentActivity = () => {
    const recentLogs = vehicleLogs
      .filter(log => log.status === 'active')
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
      .slice(0, 5);

    const recentReservations = reservations
      .filter(r => r.status === 'pending' || r.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return { recentLogs, recentReservations };
  };

  const { recentLogs, recentReservations } = getRecentActivity();

  const getStatsCards = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: 'Total Slots',
          value: stats.totalSlots,
          icon: Car,
          color: 'blue',
          trend: { value: 5, isPositive: true }
        },
        {
          title: 'Available Slots',
          value: stats.availableSlots,
          icon: MapPin,
          color: 'green',
          trend: { value: 12, isPositive: true }
        },
        {
          title: 'Revenue',
          value: `₹${stats.revenue}`,
          icon: DollarSign,
          color: 'yellow',
          trend: { value: 8, isPositive: true }
        },
        {
          title: 'Active Reservations',
          value: stats.activeReservations,
          icon: Calendar,
          color: 'purple',
          trend: { value: 3, isPositive: false }
        }
      ];
    } else if (user?.role === 'staff') {
      return [
        {
          title: 'Available Slots',
          value: stats.availableSlots,
          icon: MapPin,
          color: 'green'
        },
        {
          title: 'Occupied Slots',
          value: stats.occupiedSlots,
          icon: Car,
          color: 'red'
        },
        {
          title: 'Active Vehicles',
          value: recentLogs.length,
          icon: Clock,
          color: 'blue'
        },
        {
          title: 'Pending Reservations',
          value: recentReservations.length,
          icon: Calendar,
          color: 'purple'
        }
      ];
    } else {
      const userReservations = reservations.filter(r => r.userId === user?.id);
      const userLogs = vehicleLogs.filter(l => l.userId === user?.id);
      
      return [
        {
          title: 'My Reservations',
          value: userReservations.length,
          icon: Calendar,
          color: 'blue'
        },
        {
          title: 'Active Parking',
          value: userLogs.filter(l => l.status === 'active').length,
          icon: Car,
          color: 'green'
        },
        {
          title: 'Available Slots',
          value: stats.availableSlots,
          icon: MapPin,
          color: 'yellow'
        },
        {
          title: 'My Spending',
          value: `₹${userLogs.reduce((sum, log) => sum + (log.amount || 0), 0)}`,
          icon: DollarSign,
          color: 'purple'
        }
      ];
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Welcome to your parking management dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => {
                const slot = slots.find(s => s.id === log.slotId);
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <Car className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{log.vehicleNumber}</p>
                        <p className="text-sm text-gray-500">
                          Slot: {slot?.id} • {new Date(log.entryTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reservations</h3>
          <div className="space-y-3">
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation) => {
                const slot = slots.find(s => s.id === reservation.slotId);
                return (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reservation.vehicleNumber}</p>
                        <p className="text-sm text-gray-500">
                          Slot: {slot?.id} • {new Date(reservation.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      reservation.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming reservations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;