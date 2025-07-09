import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Receipt, DollarSign, Filter, Download } from 'lucide-react';

const BillingManagement = () => {
  const { user } = useAuth();
  const { invoices, users, updateInvoice } = useParking();
  const [filter, setFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const getFilteredInvoices = () => {
    let filteredInvoices = invoices;

    if (user?.role === 'customer') {
      filteredInvoices = invoices.filter(invoice => invoice.userId === user.id);
    }

    if (filter !== 'all') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === filter);
    }

    if (paymentFilter !== 'all') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.paymentMethod === paymentFilter);
    }

    return filteredInvoices.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const handleStatusChange = (invoiceId, newStatus) => {
    updateInvoice(invoiceId, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'upi':
        return 'bg-purple-100 text-purple-800';
      case 'wallet':
        return 'bg-orange-100 text-orange-800';
      case 'cash':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const getTotalRevenue = () => {
    return getFilteredInvoices()
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  const filteredInvoices = getFilteredInvoices();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Receipt className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">
            {user?.role === 'customer' ? 'My Bills' : 'Billing Management'}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">₹{getTotalRevenue()}</p>
            <p className="text-green-100 text-sm">From {filteredInvoices.filter(i => i.status === 'paid').length} paid invoices</p>
          </div>
          <DollarSign className="h-12 w-12 text-green-200" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {filteredInvoices.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">Invoice #{invoice.id}</span>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                      <div>Customer: {getUserName(invoice.userId)}</div>
                      <div>Amount: ₹{invoice.amount}</div>
                      <div>Date: {new Date(invoice.timestamp).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${getPaymentMethodColor(invoice.paymentMethod)}`}>
                        {invoice.paymentMethod.toUpperCase()}
                      </span>
                      <span>{invoice.description}</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-2">
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    )}
                    
                    <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingManagement;