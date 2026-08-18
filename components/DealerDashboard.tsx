import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  MessageSquare,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  LogOut,
  Send,
  Building,
  RefreshCw,
  Search,
  Bell
} from 'lucide-react';
import {
  AuthService,
  DeliveryData,
  DealershipData,
  DemandForecast,
  TrackingMilestone,
  MessageData
} from '../services/auth';

export const DealerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dealership, setDealership] = useState<DealershipData | null>(null);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryData | null>(null);
  const [milestones, setMilestones] = useState<TrackingMilestone[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'shipments' | 'forecast' | 'bookings'>('inventory');
  
  // Booking creation form state
  const [bookingForm, setBookingForm] = useState({
    pickupLocation: 'Main Distribution Center, Mumbai',
    dropLocation: '',
    scheduledTime: '',
    itemName: 'Auto Parts Box',
    quantity: 10,
    weight: 200,
    length: 60,
    width: 60,
    height: 45
  });
  
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    // Load dealer data
    const dealershipsList = AuthService.getDealerships();
    // Default to the first dealership for the demo dealer
    const currentDealer = dealershipsList[0];
    setDealership(currentDealer);

    if (currentDealer) {
      // Load forecasts for this dealership
      const f = AuthService.getDemandForecasts(currentDealer.id);
      setForecasts(f);

      // Load deliveries destined for this dealer's city or matching drop location
      const allDeliveries = AuthService.getDeliveries();
      const dealerDeliveries = allDeliveries.filter(
        d => d.dropLocation.toLowerCase().includes(currentDealer.city.split(',')[0].toLowerCase()) ||
             d.dropLocation.toLowerCase().includes('mumbai') // Fallback matching
      );
      setDeliveries(dealerDeliveries);
      
      // Prefill booking dropLocation with dealership address
      setBookingForm(prev => ({
        ...prev,
        dropLocation: currentDealer.location
      }));
    }
  }, []);

  // Poll for messages and updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDelivery) {
        setMessages(AuthService.getMessagesByDelivery(selectedDelivery.id));
        setMilestones(AuthService.getTrackingMilestones(selectedDelivery.id));
      }
      
      // Sync deliveries list
      if (dealership) {
        const allDeliveries = AuthService.getDeliveries();
        const dealerDeliveries = allDeliveries.filter(
          d => d.dropLocation.toLowerCase().includes(dealership.city.split(',')[0].toLowerCase()) ||
               d.dropLocation.toLowerCase().includes('mumbai')
        );
        setDeliveries(dealerDeliveries);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedDelivery, dealership]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    navigate('/login');
  };

  const handleSelectDelivery = (delivery: DeliveryData) => {
    setSelectedDelivery(delivery);
    setMilestones(AuthService.getTrackingMilestones(delivery.id));
    setMessages(AuthService.getMessagesByDelivery(delivery.id));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery || !newMessageText.trim()) return;

    const newMsg = AuthService.sendMessage({
      deliveryId: selectedDelivery.id,
      senderId: 'dealer-1',
      senderRole: 'dealer',
      content: newMessageText.trim()
    });

    setMessages([...messages, newMsg]);
    setNewMessageText('');
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create an item list for this booking request
    const items = Array.from({ length: bookingForm.quantity }).map((_, i) => ({
      id: `bi-${Date.now()}-${i}`,
      name: bookingForm.itemName,
      dimensions: {
        length: Number(bookingForm.length),
        width: Number(bookingForm.width),
        height: Number(bookingForm.height)
      },
      weight: Number(bookingForm.weight),
      color: '#4f46e5',
      isFragile: false,
      isStackable: true
    }));

    AuthService.createBooking({
      customerName: dealership?.name || 'Dealership Customer',
      customerPhone: dealership?.phone || '+91 99999 99999',
      pickupLocation: bookingForm.pickupLocation,
      dropLocation: bookingForm.dropLocation,
      scheduledTime: bookingForm.scheduledTime || new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16),
      items
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveSubTab('shipments');
    }, 2000);

    // Reset form fields
    setBookingForm(prev => ({
      ...prev,
      quantity: 10,
      scheduledTime: ''
    }));
  };

  const triggerOrderFromForecast = (forecast: DemandForecast) => {
    setBookingForm({
      pickupLocation: 'Main Distribution Center, Mumbai',
      dropLocation: dealership?.location || '',
      scheduledTime: new Date(Date.now() + 48*60*60*1000).toISOString().slice(0, 16),
      itemName: forecast.itemName,
      quantity: forecast.recommendedOrderQty || 15,
      weight: forecast.itemName === 'Steel Coils' ? 1200 : 250,
      length: forecast.itemName === 'Steel Coils' ? 120 : 60,
      width: forecast.itemName === 'Steel Coils' ? 80 : 60,
      height: forecast.itemName === 'Steel Coils' ? 80 : 45
    });
    setActiveSubTab('bookings');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Top Banner */}
      <header className="bg-gray-800/80 border-b border-gray-700/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-purple-600 to-pink-600 p-2.5 rounded-xl text-white shadow-lg">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">LogiLoad Dealership Portal</span>
              <h1 className="text-xl font-bold text-white tracking-tight">{dealership?.name || 'Dealership Hub'}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-gray-700/50 border border-gray-600/50 px-4 py-2 rounded-xl hidden md:flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300 font-medium">Dealer ID: {dealership?.id}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4.5 py-2.5 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white rounded-xl border border-gray-600/80 transition-all shadow-md hover:shadow-lg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Navigation & Dealer Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-5 shadow-xl">
              <h2 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Portal Sections</h2>
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveSubTab('inventory')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                    activeSubTab === 'inventory'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Dealership Inventory
                </button>
                
                <button
                  onClick={() => setActiveSubTab('shipments')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                    activeSubTab === 'shipments'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  Shipment Tracking
                  {deliveries.filter(d => d.status !== 'completed' && d.status !== 'cancelled').length > 0 && (
                    <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {deliveries.filter(d => d.status !== 'completed' && d.status !== 'cancelled').length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSubTab('forecast')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                    activeSubTab === 'forecast'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Predictive Intelligence
                  <span className="ml-auto bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-lg border border-purple-500/30 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    AI
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition-all ${
                    activeSubTab === 'bookings'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  Order Shipment
                </button>
              </nav>
            </div>

            {/* Dealership Quick Info */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-5 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-3">Facility Info</h3>
              <div className="space-y-4.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-200">Address</p>
                    <p className="text-xs text-gray-400 mt-0.5">{dealership?.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-200">Contact Representative</p>
                    <p className="text-xs text-gray-400 mt-0.5">{dealership?.contactPerson}</p>
                    <p className="text-xs text-purple-400 font-medium mt-0.5">{dealership?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns: Main content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* SUBTAB: Dealership Inventory */}
            {activeSubTab === 'inventory' && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Dealership Stock Levels</h2>
                  <p className="text-sm text-gray-400 mt-1">Real-time status of cargo inventory housed at your local dealership warehouse.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {dealership?.currentStock.map((stock, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-700/40 rounded-xl p-5 hover:border-gray-600 transition shadow-inner">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stock.item}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-white">{stock.qty}</span>
                        <span className="text-xs text-gray-400 font-medium">units</span>
                      </div>
                      <div className="mt-4 bg-gray-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (stock.qty / 150) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xxs text-gray-400 mt-2 font-medium">
                        <span>Capacity: {stock.qty} / 150</span>
                        <span>{Math.round((stock.qty / 150) * 100)}% Utilized</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-5 flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-purple-300 text-sm">Smart Suggestion</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      AI systems predict high automotive component consumption in Pune and Bangalore over the next fortnight. Review the <span className="text-purple-400 font-semibold cursor-pointer hover:underline" onClick={() => setActiveSubTab('forecast')}>Predictive Intelligence tab</span> to optimize replenishment orders.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB: Shipment Tracking */}
            {activeSubTab === 'shipments' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Shipments List */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-5 shadow-xl space-y-5 flex flex-col h-[550px]">
                  <div>
                    <h2 className="text-lg font-bold text-white">Incoming Shipments</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Active or completed transport shipments destined for this dealership.</p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                    {deliveries.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                        <Package className="w-12 h-12 mb-3.5 text-gray-600" />
                        <p className="text-sm font-semibold">No shipments booked yet</p>
                        <p className="text-xs mt-1">Book an order to initiate cargo optimization.</p>
                      </div>
                    ) : (
                      deliveries.map(delivery => (
                        <div
                          key={delivery.id}
                          onClick={() => handleSelectDelivery(delivery)}
                          className={`p-4 rounded-xl border cursor-pointer transition shadow-md ${
                            selectedDelivery?.id === delivery.id
                              ? 'bg-purple-950/20 border-purple-500 shadow-purple-500/5'
                              : 'bg-gray-900/60 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-purple-400 font-bold">{delivery.id.toUpperCase()}</p>
                              <h4 className="font-bold text-white text-sm mt-1">{delivery.customerName}</h4>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase ${
                              delivery.status === 'completed' || delivery.status === 'delivered'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : ['in-progress', 'on-the-way', 'loaded'].includes(delivery.status)
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                              {delivery.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-4 text-xxs text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate">From: {delivery.pickupLocation}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 text-xxs text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                            <span className="truncate">To: {delivery.dropLocation}</span>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800 text-xxs text-gray-400">
                            <span>Weight: {delivery.packageWeight} kg</span>
                            <span className="font-semibold text-gray-300">Scheduled: {new Date(delivery.scheduledTime).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Tracking Details */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-5 shadow-xl flex flex-col h-[550px]">
                  {selectedDelivery ? (
                    <div className="flex flex-col h-full space-y-5">
                      <div className="flex justify-between items-center border-b border-gray-700/60 pb-3">
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tracking Details</p>
                          <h3 className="text-sm font-bold text-white mt-0.5">{selectedDelivery.id.toUpperCase()}</h3>
                        </div>
                        <span className="text-xxs text-gray-400">Telemetry: <span className="text-green-400 font-bold">Active</span></span>
                      </div>

                      {/* Milestones Flow */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {milestones.map((m, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xxs ${
                                m.status === 'completed'
                                  ? 'bg-green-500/20 border-green-500 text-green-400'
                                  : m.status === 'current'
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse'
                                  : 'bg-gray-800 border-gray-700 text-gray-500'
                              }`}>
                                {m.status === 'completed' ? '✓' : i + 1}
                              </div>
                              {i < milestones.length - 1 && (
                                <div className={`w-0.5 flex-1 my-1 ${m.status === 'completed' ? 'bg-green-600/50' : 'bg-gray-700'}`}></div>
                              )}
                            </div>
                            
                            <div className="flex-1 bg-gray-900/60 border border-gray-700/40 p-3.5 rounded-xl">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white text-xs">{m.title}</h4>
                                <span className="text-xxs text-gray-400 font-medium">{m.time}</span>
                              </div>
                              <p className="text-xxs text-gray-400 mt-1 leading-normal">{m.description}</p>
                              
                              {m.location && (
                                <p className="text-xxs text-purple-400 font-medium mt-2 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {m.location}
                                </p>
                              )}

                              {/* Telemetry Sensor Logs */}
                              {m.status === 'current' && m.temperature && (
                                <div className="mt-3 flex gap-4 pt-2.5 border-t border-gray-800/80">
                                  <div className="flex items-center gap-1.5 text-xxs text-gray-400">
                                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                                    <span>Temp: <strong className="text-gray-200">{m.temperature}°C</strong></span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xxs text-gray-400">
                                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Humidity: <strong className="text-gray-200">{m.humidity}%</strong></span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat box */}
                      <div className="border-t border-gray-700/80 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          Live Chat with Dispatcher
                        </h4>
                        
                        <div className="bg-gray-900 rounded-xl p-3 h-32 overflow-y-auto space-y-2 text-xxs shadow-inner">
                          {messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'dealer' ? 'items-end' : 'items-start'}`}>
                              <span className="text-gray-500 font-semibold mb-0.5 text-2xs">
                                {msg.senderRole === 'dealer' ? 'You (Dealer)' : 'Dispatch'}
                              </span>
                              <div className={`p-2 rounded-lg max-w-[85%] ${
                                msg.senderRole === 'dealer'
                                  ? 'bg-purple-600 text-white rounded-tr-none'
                                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700/50'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <input
                            type="text"
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                          />
                          <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl transition shadow-md"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                      <Clock className="w-12 h-12 mb-3.5 text-gray-600" />
                      <p className="text-sm font-semibold">Select a shipment</p>
                      <p className="text-xs mt-1">Select an incoming shipment from the left list to review real-time milestones and chat with dispatchers.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUBTAB: Predictive Intelligence */}
            {activeSubTab === 'forecast' && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-6 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      AI Predictive Logistics Engine
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Predicts next-month local customer demand using cyclical order histories, regional industry activity, and weather trends.</p>
                  </div>
                  <button className="bg-gray-700 hover:bg-gray-600 text-xs font-semibold px-4 py-2.5 rounded-xl border border-gray-600 transition flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-Calculate Forecast
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {forecasts.map(forecast => (
                    <div key={forecast.id} className="bg-gray-900 border border-gray-700/40 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-purple-500/40 transition shadow-lg">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-white text-base">{forecast.itemName}</h3>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xxs font-bold border ${
                            forecast.confidenceScore >= 90
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {forecast.confidenceScore}% AI Confidence
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{forecast.reasoning}</p>
                      </div>

                      <div className="flex gap-8 items-center border-l border-gray-800 pl-6 h-full min-w-[280px]">
                        <div className="text-center">
                          <span className="text-xxs text-gray-500 font-semibold uppercase tracking-wider block">Historical Avg</span>
                          <span className="text-xl font-extrabold text-gray-400 block mt-1">{forecast.historicalAvg} u/mo</span>
                        </div>
                        
                        <div className="text-center">
                          <span className="text-xxs text-purple-400 font-semibold uppercase tracking-wider block flex items-center gap-1 justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Projected
                          </span>
                          <span className="text-xl font-extrabold text-white block mt-1">{forecast.predictedDemand} u/mo</span>
                        </div>

                        <div className="ml-auto">
                          {forecast.recommendedOrderQty > 0 ? (
                            <button
                              onClick={() => triggerOrderFromForecast(forecast)}
                              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md flex items-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              Order +{forecast.recommendedOrderQty}
                            </button>
                          ) : (
                            <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-3 py-2 rounded-xl border border-green-500/20 block text-center">
                              Stock Adequate
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700/60 pt-6">
                  <h3 className="font-bold text-white text-sm mb-3">Model Accuracy & Logistics Optimization Matrix</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-extrabold text-sm border border-purple-500/20">
                        8.5%
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-300">Mean Absolute Percentage Error (MAPE)</h4>
                        <p className="text-xxs text-gray-400 mt-0.5">High precision demand model matching regional industrial supply.</p>
                      </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-sm border border-indigo-500/20">
                        -18%
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-300">Inventory Holding Cost Reduction</h4>
                        <p className="text-xxs text-gray-400 mt-0.5">Minimized capital blockage via responsive AI safety stocks.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB: Order Shipment */}
            {activeSubTab === 'bookings' && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Order Shipment Booking</h2>
                  <p className="text-sm text-gray-400 mt-1">Submit booking requests directly to the central dispatch team. Shipment item volume and weight will be pre-optimized.</p>
                </div>

                {bookingSuccess && (
                  <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Booking request submitted successfully! Awaiting dispatch allocation.</span>
                  </div>
                )}

                <form onSubmit={handleCreateBooking} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Origin */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Pickup Location</label>
                    <input
                      type="text"
                      value={bookingForm.pickupLocation}
                      disabled
                      className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                    />
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Drop Location (Dealership address)</label>
                    <input
                      type="text"
                      value={bookingForm.dropLocation}
                      onChange={(e) => setBookingForm({ ...bookingForm, dropLocation: e.target.value })}
                      required
                      className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>

                  {/* Cargo Cargo Item type */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Cargo Item Type</label>
                    <select
                      value={bookingForm.itemName}
                      onChange={(e) => {
                        const val = e.target.value;
                        let dimensions = { weight: 200, length: 60, width: 60, height: 45 };
                        if (val === 'Steel Coils') {
                          dimensions = { weight: 1200, length: 120, width: 80, height: 80 };
                        } else if (val === 'Electronics Crate') {
                          dimensions = { weight: 120, length: 60, width: 50, height: 40 };
                        }
                        setBookingForm({ ...bookingForm, itemName: val, ...dimensions });
                      }}
                      className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none"
                    >
                      <option value="Auto Parts Box">Auto Parts Box</option>
                      <option value="Steel Coils">Steel Coils</option>
                      <option value="Electronics Crate">Electronics Crate</option>
                    </select>
                  </div>

                  {/* Order quantity */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={bookingForm.quantity}
                      onChange={(e) => setBookingForm({ ...bookingForm, quantity: Math.max(1, Number(e.target.value)) })}
                      required
                      className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>

                  {/* Scheduled Dispatch Date */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Preferred Delivery Date</label>
                    <input
                      type="datetime-local"
                      value={bookingForm.scheduledTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                      required
                      className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none [color-scheme:dark]"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-gray-700/60 flex items-center justify-between">
                    <div className="text-xs text-gray-400 max-w-md">
                      * Booking will immediately trigger the <strong>Hybrid LIFO Loading Optimizer</strong> once approved by the managers, determining structural stability and weight balance.
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl"
                    >
                      Submit Booking Request
                    </button>
                  </div>

                </form>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};
