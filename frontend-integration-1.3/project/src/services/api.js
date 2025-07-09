import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 second timeout
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data
        });
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data
        });
        return response.data;
      },
      (error) => {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          // Token expired or invalid
          console.log('Unauthorized access, clearing auth data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('parkingUser');
          // Don't reload immediately, let the app handle the redirect
          return Promise.reject(new Error('Session expired. Please login again.'));
        }
        
        // Extract error message from response
        let errorMessage = 'An error occurred';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  // User Management APIs
  async registerUser(userData) {
    try {
      const response = await this.client.post('/api/user/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        role: userData.role || 'CUSTOMER'
      });
      return response;
    } catch (error) {
      console.error('Register user error:', error);
      throw error;
    }
  }

  async loginUser(credentials) {
    try {
      const response = await this.client.post('/api/user/login', {
        email: credentials.email,
        password: credentials.password
      });
      return response;
    } catch (error) {
      console.error('Login user error:', error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await this.client.get('/api/user/profile');
      return response;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const response = await this.client.get('/api/user/all');
      return response;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const response = await this.client.get(`/api/user/${id}`);
      return response;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await this.client.put(`/api/user/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await this.client.delete(`/api/user/${id}`);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Slot Management APIs
  async addSlot(slotData) {
    try {
      const response = await this.client.post('/api/slots', {
        location: slotData.location,
        type: slotData.type
      });
      return response;
    } catch (error) {
      console.error('Add slot error:', error);
      throw error;
    }
  }

  async deleteSlot(slotId) {
    try {
      const response = await this.client.delete(`/api/slots/${slotId}`);
      return response;
    } catch (error) {
      console.error('Delete slot error:', error);
      throw error;
    }
  }

  async updateSlot(slotId, slotData) {
    try {
      const response = await this.client.put(`/api/slots/${slotId}`, {
        location: slotData.location,
        type: slotData.type,
        isOccupied: slotData.isOccupied
      });
      return response;
    } catch (error) {
      console.error('Update slot error:', error);
      throw error;
    }
  }

  async getAllSlots() {
    try {
      const response = await this.client.get('/api/slots/available');
      return response;
    } catch (error) {
      console.error('Get all slots error:', error);
      throw error;
    }
  }

  async getAvailableSlots() {
    try {
      const response = await this.client.get('/api/slots/available');
      return response;
    } catch (error) {
      console.error('Get available slots error:', error);
      throw error;
    }
  }

  async getAvailableSlotsByType(type) {
    try {
      const response = await this.client.get(`/api/slots/available/type/${type.toLowerCase()}`);
      return response;
    } catch (error) {
      console.error('Get available slots by type error:', error);
      throw error;
    }
  }

  async updateSlotOccupancy(slotId, occupancyData) {
    try {
      const response = await this.client.put(`/api/slots/slot/${slotId}`, occupancyData);
      return response;
    } catch (error) {
      console.error('Update slot occupancy error:', error);
      throw error;
    }
  }

  // Vehicle Log Management APIs
  async logVehicleEntry(entryData) {
    try {
      const response = await this.client.post('/api/vehicle-log/entry', {
        vehicleNumber: entryData.vehicleNumber,
        userId: entryData.userId,
        slotId: entryData.slotId
      });
      return response;
    } catch (error) {
      console.error('Log vehicle entry error:', error);
      throw error;
    }
  }

  async logVehicleExit(exitData) {
    try {
      const response = await this.client.post('/api/vehicle-log/exit', {
        logId: exitData.logId
      });
      return response;
    } catch (error) {
      console.error('Log vehicle exit error:', error);
      throw error;
    }
  }

  async getAllVehicleLogs() {
    try {
      const response = await this.client.get('/api/vehicle-log');
      return response;
    } catch (error) {
      console.error('Get all vehicle logs error:', error);
      throw error;
    }
  }

  async getVehicleLogById(id) {
    try {
      const response = await this.client.get(`/api/vehicle-log/${id}`);
      return response;
    } catch (error) {
      console.error('Get vehicle log by ID error:', error);
      throw error;
    }
  }

  async updateVehicleLog(id, logData) {
    try {
      const response = await this.client.put(`/api/vehicle-log/${id}`, logData);
      return response;
    } catch (error) {
      console.error('Update vehicle log error:', error);
      throw error;
    }
  }

  async getVehicleLogsByUser(userId) {
    try {
      const response = await this.client.get(`/api/vehicle-log/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Get vehicle logs by user error:', error);
      throw error;
    }
  }

  // Reservation Management APIs
  async createReservation(reservationData) {
    try {
      const response = await this.client.post('/api/reservations', {
        userId: reservationData.userId,
        slotId: reservationData.slotId,
        vehicleNumber: reservationData.vehicleNumber,
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
        type: reservationData.type
      });
      return response;
    } catch (error) {
      console.error('Create reservation error:', error);
      throw error;
    }
  }

  async getAllReservations() {
    try {
      const response = await this.client.get('/api/reservations');
      return response;
    } catch (error) {
      console.error('Get all reservations error:', error);
      throw error;
    }
  }

  async getReservationById(id) {
    try {
      const response = await this.client.get(`/api/reservations/${id}`);
      return response;
    } catch (error) {
      console.error('Get reservation by ID error:', error);
      throw error;
    }
  }

  async updateReservation(id, reservationData) {
    try {
      const response = await this.client.put(`/api/reservations/${id}`, reservationData);
      return response;
    } catch (error) {
      console.error('Update reservation error:', error);
      throw error;
    }
  }

  async cancelReservation(id) {
    try {
      const response = await this.client.delete(`/api/reservations/${id}`);
      return response;
    } catch (error) {
      console.error('Cancel reservation error:', error);
      throw error;
    }
  }

  async getReservationsByUser(userId) {
    try {
      const response = await this.client.get(`/api/reservations/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Get reservations by user error:', error);
      throw error;
    }
  }

  // Billing Management APIs
  async createInvoice(invoiceData) {
    try {
      const response = await this.client.post('/api/billing', {
        userId: invoiceData.userId,
        reservationId: invoiceData.reservationId,
        logId: invoiceData.logId,
        timestamp: invoiceData.timestamp,
        paymentMethod: invoiceData.paymentMethod
      });
      return response;
    } catch (error) {
      console.error('Create invoice error:', error);
      throw error;
    }
  }

  async getInvoiceById(id) {
    try {
      const response = await this.client.get(`/api/billing/${id}`);
      return response;
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      throw error;
    }
  }

  async getAllInvoices() {
    try {
      const response = await this.client.get('/api/billing');
      return response;
    } catch (error) {
      console.error('Get all invoices error:', error);
      throw error;
    }
  }

  async getInvoicesByUser(userId) {
    try {
      const response = await this.client.get(`/api/billing/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Get invoices by user error:', error);
      throw error;
    }
  }

  async payInvoice(invoiceId, paymentData) {
    try {
      const response = await this.client.post(`/api/billing/${invoiceId}/pay`, {
        paymentMethod: paymentData.paymentMethod
      });
      return response;
    } catch (error) {
      console.error('Pay invoice error:', error);
      throw error;
    }
  }

  async cancelInvoice(invoiceId) {
    try {
      const response = await this.client.post(`/api/billing/${invoiceId}/cancel`);
      return response;
    } catch (error) {
      console.error('Cancel invoice error:', error);
      throw error;
    }
  }
}

export default new ApiService();