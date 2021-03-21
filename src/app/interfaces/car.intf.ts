import { BodyType } from "app/enums/body-type.enum";
import { DriveWheelConfiguration } from "app/enums/drive-wheel-configuration.enum";
import { FuelType } from "app/enums/fuel-type.enum";
import { Transmission } from "app/enums/transmission.enum";

export interface Car{
  id: number;
  brand: string;
  name: string;
  productionDate: number; //year
  image: string;

  bodyType: string;//BodyType;
  height: number; //centimeters
  width: number; //centimeters
  wheelbase: number; //centimeters
  weight: number; //kg
  numberOfDoors: number;
  seatingCapacity: number;
  cargoVolume: number; //litres

  driveWheelConfiguration: string;//DriveWheelConfiguration;
  transmission: string;//Transmission;
  numberOfForwardGears: number;
  accelerationTime: number; //seconds
  speed: number; //hm/h
  engineDisplacement: number; //qubic centimeters
  enginePower: number; //HP
  torque: number; //Nm

  fuelType: string;//FuelType;
  fuelCapacity: number; //litres
  fuelConsumption: number; //litres/100km
  emissionsCO2: number; //g/km
  meetsEmissionStandard: string;

  performanceScore: number;
  environmentScore: number;
  capacityScore: number;
  overallScore: number;
}
