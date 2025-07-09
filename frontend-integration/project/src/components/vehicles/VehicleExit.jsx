import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { LogOut, Car, Clock, DollarSign, Search, AlertCircle, CheckCircle } from 'lucide-react';

const VehicleExit = () => {
  const { vehicleLogs, updateVehicleLog, refreshStats } = useParking();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const activeVehicles = vehicleLogs.filter(log => 
    log.status === 'active' && 
    log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAmount = (entryTime, vehicleType) => {
    const now = new Date();
    const entry = new Date(entryTime);
    const hours = Math.ceil((now.getTime() - entry.getTime()) / (1000 * 60 * 60));
    const rate = vehicleType === '2W' ? 10 : 30;
    return hours * rate;
  };

  const handleExit = async (vehicleLog) => {
    setIsProcessing(true);
    setError('');

    try {
      const result = await updateVehicleLog(vehicleLog.id, {
        status: 'completed'
      });

      if (result.success) {
        setSuccess(true);
        refreshStats();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to process vehicle exit');
      }
    } catch (error) {
      console.error('Error processing vehicle exit:', error);
      setError('Failed to process vehicle exit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <LogOut className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Vehicle Exit</h2>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Vehicle exit processed successfully!
              </p>
              <p className="text-sm text-green-600">
                Invoice has been generated and slot is now available.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>
        </div>

        {activeVehicles.length > 0 ? (
          <div className="space-y-4">
            {activeVehicles.map((vehicleLog) => {
              const entryTime = new Date(vehicleLog.entryTime);
              const currentTime = new Date();
              const duration = Math.ceil((currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60));
              const vehicleType = vehicleLog.slotId.includes('2W') ? '2W' : '4W';
              const estimatedAmount = calculateAmount(vehicleLog.entryTime, vehicleType);

              return (
                <div key={vehicleLog.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Car className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{vehicleLog.vehicleNumber}</span>
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {vehicleType}
                        </span>
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          ACTIVE
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Entry: {entryTime.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Duration: {duration}h</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>Amount: ₹{estimatedAmount}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Slot: {vehicleLog.slotId} • Rate: ₹{vehicleType === '2W' ? 10 : 30}/hour
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => handleExit(vehicleLog)}
                        disabled={isProcessing}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Process Exit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              {searchTerm ? 'No vehicles found matching your search' : 'No active vehicles to process'}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'Try searching with a different vehicle number' : 'All vehicles have been processed or no entries logged yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleExit;