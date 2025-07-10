// import React, { useState, useEffect } from 'react';
// import { Search, Calendar, Car, Clock, MapPin, Filter, Download } from 'lucide-react';
// import vehicleLogService from '../../services/api';
// import { useAuth } from '../../contexts/AuthContext';

// const VehicleLogs = () => {
//   const { user } = useAuth();
//   const [logs, setLogs] = useState([]);
//   const [filteredLogs, setFilteredLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [dateFilter, setDateFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');

//   useEffect(() => {
//     loadLogs();
//   }, []);

//   useEffect(() => {
//     filterLogs();
//   }, [logs, searchTerm, dateFilter, statusFilter]);

//   const loadLogs = async () => {
//     try {
//       setLoading(true);
//       const data = await vehicleLogService.getAllLogs();
//       setLogs(data);
//     } catch (error) {
//       console.error('Error loading vehicle logs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterLogs = () => {
//     let filtered = logs;

//     if (searchTerm) {
//       filtered = filtered.filter(log =>
//         log.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         log.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         log.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (dateFilter) {
//       filtered = filtered.filter(log =>
//         log.entryTime?.startsWith(dateFilter)
//       );
//     }

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(log => log.status === statusFilter);
//     }

//     setFilteredLogs(filtered);
//   };

//   const formatDateTime = (dateTime) => {
//     if (!dateTime) return 'N/A';
//     return new Date(dateTime).toLocaleString();
//   };

//   const calculateDuration = (entryTime, exitTime) => {
//     if (!entryTime || !exitTime) return 'N/A';
//     const entry = new Date(entryTime);
//     const exit = new Date(exitTime);
//     const duration = Math.abs(exit - entry) / (1000 * 60 * 60); // hours
//     return `${duration.toFixed(1)} hrs`;
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       'parked': { bg: 'bg-green-100', text: 'text-green-800', label: 'Parked' },
//       'exited': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Exited' },
//       'overstay': { bg: 'bg-red-100', text: 'text-red-800', label: 'Overstay' }
//     };

//     const config = statusConfig[status] || statusConfig['parked'];
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
//         {config.label}
//       </span>
//     );
//   };

//   const exportLogs = () => {
//     const csvContent = [
//       ['License Plate', 'Vehicle Type', 'Driver Name', 'Slot', 'Entry Time', 'Exit Time', 'Duration', 'Status'],
//       ...filteredLogs.map(log => [
//         log.licensePlate || '',
//         log.vehicleType || '',
//         log.driverName || '',
//         log.slotNumber || '',
//         formatDateTime(log.entryTime),
//         formatDateTime(log.exitTime),
//         calculateDuration(log.entryTime, log.exitTime),
//         log.status || ''
//       ])
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `vehicle-logs-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Vehicle Logs</h1>
//           <p className="text-gray-600">Track all vehicle entry and exit activities</p>
//         </div>
//         <button
//           onClick={exportLogs}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Download className="w-4 h-4" />
//           Export CSV
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="bg-white p-6 rounded-lg shadow-sm border">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search by license plate, type, or driver..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
          
//           <div className="relative">
//             <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="date"
//               value={dateFilter}
//               onChange={(e) => setDateFilter(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//             >
//               <option value="all">All Status</option>
//               <option value="parked">Currently Parked</option>
//               <option value="exited">Exited</option>
//               <option value="overstay">Overstay</option>
//             </select>
//           </div>

//           <div className="flex items-center text-sm text-gray-600">
//             <span className="font-medium">{filteredLogs.length}</span>
//             <span className="ml-1">records found</span>
//           </div>
//         </div>
//       </div>

//       {/* Logs Table */}
//       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Vehicle Details
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Driver
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Slot
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Entry Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Exit Time
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Duration
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredLogs.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
//                     <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                     <p className="text-lg font-medium">No vehicle logs found</p>
//                     <p className="text-sm">Try adjusting your search filters</p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0">
//                           <Car className="w-8 h-8 text-gray-400" />
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             {log.licensePlate || 'N/A'}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {log.vehicleType || 'Unknown Type'}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{log.driverName || 'N/A'}</div>
//                       <div className="text-sm text-gray-500">{log.driverPhone || ''}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <MapPin className="w-4 h-4 text-gray-400 mr-1" />
//                         <span className="text-sm text-gray-900">{log.slotNumber || 'N/A'}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <Clock className="w-4 h-4 text-gray-400 mr-1" />
//                         <span className="text-sm text-gray-900">{formatDateTime(log.entryTime)}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <Clock className="w-4 h-4 text-gray-400 mr-1" />
//                         <span className="text-sm text-gray-900">{formatDateTime(log.exitTime)}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm text-gray-900">
//                         {calculateDuration(log.entryTime, log.exitTime)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {getStatusBadge(log.status)}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VehicleLogs;


import React, { useState, useEffect } from 'react';
import { Search, Calendar, Car, Clock, MapPin, Filter, Download } from 'lucide-react';
import ApiService from '../../services/api'; // Correct import
import { useAuth } from '../../contexts/AuthContext';

const VehicleLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, dateFilter, statusFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAllVehicleLogs(); // Correct method call
      setLogs(data.logs || []); // Ensure logs are properly set
    } catch (error) {
      console.error('Error loading vehicle logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(log =>
        log.entryTime?.startsWith(dateFilter)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    setFilteredLogs(filtered);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  const calculateDuration = (entryTime, exitTime) => {
    if (!entryTime || !exitTime) return 'N/A';
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const duration = Math.abs(exit - entry) / (1000 * 60 * 60); // hours
    return `${duration.toFixed(1)} hrs`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'parked': { bg: 'bg-green-100', text: 'text-green-800', label: 'Parked' },
      'exited': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Exited' },
      'overstay': { bg: 'bg-red-100', text: 'text-red-800', label: 'Overstay' }
    };

    const config = statusConfig[status] || statusConfig['parked'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const exportLogs = () => {
    const csvContent = [
      ['License Plate', 'Vehicle Type', 'Driver Name', 'Slot', 'Entry Time', 'Exit Time', 'Duration', 'Status'],
      ...filteredLogs.map(log => [
        log.licensePlate || '',
        log.vehicleType || '',
        log.driverName || '',
        log.slotNumber || '',
        formatDateTime(log.entryTime),
        formatDateTime(log.exitTime),
        calculateDuration(log.entryTime, log.exitTime),
        log.status || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicle_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Logs</h1>
          <p className="text-gray-600">Track all vehicle entry and exit activities</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by license plate, type, or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="parked">Currently Parked</option>
              <option value="exited">Exited</option>
              <option value="overstay">Overstay</option>
            </select>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{filteredLogs.length}</span>
            <span className="ml-1">records found</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entry Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exit Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No vehicle logs found</p>
                    <p className="text-sm">Try adjusting your search filters</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Car className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {log.licensePlate || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.vehicleType || 'Unknown Type'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.driverName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{log.driverPhone || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{log.slotNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{formatDateTime(log.entryTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{formatDateTime(log.exitTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {calculateDuration(log.entryTime, log.exitTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleLogs;