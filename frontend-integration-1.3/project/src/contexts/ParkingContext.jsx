  import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import ApiService from '../services/api';

const ParkingContext = createContext();

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};

export const ParkingProvider = ({ children }) => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalSlots: 0,
    occupiedSlots: 0,
    availableSlots: 0,
    revenue: 0,
    activeReservations: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadSlots(),
        loadVehicleLogs(),
        loadReservations(),
        loadInvoices(),
        user?.role === 'admin' ? loadUsers() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlots = async () => {
    try {
      const response = await ApiService.getAllSlots();
      if (response.slots) {
        const transformedSlots = response.slots.map(slot => ({
          id: slot.slotId.toString(),
          type: slot.type,
          location: slot.location,
          isOccupied: slot.occupied,
          floor: getFloorFromLocation(slot.location),
          section: slot.location.charAt(0),
          reservedBy: null
        }));
        setSlots(transformedSlots);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      throw error;
    }
  };

  const loadVehicleLogs = async () => {
    try {
      let response;
      
      if (user?.role === 'admin' || user?.role === 'staff') {
        response = await ApiService.getAllVehicleLogs();
        if (response.logs) {
          const transformedLogs = response.logs.map(transformVehicleLog);
          setVehicleLogs(transformedLogs);
        }
      } else if (user?.id) {
        response = await ApiService.getVehicleLogsByUser(user.id);
        if (Array.isArray(response)) {
          const transformedLogs = response.map(transformVehicleLog);
          setVehicleLogs(transformedLogs);
        }
      }
    } catch (error) {
      console.error('Error loading vehicle logs:', error);
      throw error;
    }
  };

  const loadReservations = async () => {
    try {
      let response;
      
      if (user?.role === 'admin' || user?.role === 'staff') {
        response = await ApiService.getAllReservations();
      } else if (user?.id) {
        response = await ApiService.getReservationsByUser(user.id);
      }
      
      if (Array.isArray(response)) {
        const transformedReservations = response.map(transformReservation);
        setReservations(transformedReservations);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      throw error;
    }
  };

  const loadInvoices = async () => {
    try {
      let response;
      
      if (user?.role === 'admin' || user?.role === 'staff') {
        response = await ApiService.getAllInvoices();
      } else if (user?.id) {
        response = await ApiService.getInvoicesByUser(user.id);
      }
      
      if (response?.success && response?.data) {
        const transformedInvoices = response.data.map(transformInvoice);
        setInvoices(transformedInvoices);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      throw error;
    }
  };

  const loadUsers = async () => {
    try {
      const response = await ApiService.getAllUsers();
      if (response.users) {
        const transformedUsers = response.users.map(transformUser);
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      throw error;
    }
  };

  // Transform functions
  const transformVehicleLog = (log) => ({
    id: log.logId?.toString() || '',
    vehicleNumber: log.vehicleNumber || '',
    entryTime: log.entryTime || '',
    exitTime: log.exitTime || '',
    duration: log.duration ? parseDuration(log.duration) : null,
    userId: log.userId?.toString() || '',
    slotId: log.slotId?.toString() || '',
    status: log.exitTime ? 'completed' : 'active',
    amount: calculateLogAmount(log)
  });

  const transformReservation = (reservation) => ({
    id: reservation.reservationId.toString(),
    userId: reservation.userId.toString(),
    slotId: reservation.slotId.toString(),
    vehicleNumber: reservation.vehicleNumber,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    status: reservation.status.toLowerCase(),
    amount: calculateReservationAmount(reservation),
    createdAt: reservation.startTime
  });

  const transformInvoice = (invoice) => ({
    id: invoice.invoiceId.toString(),
    userId: invoice.userId.toString(),
    amount: invoice.amount,
    paymentMethod: invoice.paymentMethod.toLowerCase(),
    status: mapInvoiceStatus(invoice.status),
    timestamp: invoice.timestamp,
    description: `Invoice #${invoice.invoiceId}`,
    reservationId: invoice.reservationId?.toString(),
    logId: invoice.logId?.toString()
  });

  const transformUser = (user) => ({
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    role: user.role.toLowerCase(),
    createdAt: new Date()
  });

  // Helper functions
  const getFloorFromLocation = (location) => {
    // Extract floor from location string (e.g., "A1" -> 0, "B1" -> 1)
    const section = location.charAt(0);
    return section === 'A' ? 0 : section === 'B' ? 1 : 2;
  };

  const parseDuration = (duration) => {
    const parts = duration.split(':');
    return parseInt(parts[0]) + parseInt(parts[1]) / 60;
  };

  const calculateLogAmount = (log) => {
    if (!log.duration) return 0;
    const hours = typeof log.duration === 'string' ? parseDuration(log.duration) : log.duration;
    const rate = log.slotType === '2W' ? 10 : 30;
    return Math.ceil(hours) * rate;
  };

  const calculateReservationAmount = (reservation) => {
    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const rate = reservation.type === '2W' ? 10 : 30;
    return Math.max(hours, 1) * rate;
  };

  const mapInvoiceStatus = (status) => {
    const statusMap = {
      'PAID': 'paid',
      'UNPAID': 'pending',
      'CANCELLED': 'failed'
    };
    return statusMap[status] || status.toLowerCase();
  };

  // CRUD Operations
  const addSlot = async (slotData) => {
    try {
      setIsLoading(true);
      const response = await ApiService.addSlot({
        location: slotData.location,
        type: slotData.type
      });
      
      if (response.slot) {
        await loadSlots();
        return { success: true };
      }
      return { success: false, error: 'Failed to add slot' };
    } catch (error) {
      console.error('Error adding slot:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSlot = async (slotId, updates) => {
    try {
      setIsLoading(true);
      
      if (updates.isOccupied !== undefined) {
        // Update occupancy only
        const response = await ApiService.updateSlotOccupancy(slotId, {
          occupied: updates.isOccupied
        });
        
        if (response.slot) {
          await loadSlots();
          return { success: true };
        }
      } else {
        // Update slot details
        const response = await ApiService.updateSlot(slotId, updates);
        
        if (response.slot) {
          await loadSlots();
          return { success: true };
        }
      }
      
      return { success: false, error: 'Failed to update slot' };
    } catch (error) {
      console.error('Error updating slot:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const removeSlot = async (slotId) => {
    try {
      setIsLoading(true);
      await ApiService.deleteSlot(slotId);
      await loadSlots();
      return { success: true };
    } catch (error) {
      console.error('Error removing slot:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const addVehicleLog = async (logData) => {
    try {
      setIsLoading(true);
      const response = await ApiService.logVehicleEntry({
        vehicleNumber: logData.vehicleNumber,
        userId: parseInt(logData.userId),
        slotId: parseInt(logData.slotId)
      });
      
      if (response.log) {
        await Promise.all([loadVehicleLogs(), loadSlots()]);
        return { success: true };
      }
      return { success: false, error: 'Failed to log vehicle entry' };
    } catch (error) {
      console.error('Error adding vehicle log:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateVehicleLog = async (logId, updates) => {
    try {
      setIsLoading(true);
      
      if (updates.status === 'completed') {
        // Handle vehicle exit
        const response = await ApiService.logVehicleExit({ logId: parseInt(logId) });
        
        if (response.log) {
          await Promise.all([loadVehicleLogs(), loadSlots()]);
          
          // Create invoice for the completed parking session
          await addInvoice({
            userId: response.log.userId,
            logId: response.log.logId,
            timestamp: new Date().toISOString(),
            paymentMethod: 'CASH'
          });
          
          return { success: true };
        }
      } else {
        // Handle other updates
        const response = await ApiService.updateVehicleLog(logId, updates);
        
        if (response.log) {
          await loadVehicleLogs();
          return { success: true };
        }
      }
      
      return { success: false, error: 'Failed to update vehicle log' };
    } catch (error) {
      console.error('Error updating vehicle log:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const addReservation = async (reservationData) => {
    try {
      setIsLoading(true);
      const response = await ApiService.createReservation({
        userId: parseInt(reservationData.userId),
        slotId: parseInt(reservationData.slotId),
        vehicleNumber: reservationData.vehicleNumber,
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
        type: reservationData.vehicleType || '4W'
      });
      
      if (response.reservation) {
        await loadReservations();
        
        // Create invoice for the reservation
        await addInvoice({
          userId: response.reservation.userId,
          reservationId: response.reservation.reservationId,
          timestamp: new Date().toISOString(),
          paymentMethod: 'UPI'
        });
        
        return { success: true };
      }
      return { success: false, error: 'Failed to create reservation' };
    } catch (error) {
      console.error('Error adding reservation:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateReservation = async (reservationId, updates) => {
    try {
      setIsLoading(true);
      const response = await ApiService.updateReservation(reservationId, updates);
      
      if (response.reservation) {
        await loadReservations();
        return { success: true };
      }
      return { success: false, error: 'Failed to update reservation' };
    } catch (error) {
      console.error('Error updating reservation:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const removeReservation = async (reservationId) => {
    try {
      setIsLoading(true);
      await ApiService.cancelReservation(reservationId);
      await loadReservations();
      return { success: true };
    } catch (error) {
      console.error('Error removing reservation:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const addInvoice = async (invoiceData) => {
    try {
      const response = await ApiService.createInvoice({
        userId: parseInt(invoiceData.userId),
        reservationId: invoiceData.reservationId ? parseInt(invoiceData.reservationId) : null,
        logId: invoiceData.logId ? parseInt(invoiceData.logId) : null,
        timestamp: invoiceData.timestamp,
        paymentMethod: invoiceData.paymentMethod.toUpperCase()
      });
      
      if (response.success) {
        await loadInvoices();
        return { success: true };
      }
      return { success: false, error: 'Failed to create invoice' };
    } catch (error) {
      console.error('Error adding invoice:', error);
      return { success: false, error: error.message };
    }
  };

  const updateInvoice = async (invoiceId, updates) => {
    try {
      setIsLoading(true);
      
      if (updates.status === 'paid') {
        const response = await ApiService.payInvoice(invoiceId, {
          paymentMethod: updates.paymentMethod?.toUpperCase() || 'CASH'
        });
        
        if (response.success) {
          await loadInvoices();
          return { success: true };
        }
      } else if (updates.status === 'failed') {
        const response = await ApiService.cancelInvoice(invoiceId);
        
        if (response.success) {
          await loadInvoices();
          return { success: true };
        }
      }
      
      return { success: false, error: 'Failed to update invoice' };
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (userData) => {
    try {
      setIsLoading(true);
      const response = await ApiService.registerUser(userData);
      
      if (response.user) {
        await loadUsers();
        return { success: true };
      }
      return { success: false, error: 'Failed to add user' };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setIsLoading(true);
      const response = await ApiService.updateUser(userId, {
        ...userData,
        role: userData.role.toUpperCase()
      });
      
      if (response.user) {
        await loadUsers();
        return { success: true };
      }
      return { success: false, error: 'Failed to update user' };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (userId) => {
    try {
      setIsLoading(true);
      await ApiService.deleteUser(userId);
      await loadUsers();
      return { success: true };
    } catch (error) {
      console.error('Error removing user:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableSlots = async (type) => {
    try {
      if (type) {
        const response = await ApiService.getAvailableSlotsByType(type);
        if (response.slots) {
          return response.slots.map(slot => ({
            id: slot.slotId.toString(),
            type: slot.type,
            location: slot.location,
            isOccupied: slot.occupied
          }));
        }
      } else {
        const response = await ApiService.getAvailableSlots();
        if (response.slots) {
          return response.slots.map(slot => ({
            id: slot.slotId.toString(),
            type: slot.type,
            location: slot.location,
            isOccupied: slot.occupied
          }));
        }
      }
      return [];
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  };

  const refreshStats = () => {
    const totalSlots = slots.length;
    const occupiedSlots = slots.filter(slot => slot.isOccupied).length;
    const availableSlots = totalSlots - occupiedSlots;
    const revenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const activeReservations = reservations.filter(r => 
      r.status === 'active' || r.status === 'pending'
    ).length;

    setStats({
      totalSlots,
      occupiedSlots,
      availableSlots,
      revenue,
      activeReservations
    });
  };

  useEffect(() => {
    refreshStats();
  }, [slots, vehicleLogs, reservations, invoices]);

  return (
    <ParkingContext.Provider value={{
      slots,
      vehicleLogs,
      reservations,
      invoices,
      users,
      stats,
      isLoading,
      error,
      addSlot,
      updateSlot,
      removeSlot,
      addVehicleLog,
      updateVehicleLog,
      addReservation,
      updateReservation,
      removeReservation,
      addInvoice,
      updateInvoice,
      addUser,
      updateUser,
      removeUser,
      getAvailableSlots,
      refreshStats,
      loadInitialData
    }}>
      {children}
    </ParkingContext.Provider>
  );
};