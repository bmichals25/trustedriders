export type RideStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
}

export interface Ride {
  id: string;
  status: RideStatus;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledTime: string;
  actualPickupTime?: string;
  actualDropoffTime?: string;
  driverId: string;
  chaperoneId?: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  notes?: string;
  vehicleInfo?: VehicleInfo;
}

export type DriverStatus = "available" | "on-ride" | "off-duty";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleInfo: VehicleInfo;
  status: DriverStatus;
  currentRideId?: string;
}

export type ChaperoneStatus = "available" | "on-ride" | "off-duty";

export interface Chaperone {
  id: string;
  name: string;
  phone: string;
  email: string;
  certifications: string[];
  status: ChaperoneStatus;
  currentRideId?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  emergencyContact: EmergencyContact;
  medicalNotes?: string;
  address: string;
}
