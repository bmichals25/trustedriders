export type RideStatus =
  | 'scheduled'
  | 'en-route'
  | 'picked-up'
  | 'in-transit'
  | 'arrived'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export type DriverStatus = 'available' | 'on-ride' | 'off-duty'
export type ChaperoneStatus = 'available' | 'on-ride' | 'off-duty'

export interface NEMTDriver {
  id: string
  name: string
  phone: string
  email: string
  vehicle: string
  licensePlate: string
  status: DriverStatus
  currentRideId?: string
  ridesTotal: number
  onTimeRate: number
  nextRideTime?: string
}

export interface NEMTChaperone {
  id: string
  name: string
  phone: string
  email: string
  status: ChaperoneStatus
  currentRideId?: string
  certifications: string[]
  ridesTotal: number
}

export interface Passenger {
  id: string
  name: string
  phone: string
  dob?: string
  medicalNotes?: string
  accessibilityNeeds?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface NEMTRide {
  id: string
  confirmationNumber: string
  status: RideStatus
  scheduledTime: string
  actualPickupTime?: string
  actualArrivalTime?: string
  passenger: Passenger
  pickupAddress: string
  dropoffAddress: string
  driver?: NEMTDriver
  chaperone?: NEMTChaperone
  eta?: string
  notes?: string
  timeline: RideTimelineEvent[]
}

export interface RideTimelineEvent {
  id: string
  status: RideStatus | string
  label: string
  timestamp?: string
  note?: string
  changedBy?: string
}

export interface DashboardStats {
  totalRidesToday: number
  activeRides: number
  availableDrivers: number
  availableChaperones: number
  onTimeRate: number
  driversOnDuty: number
  chaperonesOnDuty: number
}
