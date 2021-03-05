export interface ICar{
  brand: string;
  manufacturer: string;
  name: string;
  productionDate: number; //year
  vehicleConfiguration: string;

  image: string;
  outerLink: string;
  description: string;

  bodyType: string;
  height: number; //centimeters
  width: number; //centimeters
  wheelbase: number; //centimeters
  weight: number; //kg
  numberOfDoors: number;
  seatingCapacity: number;
  cargoVolume: number; //litres

  driveWheelConfiguration: string;
  vehicleTransmission: string;
  numberOfForwardGears: number;
  accelerationTime: number; //seconds
  speed: number; //hm/h
  engineDisplacement: number; //qubic centimeters
  enginePower: number; //HP
  torque: number; //Nm

  fuelType: string;
  fuelCapacity: number; //litres
  fuelConsumption: number; //litres/100km

  emissionsCO2: number; //g/km
  meetsEmissionStandard: string;
}
