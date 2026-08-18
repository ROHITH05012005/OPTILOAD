import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  User,
  MessageSquare,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Navigation,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AuthService, DeliveryData, DriverData, MessageData, BookingRequest } from '../services/auth';
import { TRUCK_OPTIONS } from '../constants';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { DealerDashboard } from '../components/DealerDashboard';

export const AdminDashboard: React.FC = () => {
  const userRole = localStorage.getItem('userRole');

  if (userRole === 'dealer') {
    return <DealerDashboard />;
  }

  const [activeTab, setActiveTab] = useState<'deliveries' | 'drivers' | 'map' | 'messages' | 'bookings'>('deliveries');
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBookingItemsModal, setShowBookingItemsModal] = useState(false);
  const [selectedDriverIds, setSelectedDriverIds] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Driver management state
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [showEditDriverForm, setShowEditDriverForm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null);
  const [driverFormData, setDriverFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    licenseNumber: '',
    truckId: ''
  });
  const navigate = useNavigate();

  // Form state for creating/editing deliveries
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    pickupLocation: '',
    dropLocation: '',
    packageWeight: 0,
    packageLength: 0,
    packageWidth: 0,
    packageHeight: 0,
    packageNotes: '',
    scheduledTime: ''
  });

  // Load data on component mount and set up polling
  useEffect(() => {
    loadData();

    // Poll for new messages every 3 seconds when message modal is open
    const interval = setInterval(() => {
      if (showMessageModal && selectedDelivery) {
        const deliveryMessages = AuthService.getMessagesByDelivery(selectedDelivery.id);
        setMessages(deliveryMessages);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [showMessageModal, selectedDelivery]);

  const loadData = () => {
    setDeliveries(AuthService.getDeliveries());
    setDrivers(AuthService.getDrivers());
    setBookings(AuthService.getBookings());
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    navigate('/login');
  };

  const handleCreateDelivery = () => {
    const newDelivery = AuthService.createDelivery({
      customerId: `customer-${Date.now()}`,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      pickupLocation: formData.pickupLocation,
      dropLocation: formData.dropLocation,
      packageWeight: formData.packageWeight,
      packageDimensions: {
        length: formData.packageLength,
        width: formData.packageWidth,
        height: formData.packageHeight
      },
      packageNotes: formData.packageNotes,
      scheduledTime: formData.scheduledTime
    });

    setDeliveries([...deliveries, newDelivery]);
    setShowCreateForm(false);
    resetForm();
  };

  const handleUpdateDelivery = () => {
    if (!selectedDelivery) return;

    const updatedDelivery = AuthService.updateDelivery(selectedDelivery.id, {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      pickupLocation: formData.pickupLocation,
      dropLocation: formData.dropLocation,
      packageWeight: formData.packageWeight,
      packageDimensions: {
        length: formData.packageLength,
        width: formData.packageWidth,
        height: formData.packageHeight
      },
      packageNotes: formData.packageNotes,
      scheduledTime: formData.scheduledTime
    });

    if (updatedDelivery) {
      setDeliveries(deliveries.map(d => d.id === selectedDelivery.id ? updatedDelivery : d));
    }

    setShowEditForm(false);
    resetForm();
  };

  const handleDeleteDelivery = (id: string) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      AuthService.deleteDelivery(id);
      setDeliveries(deliveries.filter(d => d.id !== id));
    }
  };

  const handleAssignDriver = (deliveryId: string, driverId: string) => {
    if (driverId) {
      const updatedDelivery = AuthService.assignDriver(deliveryId, driverId);
      if (updatedDelivery) {
        setDeliveries(deliveries.map(d => d.id === deliveryId ? updatedDelivery : d));
        setSelectedDriverIds(prev => ({ ...prev, [deliveryId]: '' }));
      }
    }
  };

  const handleDriverSelectChange = (deliveryId: string, driverId: string) => {
    setSelectedDriverIds(prev => ({ ...prev, [deliveryId]: driverId }));
  };

  const getSelectedDriverId = (deliveryId: string) => {
    return selectedDriverIds[deliveryId] || '';
  };

  const handleStatusChange = (deliveryId: string, status: DeliveryData['status']) => {
    const updatedDelivery = AuthService.updateDelivery(deliveryId, { status });
    if (updatedDelivery) {
      setDeliveries(deliveries.map(d => d.id === deliveryId ? updatedDelivery : d));
    }
  };

  const handleApproveBooking = (booking: BookingRequest) => {
    // Calculate total weight and dimensions from booking items if available
    const totalWeight = booking.items && booking.items.length > 0
      ? booking.items.reduce((sum: number, item: any) => sum + (item.weight || 0), 0)
      : 150; // fallback

    const firstItemDims = booking.items && booking.items.length > 0 && booking.items[0].dimensions
      ? booking.items[0].dimensions
      : { length: 60, width: 60, height: 45 }; // fallback

    // Create a new delivery from the booking
    const newDelivery = AuthService.createDelivery({
      customerId: `customer-${Date.now()}`,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      pickupLocation: booking.pickupLocation,
      dropLocation: booking.dropLocation,
      packageWeight: totalWeight,
      packageDimensions: firstItemDims,
      packageNotes: `Dealer order: ${booking.items?.length || 0} items of type ${booking.items?.[0]?.name || 'cargo'}.`,
      scheduledTime: booking.scheduledTime
    });

    setDeliveries([...deliveries, newDelivery]);

    // Update booking status
    const updatedBooking = AuthService.updateBookingStatus(booking.id, 'approved');
    if (updatedBooking) {
      setBookings(bookings.map(b => b.id === booking.id ? updatedBooking : b));
    }

    alert('Booking approved and delivery created!');
  };

  const handleRejectBooking = (id: string) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      const updatedBooking = AuthService.updateBookingStatus(id, 'rejected');
      if (updatedBooking) {
        setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
      }
    }
  };

  const openEditForm = (delivery: DeliveryData) => {
    setSelectedDelivery(delivery);
    setFormData({
      customerName: delivery.customerName,
      customerPhone: delivery.customerPhone,
      pickupLocation: delivery.pickupLocation,
      dropLocation: delivery.dropLocation,
      packageWeight: delivery.packageWeight,
      packageLength: delivery.packageDimensions.length,
      packageWidth: delivery.packageDimensions.width,
      packageHeight: delivery.packageDimensions.height,
      packageNotes: delivery.packageNotes,
      scheduledTime: delivery.scheduledTime
    });
    setShowEditForm(true);
  };

  const openMessageModal = (deliveryId: string) => {
    const deliveryMessages = AuthService.getMessagesByDelivery(deliveryId);
    setMessages(deliveryMessages);
    setSelectedDelivery(deliveries.find(d => d.id === deliveryId) || null);
    setShowMessageModal(true);
  };

  const openBookingItemsModal = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setShowBookingItemsModal(true);
  };

  const sendMessage = () => {
    if (selectedDelivery && newMessage.trim()) {
      const message = AuthService.sendMessage({
        deliveryId: selectedDelivery.id,
        senderId: 'admin',
        senderRole: 'admin',
        content: newMessage
      });
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      pickupLocation: '',
      dropLocation: '',
      packageWeight: 0,
      packageLength: 0,
      packageWidth: 0,
      packageHeight: 0,
      packageNotes: '',
      scheduledTime: ''
    });
    setSelectedDelivery(null);
  };

  const resetDriverForm = () => {
    setDriverFormData({
      username: '',
      password: '',
      name: '',
      phone: '',
      licenseNumber: '',
      truckId: ''
    });
    setSelectedDriver(null);
  };

  const handleAddDriver = () => {
    const newDriver = AuthService.addDriver({
      username: driverFormData.username,
      password: driverFormData.password,
      name: driverFormData.name,
      phone: driverFormData.phone,
      licenseNumber: driverFormData.licenseNumber,
      truckId: driverFormData.truckId || undefined
    });

    // Reload drivers from service instead of manually adding to avoid duplication
    setDrivers(AuthService.getDrivers());
    setShowAddDriverForm(false);
    resetDriverForm();
  };

  const handleUpdateDriver = () => {
    if (!selectedDriver) return;

    const updatedDriver = AuthService.updateDriver(selectedDriver.id, {
      username: driverFormData.username,
      password: driverFormData.password,
      name: driverFormData.name,
      phone: driverFormData.phone,
      licenseNumber: driverFormData.licenseNumber,
      truckId: driverFormData.truckId || undefined
    });

    if (updatedDriver) {
      setDrivers(drivers.map(d => d.id === selectedDriver.id ? updatedDriver : d));
    }

    setShowEditDriverForm(false);
    resetDriverForm();
  };

  const handleDeleteDriver = (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      AuthService.deleteDriver(id);
      setDrivers(drivers.filter(d => d.id !== id));

      // Also unassign deliveries for this driver
      deliveries.forEach(delivery => {
        if (delivery.assignedDriverId === id) {
          AuthService.updateDelivery(delivery.id, { assignedDriverId: undefined, status: 'pending' });
        }
      });

      // Reload deliveries to reflect changes
      setDeliveries(AuthService.getDeliveries());
    }
  };

  const openEditDriverForm = (driver: DriverData) => {
    setSelectedDriver(driver);
    setDriverFormData({
      username: driver.username,
      password: driver.password,
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      truckId: driver.truckId || ''
    });
    setShowEditDriverForm(true);
  };

  const openAddDriverForm = () => {
    resetDriverForm();
    setShowAddDriverForm(true);
  };

  const getStatusColor = (status: DeliveryData['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in-progress': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on-the-way-to-pickup': return 'bg-blue-100 text-blue-800';
      case 'reached-pickup': return 'bg-yellow-100 text-yellow-800';
      case 'picked-up': return 'bg-orange-100 text-orange-800';
      case 'loaded': return 'bg-purple-100 text-purple-800';
      case 'on-the-way': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: DeliveryData['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'on-the-way-to-pickup': return 'On the Way to Pickup';
      case 'reached-pickup': return 'Reached Pickup';
      case 'picked-up': return 'Picked Up';
      case 'loaded': return 'Loaded';
      case 'on-the-way': return 'On the Way';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900 flex items-center gap-2">
                LogiLoad {userRole === 'manager' ? 'Manager' : 'Admin'}
                {userRole === 'manager' && (
                  <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md border border-blue-200">
                    Operations Portal
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'deliveries'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Package className="inline-block h-4 w-4 mr-2" />
              Deliveries
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'drivers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <User className="inline-block h-4 w-4 mr-2" />
              Drivers
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <FileSpreadsheet className="inline-block h-4 w-4 mr-2" />
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'map'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <MapPin className="inline-block h-4 w-4 mr-2" />
              Live Map
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'messages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <MessageSquare className="inline-block h-4 w-4 mr-2" />
              Messages
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Delivery Management</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Plus className="h-4 w-4" />
                Create Delivery
              </button>
            </div>

            {/* Deliveries Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Package
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveries.map((delivery) => {
                      const driver = drivers.find(d => d.id === delivery.assignedDriverId);
                      const truck = driver?.truckId ? TRUCK_OPTIONS.find(t => t.id === driver.truckId) : null;

                      return (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{delivery.customerName}</div>
                            <div className="text-sm text-gray-500">{delivery.customerPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{delivery.pickupLocation}</div>
                            <div className="text-sm text-gray-500">to {delivery.dropLocation}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {delivery.packageWeight}kg
                            </div>
                            <div className="text-sm text-gray-500">
                              {delivery.packageDimensions.length}×{delivery.packageDimensions.width}×{delivery.packageDimensions.height}cm
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                              {getStatusText(delivery.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {driver ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                                {truck && (
                                  <div className="text-xs text-gray-500">{truck.name}</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Unassigned</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditForm(delivery)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDelivery(delivery.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openMessageModal(delivery.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Status Actions */}
                            <div className="mt-2">
                              {delivery.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(delivery.id, 'approved')}
                                  className="text-xs text-green-600 hover:text-green-800"
                                >
                                  Approve
                                </button>
                              )}
                              {delivery.status === 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(delivery.id, 'cancelled')}
                                  className="text-xs text-red-600 hover:text-red-800 ml-2"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>

                            {/* Driver Assignment */}
                            {delivery.status !== 'completed' && delivery.status !== 'cancelled' && (
                              <div className="mt-2 flex">
                                <select
                                  value={getSelectedDriverId(delivery.id)}
                                  onChange={(e) => handleDriverSelectChange(delivery.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-1 py-1"
                                >
                                  <option value="">Assign Driver</option>
                                  {drivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>
                                      {driver.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleAssignDriver(delivery.id, getSelectedDriverId(delivery.id))}
                                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded ml-1"
                                  disabled={!getSelectedDriverId(delivery.id)}
                                >
                                  Assign
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Driver Management</h2>
              <button
                onClick={openAddDriverForm}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Driver
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => {
                const truck = TRUCK_OPTIONS.find(t => t.id === driver.truckId);
                const stats = AuthService.getDriverStats(driver.id);

                return (
                  <div key={driver.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="bg-blue-100 rounded-full p-3">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{driver.name}</h3>
                            <p className="text-sm text-gray-500">{driver.username}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditDriverForm(driver)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(driver.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {driver.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">License:</span> {driver.licenseNumber}
                        </p>
                        {truck && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Truck:</span> {truck.name}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{stats.totalJobs}</p>
                          <p className="text-xs text-gray-500">Total Jobs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-600">{stats.completedJobs}</p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-blue-600">{stats.completionRate}%</p>
                          <p className="text-xs text-gray-500">Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Requests</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheduled Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                          <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.pickupLocation}</div>
                          <div className="text-sm text-gray-500">to {booking.dropLocation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.scheduledTime).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openBookingItemsModal(booking)}
                            className="flex items-center text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View {booking.items.length} Items
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveBooking(booking)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleRejectBooking(booking.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Live Map Tab */}
        {activeTab === 'map' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Delivery Tracking</h2>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-96 bg-gray-100 rounded-lg overflow-hidden relative z-0">
                <MapContainer
                  center={[19.0760, 72.8777]}
                  zoom={11}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {deliveries.filter(d => ['in-progress', 'on-the-way', 'picked-up'].includes(d.status)).map((delivery, idx) => (
                    <Marker
                      key={delivery.id}
                      position={[19.0760 + (idx * 0.01), 72.8777 + (idx * 0.01)]}
                    >
                      <Popup>
                        <div className="font-medium">{delivery.customerName}</div>
                        <div className="text-xs">{delivery.status}</div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Deliveries</h3>
                <div className="space-y-4">
                  {deliveries.filter(d => ['in-progress', 'on-the-way', 'picked-up'].includes(d.status)).map(delivery => {
                    const driver = drivers.find(d => d.id === delivery.assignedDriverId);
                    return (
                      <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{delivery.customerName}</h4>
                            <p className="text-sm text-gray-500">{driver?.name || 'Unassigned Driver'}</p>
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                            {getStatusText(delivery.status)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>{delivery.pickupLocation} → {delivery.dropLocation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                {deliveries.map(delivery => {
                  const deliveryMessages = AuthService.getMessagesByDelivery(delivery.id);
                  if (deliveryMessages.length === 0) return null;

                  return (
                    <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{delivery.customerName}</h3>
                      <p className="text-sm text-gray-500">{delivery.pickupLocation} → {delivery.dropLocation}</p>

                      <div className="mt-3 space-y-3">
                        {deliveryMessages.map(message => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${message.senderRole === 'admin'
                              ? 'bg-blue-50 ml-8'
                              : 'bg-gray-50 mr-8'
                              }`}
                          >
                            <div className="flex justify-between text-xs">
                              <span className={`font-medium ${message.senderRole === 'admin' ? 'text-blue-700' : 'text-gray-700'
                                }`}>
                                {message.senderRole === 'admin' ? 'Admin' : 'Driver'}
                              </span>
                              <span className="text-gray-500">
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-800">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Delivery Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Delivery</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateDelivery();
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                    <input
                      type="text"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Drop Location</label>
                  <input
                    type="text"
                    value={formData.dropLocation}
                    onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.packageWeight}
                      onChange={(e) => setFormData({ ...formData, packageWeight: Number(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <input
                      type="number"
                      placeholder="L"
                      value={formData.packageLength}
                      onChange={(e) => setFormData({ ...formData, packageLength: Number(e.target.value) })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="W"
                      value={formData.packageWidth}
                      onChange={(e) => setFormData({ ...formData, packageWidth: Number(e.target.value) })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="H"
                      value={formData.packageHeight}
                      onChange={(e) => setFormData({ ...formData, packageHeight: Number(e.target.value) })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.packageNotes}
                    onChange={(e) => setFormData({ ...formData, packageNotes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Delivery
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Modal */}
      {showEditForm && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Delivery</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateDelivery();
              }} className="space-y-4">
                {/* Same form fields as Create Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                    <input
                      type="text"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                  <input
                    type="text"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Drop Location</label>
                  <input
                    type="text"
                    value={formData.dropLocation}
                    onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.packageWeight}
                      onChange={(e) => setFormData({ ...formData, packageWeight: Number(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <input
                      type="number"
                      placeholder="L"
                      value={formData.packageLength}
                      onChange={(e) => setFormData({ ...formData, packageLength: Number(e.target.value) })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="W"
                      value={formData.packageWidth}
                      onChange={(e) => setFormData({ ...formData, packageWidth: Number(e.target.value) })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="H"
                      value={formData.packageHeight}
                      onChange={(e) => setFormData({ ...formData, packageHeight: Number(e.target.value) })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.packageNotes}
                    onChange={(e) => setFormData({ ...formData, packageNotes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update Delivery
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full h-[600px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">{selectedDelivery.customerName}</h3>
                <p className="text-sm text-gray-500">{selectedDelivery.id}</p>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.senderRole === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.senderRole === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Driver Modal */}
      {(showAddDriverForm || showEditDriverForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {showAddDriverForm ? 'Add New Driver' : 'Edit Driver'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddDriverForm(false);
                    setShowEditDriverForm(false);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                showAddDriverForm ? handleAddDriver() : handleUpdateDriver();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={driverFormData.name}
                    onChange={(e) => setDriverFormData({ ...driverFormData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={driverFormData.username}
                    onChange={(e) => setDriverFormData({ ...driverFormData, username: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={driverFormData.password}
                    onChange={(e) => setDriverFormData({ ...driverFormData, password: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={driverFormData.phone}
                    onChange={(e) => setDriverFormData({ ...driverFormData, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={driverFormData.licenseNumber}
                    onChange={(e) => setDriverFormData({ ...driverFormData, licenseNumber: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Truck (Optional)</label>
                  <select
                    value={driverFormData.truckId}
                    onChange={(e) => setDriverFormData({ ...driverFormData, truckId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select a truck</option>
                    {TRUCK_OPTIONS.map(truck => (
                      <option key={truck.id} value={truck.id}>
                        {truck.name} ({truck.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDriverForm(false);
                      setShowEditDriverForm(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {showAddDriverForm ? 'Add Driver' : 'Update Driver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking Items Modal */}
      {showBookingItemsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Items List</h3>
                <p className="text-sm text-gray-500">
                  Booking from {selectedBooking.customerName} ({selectedBooking.items.length} items)
                </p>
              </div>
              <button
                onClick={() => setShowBookingItemsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {selectedBooking.items.length > 0 && Object.keys(selectedBooking.items[0]).map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedBooking.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(item).map((value: any, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowBookingItemsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white"
              >
                Close
              </button>
              {selectedBooking.status === 'pending' && (
                <button
                  onClick={() => {
                    handleApproveBooking(selectedBooking);
                    setShowBookingItemsModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Approve Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};