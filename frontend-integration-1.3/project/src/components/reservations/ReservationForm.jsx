import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Car, Clock, DollarSign } from 'lucide-react';

const ReservationForm = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { getAvailableSlots, addReservation, addInvoice } = useParking();
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: '4W',
    slotId: '',
    startDate: '',
    startTime: '',
    duration: 2,
    paymentMethod: 'card'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure availableSlots is an array
  const availableSlots = Array.isArray(getAvailableSlots(formData.vehicleType))
    ? getAvailableSlots(formData.vehicleType)
    : [];
  const ratePerHour = formData.vehicleType === '2W' ? 10 : 30;
  const totalAmount = ratePerHour * formData.duration;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 60 * 1000);

      // Create reservation
      addReservation({
        userId: user.id,
        slotId: formData.slotId,
        vehicleNumber: formData.vehicleNumber,
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'pending',
        amount: totalAmount
      });

      // Create invoice
      addInvoice({
        userId: user.id,
        amount: totalAmount,
        paymentMethod: formData.paymentMethod,
        status: 'paid',
        timestamp: new Date(),
        description: `Reservation for ${formData.vehicleNumber}`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating reservation:', error);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Make Reservation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g., KA01AB1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2W">2 Wheeler</option>
                <option value="4W">4 Wheeler</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parking Slot
              </label>
              <select
                name="slotId"
                value={formData.slotId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a slot</option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.id} - {slot.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                max="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="wallet">Digital Wallet</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Rate per hour:</span>
                <span className="font-medium">₹{ratePerHour}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="font-medium">{formData.duration} hours</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.slotId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;