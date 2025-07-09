import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Car, MapPin, Clock, DollarSign, Plus } from 'lucide-react';
import ReservationForm from './ReservationForm';

const ReservationList = () => {
  const { user } = useAuth();
  const { reservations, slots, updateReservation, refreshStats } = useParking();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const getUserReservations = () => {
    let filteredReservations = reservations;

    if (user?.role === 'customer') {
      filteredReservations = reservations.filter(r => r.userId === user.id);
    }

    if (filter !== 'all') {
      filteredReservations = filteredReservations.filter(r => r.status === filter);
    }

    return filteredReservations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handleStatusChange = (reservationId, newStatus) => {
    updateReservation(reservationId, { status: newStatus });
    refreshStats();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const userReservations = getUserReservations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">
            {user?.role === 'customer' ? 'My Reservations' : 'All Reservations'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          {user?.role === 'customer' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {userReservations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {userReservations.map((reservation) => {
              const slot = slots.find(s => s.id === reservation.slotId);
              return (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Car className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{reservation.vehicleNumber}</span>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                          {reservation.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Slot: {slot?.id}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{new Date(reservation.startTime).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>₹{reservation.amount}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Duration: {Math.round((new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime()) / (1000 * 60 * 60))} hours
                      </div>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <div className="mt-4 sm:mt-0 sm:ml-4">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No reservations found</p>
            {user?.role === 'customer' && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Make Your First Reservation
              </button>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <ReservationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            refreshStats();
          }}
        />
      )}
    </div>
  );
};

export default ReservationList;