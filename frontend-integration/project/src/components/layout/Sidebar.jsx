import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Car, 
  LogIn, 
  LogOut, 
  Calendar, 
  Receipt, 
  Settings,
  Users,
  BarChart3,
  MapPin,
  FileText,
  Wrench
} from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'parking-map', label: 'Parking Map', icon: MapPin },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'slot-management', label: 'Slot Management', icon: Wrench },
        { id: 'vehicle-logs', label: 'Vehicle Logs', icon: FileText },
        { id: 'reservations', label: 'Reservations', icon: Calendar },
        { id: 'billing', label: 'Billing', icon: Receipt },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    } else if (user?.role === 'staff') {
      return [
        ...baseItems,
        { id: 'vehicle-entry', label: 'Vehicle Entry', icon: LogIn },
        { id: 'vehicle-exit', label: 'Vehicle Exit', icon: LogOut },
        { id: 'reservations', label: 'Reservations', icon: Calendar },
        { id: 'billing', label: 'Billing', icon: Receipt },
      ];
    } else {
      return [
        ...baseItems,
        { id: 'my-reservations', label: 'My Reservations', icon: Calendar },
        { id: 'my-vehicles', label: 'My Vehicles', icon: Car },
        { id: 'my-bills', label: 'My Bills', icon: Receipt },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white shadow-sm border-r min-h-screen w-64">
      <nav className="mt-8">
        <div className="px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;