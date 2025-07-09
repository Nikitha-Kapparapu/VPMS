import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ParkingProvider } from './contexts/ParkingContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import ParkingMap from './components/parking/ParkingMap';
import VehicleLogs from './components/logs/VehicleLogs';
import ReservationList from './components/reservations/ReservationList';
import VehicleEntry from './components/vehicles/VehicleEntry';
import VehicleExit from './components/vehicles/VehicleExit';
import SlotManagement from './components/slots/SlotManagement';
import UserManagement from './components/users/UserManagement';
import BillingManagement from './components/billing/BillingManagement';
// import VehicleLogs from './components/logs/VehicleLogs';
import MyVehicles from './components/vehicles/MyVehicles';
import MyBills from './components/billing/MyBills';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return isLoginMode ? (
      <LoginForm onToggleMode={() => setIsLoginMode(false)} />
    ) : (
      <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'parking-map':
        return <ParkingMap />;
      case 'slot-management':
        return <SlotManagement />;
      case 'vehicle-entry':
        return <VehicleEntry />;
      case 'vehicle-exit':
        return <VehicleExit />;
      case 'vehicle-logs':
        return <VehicleLogs />;
      case 'reservations':
      case 'my-reservations':
        return <ReservationList />;
      case 'billing':
        return <BillingManagement />;
      case 'my-bills':
        return <MyBills />;
      case 'users':
        return <UserManagement />;
      case 'my-vehicles':
        return <MyVehicles />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ParkingProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </ParkingProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;