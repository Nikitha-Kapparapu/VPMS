import React, { useState, useEffect } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Car, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const VehicleEntry = () => {
  const { user } = useAuth();
  const { getAvailableSlots, addVehicleLog, refreshStats, users } = useParking();
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '4W',
    slotId: '',
    userId: user?.role === 'customer' ? user.id : ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAvailableSlots();
  }, [formData.vehicleType]);

  const loadAvailableSlots = async () => {
    try {
      const slots = await getAvailableSlots(formData.vehicleType);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setError('Failed to load available slots');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.vehicleNumber || !formData.slotId) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await addVehicleLog({
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        slotId: formData.slotId,
        userId: formData.userId || 'guest'
      });

      if (result.success) {
        setSuccess(true);
        setFormData({
          vehicleNumber: '',
          vehicleType: '4W',
          slotId: '',
          userId: user?.role === 'customer' ? user.id : ''
        });
        await loadAvailableSlots();
        refreshStats();

        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to log vehicle entry');
      }
    } catch (error) {
      console.error('Error logging vehicle entry:', error);
      setError('Failed to log vehicle entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <LogIn className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Vehicle Entry</h2>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Vehicle entry logged successfully!
              </p>
              <p className="text-sm text-green-600">
                Vehicle {formData.vehicleNumber} has been assigned to slot {formData.slotId}
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number *
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g., KA01AB1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type *
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="2W">2 Wheeler</option>
                <option value="4W">4 Wheeler</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Parking Slot *
              </label>
              <select
                name="slotId"
                value={formData.slotId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
              >
                <option value="">Select a slot</option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    Slot {slot.id} - {slot.location} ({slot.type})
                  </option>
                ))}
              </select>
              {availableSlots.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No available slots for {formData.vehicleType} vehicles
                </p>
              )}
            </div>

            {(user?.role === 'admin' || user?.role === 'staff') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer ID *
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter Customer ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  required
                />
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Available Slots Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Car className="h-4 w-4 text-blue-600 mr-2" />
                <span>2W Slots: {availableSlots.filter(s => s.type === '2W').length}</span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 text-blue-600 mr-2" />
                <span>4W Slots: {availableSlots.filter(s => s.type === '4W').length}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !formData.slotId || availableSlots.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Log Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEntry;