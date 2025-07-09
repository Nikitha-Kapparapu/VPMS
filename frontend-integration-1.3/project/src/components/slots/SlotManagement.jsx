import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { Car, Plus, Edit, Trash2, MapPin } from 'lucide-react';

const SlotManagement = () => {
  const { slots, addSlot, updateSlot, removeSlot, refreshStats } = useParking();
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    type: '4W',
    location: '',
    floor: 0,
    section: 'A',
    isOccupied: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingSlot) {
      updateSlot(editingSlot.id, formData);
      setEditingSlot(null);
    } else {
      const slotId = `${formData.type}-${formData.floor}-${(slots.filter(s => s.type === formData.type && s.floor === formData.floor).length + 1).toString().padStart(2, '0')}`;
      addSlot({
        ...formData,
        id: slotId
      });
    }
    
    setFormData({
      type: '4W',
      location: '',
      floor: 0,
      section: 'A',
      isOccupied: false
    });
    setShowForm(false);
    refreshStats();
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      type: slot.type,
      location: slot.location,
      floor: slot.floor,
      section: slot.section,
      isOccupied: slot.isOccupied
    });
    setShowForm(true);
  };

  const handleDelete = (slotId) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      removeSlot(slotId);
      refreshStats();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getStatusColor = (slot) => {
    if (slot.isOccupied) return 'bg-red-100 text-red-800';
    if (slot.reservedBy) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (slot) => {
    if (slot.isOccupied) return 'Occupied';
    if (slot.reservedBy) return 'Reserved';
    return 'Available';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Car className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Slot Management</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Slot
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSlot ? 'Edit Slot' : 'Add New Slot'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="2W">2 Wheeler</option>
                <option value="4W">4 Wheeler</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Ground Floor, Section A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <select
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Ground Floor</option>
                <option value={1}>First Floor</option>
                <option value={2}>Second Floor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isOccupied"
                  checked={formData.isOccupied}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Currently Occupied</span>
              </label>
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSlot(null);
                  setFormData({
                    type: '4W',
                    location: '',
                    floor: 0,
                    section: 'A',
                    isOccupied: false
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingSlot ? 'Update Slot' : 'Add Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <div key={slot.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Car className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{slot.id}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(slot)}`}>
                    {getStatusText(slot)}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{slot.location}</span>
                  </div>
                  <div>Type: {slot.type}</div>
                  <div>Floor: {slot.floor === 0 ? 'Ground' : `${slot.floor}${slot.floor === 1 ? 'st' : 'nd'}`}</div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(slot)}
                    className="flex-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="flex-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {slots.length === 0 && (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No parking slots found</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Slot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotManagement;