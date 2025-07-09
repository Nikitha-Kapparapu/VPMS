import React from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Car, Clock, MapPin, DollarSign } from 'lucide-react';

const MyVehicles = () => {
  const { user } = useAuth();
  const { vehicleLogs, slots } = useParking();

  const userVehicleLogs = vehicleLogs.filter(log => log.userId === user?.id);
  const activeVehicles = userVehicleLogs.filter(log => log.status === 'active');
  const completedVehicles = userVehicleLogs.filter(log => log.status === 'completed');

  const getSlotInfo = (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    return slot ? slot.location : 'Unknown Location';
  };

  const getCurrentDuration = (entryTime) => {
    const now = new Date();
    const entry = new Date(entryTime);
    const hours = Math.ceil((now.getTime() - entry.getTime()) / (1000 * 60 * 60));
    return hours;
  };

  const getEstimatedAmount = (entryTime, slotId) => {
    const duration = getCurrentDuration(entryTime);
    const vehicleType = slotId.startsWith('2W') ? '2W' : '4W';
    const rate = vehicleType === '2W' ? 10 : 30;
    return duration * rate;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Car className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
      </div>

      {/* Active Vehicles */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Currently Parked</h3>
        </div>
        
        {activeVehicles.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {activeVehicles.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Car className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">{log.vehicleNumber}</span>
                      <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Slot: {log.slotId}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Entry: {new Date(log.entryTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Est. Amount: ₹{getEstimatedAmount(log.entryTime, log.slotId)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      Location: {getSlotInfo(log.slotId)} • Duration: {getCurrentDuration(log.entryTime)}h
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vehicles currently parked</p>
          </div>
        )}
      </div>

      {/* Vehicle History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Parking History</h3>
        </div>
        
        {completedVehicles.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {completedVehicles.slice(0, 10).map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Car className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{log.vehicleNumber}</span>
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        COMPLETED
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Slot: {log.slotId}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Entry: {new Date(log.entryTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Duration: {log.duration}h</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Amount: ₹{log.amount}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      Location: {getSlotInfo(log.slotId)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No parking history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVehicles;