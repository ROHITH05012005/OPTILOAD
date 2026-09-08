/**
 * firestoreService.ts
 * Replaces localStorage-based operational storage with real Firebase Firestore.
 * Provides persistent, multi-device, real-time shared data for Admin, Manager, Drivers, and Dealers.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  DriverData,
  DeliveryData,
  DeliveryStatus,
  MessageData,
  BookingRequest,
  DealershipData,
  DemandForecast,
  TrackingMilestone
} from './auth';

export type {
  DriverData,
  DeliveryData,
  DeliveryStatus,
  MessageData,
  BookingRequest,
  DealershipData,
  DemandForecast,
  TrackingMilestone
};

// Default seed data if Firestore collections are empty
const DEFAULT_DRIVERS: DriverData[] = [
  {
    id: 'driver-1',
    username: 'driver1',
    password: 'driver123',
    email: 'raj.kumar@optiload.in',
    name: 'Raj Kumar',
    phone: '+91 98765 43210',
    truckId: 'tata-1109',
    licenseNumber: 'DL-2024-001'
  },
  {
    id: 'driver-2',
    username: 'driver2',
    password: 'driver123',
    email: 'amit.sharma@optiload.in',
    name: 'Amit Sharma',
    phone: '+91 98765 43211',
    truckId: 'eicher-12ft',
    licenseNumber: 'DL-2024-002'
  },
  {
    id: 'driver-3',
    username: 'driver3',
    password: 'driver123',
    email: 'suresh.patel@optiload.in',
    name: 'Suresh Patel',
    phone: '+91 98765 43212',
    truckId: 'bharatbenz-1623r',
    licenseNumber: 'DL-2024-003'
  }
];

const DEFAULT_DELIVERIES: DeliveryData[] = [
  {
    id: 'delivery-1',
    customerId: 'customer-1',
    customerName: 'ABC Electronics',
    customerPhone: '+91 98765 00001',
    pickupLocation: 'Nariman Point, Mumbai, Maharashtra',
    dropLocation: 'Shivaji Nagar, Pune, Maharashtra',
    packageWeight: 50,
    packageDimensions: { length: 60, width: 40, height: 30 },
    packageNotes: 'Fragile electronics',
    scheduledTime: '2024-06-15T09:00:00',
    status: 'assigned',
    assignedDriverId: 'driver-1',
    createdAt: '2024-06-10T10:00:00',
    updatedAt: '2024-06-10T10:00:00'
  },
  {
    id: 'delivery-2',
    customerId: 'customer-2',
    customerName: 'XYZ Furniture',
    customerPhone: '+91 98765 00002',
    pickupLocation: 'MG Road, Bangalore, Karnataka',
    dropLocation: 'HITEC City, Hyderabad, Telangana',
    packageWeight: 120,
    packageDimensions: { length: 120, width: 80, height: 60 },
    packageNotes: 'Large furniture items',
    scheduledTime: '2024-06-16T14:00:00',
    status: 'pending',
    createdAt: '2024-06-11T11:00:00',
    updatedAt: '2024-06-11T11:00:00'
  }
];

let seededDrivers = false;
let seededDeliveries = false;

// Auto-seed drivers if collection is empty
async function ensureDriversSeeded(drivers: DriverData[]) {
  if (seededDrivers || drivers.length > 0) return;
  seededDrivers = true;
  for (const driver of DEFAULT_DRIVERS) {
    try {
      await setDoc(doc(db, 'drivers', driver.id), driver);
    } catch (e) {
      console.warn('Failed to seed driver:', driver.id, e);
    }
  }
}

// Auto-seed deliveries if collection is empty
async function ensureDeliveriesSeeded(deliveries: DeliveryData[]) {
  if (seededDeliveries || deliveries.length > 0) return;
  seededDeliveries = true;
  for (const del of DEFAULT_DELIVERIES) {
    try {
      await setDoc(doc(db, 'deliveries', del.id), del);
    } catch (e) {
      console.warn('Failed to seed delivery:', del.id, e);
    }
  }
}

export const FirestoreService = {
  // ================= DRIVERS =================
  async getDrivers(): Promise<DriverData[]> {
    try {
      const snap = await getDocs(collection(db, 'drivers'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DriverData));
      if (list.length === 0) {
        await ensureDriversSeeded(list);
        return DEFAULT_DRIVERS;
      }
      return list;
    } catch (error) {
      console.error('Error fetching drivers from Firestore:', error);
      return DEFAULT_DRIVERS;
    }
  },

  async getDriverById(id: string): Promise<DriverData | undefined> {
    try {
      const snap = await getDoc(doc(db, 'drivers', id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as DriverData;
      }
      const all = await this.getDrivers();
      return all.find(d => d.id === id);
    } catch (error) {
      console.error('Error fetching driver by ID:', error);
      return DEFAULT_DRIVERS.find(d => d.id === id);
    }
  },

  async addDriver(driver: Omit<DriverData, 'id'>): Promise<DriverData> {
    const newId = `driver-${Date.now()}`;
    const newDriver: DriverData = { ...driver, id: newId };
    await setDoc(doc(db, 'drivers', newId), newDriver);
    return newDriver;
  },

  async updateDriver(id: string, updates: Partial<DriverData>): Promise<DriverData | null> {
    try {
      const ref = doc(db, 'drivers', id);
      await updateDoc(ref, updates as any);
      const updated = await getDoc(ref);
      return { id: updated.id, ...updated.data() } as DriverData;
    } catch (error) {
      console.error('Error updating driver:', error);
      return null;
    }
  },

  async deleteDriver(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'drivers', id));
      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      return false;
    }
  },

  subscribeDrivers(callback: (drivers: DriverData[]) => void): () => void {
    const q = collection(db, 'drivers');
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DriverData));
        if (list.length === 0) {
          ensureDriversSeeded(list);
          callback(DEFAULT_DRIVERS);
        } else {
          callback(list);
        }
      },
      (error) => {
        console.error('Drivers snapshot error:', error);
        callback(DEFAULT_DRIVERS);
      }
    );
  },

  // ================= DELIVERIES =================
  async getDeliveries(): Promise<DeliveryData[]> {
    try {
      const snap = await getDocs(collection(db, 'deliveries'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryData));
      if (list.length === 0) {
        await ensureDeliveriesSeeded(list);
        return DEFAULT_DELIVERIES;
      }
      return list;
    } catch (error) {
      console.error('Error fetching deliveries from Firestore:', error);
      return DEFAULT_DELIVERIES;
    }
  },

  async getDeliveryById(id: string): Promise<DeliveryData | undefined> {
    try {
      const snap = await getDoc(doc(db, 'deliveries', id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as DeliveryData;
      }
      const list = await this.getDeliveries();
      return list.find(d => d.id === id);
    } catch (error) {
      console.error('Error fetching delivery by ID:', error);
      return DEFAULT_DELIVERIES.find(d => d.id === id);
    }
  },

  async createDelivery(delivery: Omit<DeliveryData, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<DeliveryData> {
    const newId = `delivery-${Date.now()}`;
    const newDelivery: DeliveryData = {
      ...delivery,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'deliveries', newId), newDelivery);
    return newDelivery;
  },

  async updateDelivery(id: string, updates: Partial<DeliveryData>): Promise<DeliveryData | null> {
    try {
      const ref = doc(db, 'deliveries', id);
      const payload = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(ref, payload as any);
      const updated = await getDoc(ref);
      return { id: updated.id, ...updated.data() } as DeliveryData;
    } catch (error) {
      console.error('Error updating delivery:', error);
      return null;
    }
  },

  async deleteDelivery(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'deliveries', id));
      return true;
    } catch (error) {
      console.error('Error deleting delivery:', error);
      return false;
    }
  },

  async assignDriver(deliveryId: string, driverId: string): Promise<DeliveryData | null> {
    return this.updateDelivery(deliveryId, { assignedDriverId: driverId, status: 'assigned' });
  },

  subscribeDeliveries(callback: (deliveries: DeliveryData[]) => void): () => void {
    const q = collection(db, 'deliveries');
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryData));
        if (list.length === 0) {
          ensureDeliveriesSeeded(list);
          callback(DEFAULT_DELIVERIES);
        } else {
          callback(list);
        }
      },
      (error) => {
        console.error('Deliveries snapshot error:', error);
        callback(DEFAULT_DELIVERIES);
      }
    );
  },

  // Driver performance calculations
  getDriverStats(driverId: string, allDeliveries: DeliveryData[] = []): any {
    const driverDeliveries = allDeliveries.filter(d => d.assignedDriverId === driverId);
    const completedJobs = driverDeliveries.filter(d => d.status === 'completed' || d.status === 'delivered').length;
    const cancelledJobs = driverDeliveries.filter(d => d.status === 'cancelled').length;

    return {
      totalJobs: driverDeliveries.length,
      completedJobs,
      cancelledJobs,
      completionRate: driverDeliveries.length > 0
        ? Math.round((completedJobs / driverDeliveries.length) * 100)
        : 0
    };
  },

  // ================= BOOKINGS =================
  async getBookings(): Promise<BookingRequest[]> {
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRequest));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  async createBooking(booking: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>): Promise<BookingRequest> {
    const newId = `booking-${Date.now()}`;
    const newBooking: BookingRequest = {
      ...booking,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'bookings', newId), newBooking);
    return newBooking;
  },

  async updateBookingStatus(id: string, status: 'approved' | 'rejected'): Promise<BookingRequest | null> {
    try {
      const ref = doc(db, 'bookings', id);
      await updateDoc(ref, { status });
      const updated = await getDoc(ref);
      return { id: updated.id, ...updated.data() } as BookingRequest;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return null;
    }
  },

  subscribeBookings(callback: (bookings: BookingRequest[]) => void): () => void {
    const q = collection(db, 'bookings');
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRequest));
        callback(list);
      },
      (error) => {
        console.error('Bookings snapshot error:', error);
        callback([]);
      }
    );
  },

  // ================= MESSAGES =================
  async getMessagesByDelivery(deliveryId: string): Promise<MessageData[]> {
    try {
      const q = query(
        collection(db, 'deliveries', deliveryId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageData));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(message: Omit<MessageData, 'id' | 'timestamp' | 'read'>): Promise<MessageData> {
    const newId = `msg-${Date.now()}`;
    const newMsg: MessageData = {
      ...message,
      id: newId,
      timestamp: new Date().toISOString(),
      read: false
    };
    await setDoc(
      doc(db, 'deliveries', message.deliveryId, 'messages', newId),
      newMsg
    );
    return newMsg;
  },

  subscribeMessages(deliveryId: string, callback: (msgs: MessageData[]) => void): () => void {
    const q = query(
      collection(db, 'deliveries', deliveryId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MessageData));
        callback(list);
      },
      (error) => {
        console.error('Messages snapshot error:', error);
        callback([]);
      }
    );
  },

  // ================= DEALERSHIPS & FORECASTS =================
  getDealerships(): DealershipData[] {
    return [
      {
        id: 'dealer-1',
        name: 'LogiLoad Mumbai Dealership',
        location: 'Nariman Point, Mumbai',
        city: 'Mumbai, Maharashtra',
        contactPerson: 'Rahul Sharma',
        phone: '+91 98765 43210',
        currentStock: [
          { item: 'Steel Coils', qty: 15 },
          { item: 'Auto Parts Box', qty: 45 },
          { item: 'Electronics Crate', qty: 8 }
        ],
        incomingShipments: 2
      },
      {
        id: 'dealer-2',
        name: 'Pune Elite Motors',
        location: 'Hinjawadi Phase 2, Pune',
        city: 'Pune, Maharashtra',
        contactPerson: 'Amit Patel',
        phone: '+91 87654 32109',
        currentStock: [
          { item: 'Steel Coils', qty: 5 },
          { item: 'Auto Parts Box', qty: 120 },
          { item: 'Laptop Box', qty: 30 }
        ],
        incomingShipments: 1
      },
      {
        id: 'dealer-3',
        name: 'South India Logistics Hub',
        location: 'Koramangala 4th Block, Bangalore',
        city: 'Bangalore, Karnataka',
        contactPerson: 'Vikram K.',
        phone: '+91 76543 21098',
        currentStock: [
          { item: 'Electronics Crate', qty: 25 },
          { item: 'Laptop Box', qty: 75 },
          { item: 'Books Carton', qty: 300 }
        ],
        incomingShipments: 0
      }
    ];
  },

  getDemandForecasts(dealershipId?: string): DemandForecast[] {
    const defaultForecasts: DemandForecast[] = [
      {
        id: 'forecast-1',
        dealershipId: 'dealer-1',
        itemName: 'Auto Parts Box',
        historicalAvg: 80,
        predictedDemand: 110,
        confidenceScore: 92,
        reasoning: 'Upcoming automotive plant scaling production in nearby industrial zone.',
        recommendedOrderQty: 30
      },
      {
        id: 'forecast-2',
        dealershipId: 'dealer-1',
        itemName: 'Steel Coils',
        historicalAvg: 12,
        predictedDemand: 10,
        confidenceScore: 85,
        reasoning: 'Seasonal slowdown in heavy metal fabrication projects.',
        recommendedOrderQty: 0
      },
      {
        id: 'forecast-3',
        dealershipId: 'dealer-2',
        itemName: 'Auto Parts Box',
        historicalAvg: 90,
        predictedDemand: 135,
        confidenceScore: 95,
        reasoning: 'Festive season stocking starting early in Pune dealership hub.',
        recommendedOrderQty: 45
      },
      {
        id: 'forecast-4',
        dealershipId: 'dealer-2',
        itemName: 'Laptop Box',
        historicalAvg: 20,
        predictedDemand: 35,
        confidenceScore: 88,
        reasoning: 'Back-to-college sales drive at Hinjawadi IT corporate complexes.',
        recommendedOrderQty: 15
      },
      {
        id: 'forecast-5',
        dealershipId: 'dealer-3',
        itemName: 'Electronics Crate',
        historicalAvg: 30,
        predictedDemand: 50,
        confidenceScore: 90,
        reasoning: 'Increased corporate orders from newly opened tech offices in Bangalore.',
        recommendedOrderQty: 20
      }
    ];

    if (dealershipId) {
      return defaultForecasts.filter(f => f.dealershipId === dealershipId);
    }
    return defaultForecasts;
  },

  getTrackingMilestones(deliveryOrId: DeliveryData | string, allDeliveries: DeliveryData[] = []): TrackingMilestone[] {
    let delivery: DeliveryData | undefined;
    if (typeof deliveryOrId === 'string') {
      delivery = allDeliveries.find(d => d.id === deliveryOrId);
    } else {
      delivery = deliveryOrId;
    }

    if (!delivery) return [];

    const milestones: TrackingMilestone[] = [];
    const createdDate = new Date(delivery.createdAt || Date.now());

    // Milestone 1: Order Registered
    milestones.push({
      title: 'Order Registered',
      time: createdDate.toLocaleString(),
      status: 'completed',
      description: `Shipment order registered for ${delivery.customerName}.`,
      location: delivery.pickupLocation
    });

    if (delivery.status === 'pending') {
      milestones.push({
        title: 'Pending Dispatch',
        time: '--',
        status: 'current',
        description: 'Awaiting admin approval and driver assignment.'
      });
      return milestones;
    }

    // Milestone 2: Driver Assigned / Approved
    const approvedTime = new Date(createdDate.getTime() + 15 * 60 * 1000);
    milestones[0].status = 'completed';
    milestones.push({
      title: 'Approved & Assigned',
      time: approvedTime.toLocaleString(),
      status: delivery.status === 'approved' ? 'current' : 'completed',
      description: 'Shipment request approved and assigned to a delivery vehicle.',
      location: delivery.pickupLocation
    });

    if (delivery.status === 'approved') {
      milestones.push({
        title: 'Vehicle Dispatched',
        time: '--',
        status: 'upcoming',
        description: 'Driver is heading to the pickup location.'
      });
      return milestones;
    }

    // Milestone 3: Picked Up / Loaded
    const pickupTime = new Date(approvedTime.getTime() + 45 * 60 * 1000);
    milestones[1].status = 'completed';
    milestones.push({
      title: 'Cargo Loaded',
      time: pickupTime.toLocaleString(),
      status: ['in-progress', 'on-the-way', 'loaded', 'picked-up'].includes(delivery.status)
        ? 'current'
        : (delivery.status === 'completed' || delivery.status === 'delivered' ? 'completed' : 'upcoming'),
      description: 'Cargo verified, volume packed, and vehicle loaded.',
      location: delivery.pickupLocation,
      temperature: 22.4,
      humidity: 55
    });

    if (['in-progress', 'on-the-way', 'loaded', 'picked-up'].includes(delivery.status)) {
      milestones.push({
        title: 'In Transit',
        time: 'Active',
        status: 'current',
        description: 'Vehicle is currently on route to destination stop.',
        location: 'En-Route (India Highways)',
        temperature: 24.2,
        humidity: 50
      });
      milestones.push({
        title: 'Out for Delivery',
        time: 'Estimated soon',
        status: 'upcoming',
        description: `Delivering to ${delivery.dropLocation}`
      });
      return milestones;
    }

    // Milestone 4: Delivered
    if (delivery.status === 'completed' || delivery.status === 'delivered') {
      const deliveredTime = new Date(pickupTime.getTime() + 3.5 * 60 * 60 * 1000);
      milestones[2].status = 'completed';
      milestones.push({
        title: 'In Transit',
        time: deliveredTime.toLocaleString(),
        status: 'completed',
        description: 'Cargo successfully transported.',
        location: 'National Highway Network'
      });
      milestones.push({
        title: 'Delivered',
        time: deliveredTime.toLocaleString(),
        status: 'completed',
        description: 'Shipment delivered and handed over to dealer / customer.',
        location: delivery.dropLocation
      });
    }

    return milestones;
  }
};
