import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { Car, MapPin, Filter } from 'lucide-react';

const ParkingMap = () => {
  const { slots } = useParking();
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [filterType, setFilterType] = useState('all');

  const floors = [
    { number: 0, name: 'Ground Floor', section: 'A' },
    { number: 1, name: 'First Floor', section: 'B' },
    { number: 2, name: 'Second Floor', section: 'C' }
  ];

  const getFilteredSlots = () => {
    return slots.filter(slot => {
      const floorMatch = slot.floor === selectedFloor;
      const typeMatch = filterType === 'all' || slot.type === filterType;
      return floorMatch && typeMatch;
    });
  };

  const getSlotColor = (slot) => {
    if (slot.isOccupied) return 'bg-red-500';
    if (slot.reservedBy) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSlotBorderColor = (slot) => {
    if (slot.isOccupied) return 'border-red-600';
    if (slot.reservedBy) return 'border-yellow-600';
    return 'border-green-600';
  };

  const filteredSlots = getFilteredSlots();
  const occupiedCount = filteredSlots.filter(s => s.isOccupied).length;
  const reservedCount = filteredSlots.filter(s => s.reservedBy).length;
  const availableCount = filteredSlots.length - occupiedCount - reservedCount;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Parking Map</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vehicles</option>
                <option value="2W">2 Wheeler</option>
                <option value="4W">4 Wheeler</option>
              </select>
            </div>
          </div>
        </div>

        {/* Floor Selection */}
        <div className="flex space-x-2 mb-6">
          {floors.map((floor) => (
            <button
              key={floor.number}
              onClick={() => setSelectedFloor(floor.number)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFloor === floor.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {floor.name}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm font-medium">Available ({availableCount})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm font-medium">Reserved ({reservedCount})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm font-medium">Occupied ({occupiedCount})</span>
          </div>
        </div>

        {/* Parking Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className={`
                relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md
                ${getSlotColor(slot)} ${getSlotBorderColor(slot)}
              `}
              title={`Slot: ${slot.id}\nType: ${slot.type}\nStatus: ${
                slot.isOccupied ? 'Occupied' : slot.reservedBy ? 'Reserved' : 'Available'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Car className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="absolute -bottom-1 left-0 right-0 text-center">
                <span className="text-xs font-medium bg-white px-1 rounded text-gray-700">
                  {slot.id.split('-').pop()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredSlots.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No slots found for the selected filters</p>
          </div>
        )}
      </div>

      {/* Floor Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {floors.find(f => f.number === selectedFloor)?.name} Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            <div className="text-sm text-green-700">Available Slots</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{reservedCount}</div>
            <div className="text-sm text-yellow-700">Reserved Slots</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{occupiedCount}</div>
            <div className="text-sm text-red-700">Occupied Slots</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingMap;