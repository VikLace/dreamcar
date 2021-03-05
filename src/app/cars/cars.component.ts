import { Component, OnInit } from '@angular/core';
import { Car } from "../interfaces/car.intf";
import { BodyType } from "../enums/body-type.enum";
import { DriveWheelConfiguration } from "../enums/drive-wheel-configuration.enum";
import { FuelType } from "../enums/fuel-type.enum";
import { Transmission } from "../enums/transmission.enum";

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss']
})
export class CarsComponent implements OnInit {

  car: Car = {
    accelerationTime: 7.3,
    bodyType: BodyType.Coupe,
    brand:"BMW",
    cargoVolume:445,
    description:"420d Aut Specs:Power 184 PS (181 hp); Diesel;Average consumption:4.6 l/100km (51 MPG);Dimensions: Length:463.8 cm (182.6 inches); Width:182.5 cm (71.85 inches);Height:136.2 cm (53.62 inches);Weight:1540 kg (3395 lbs);Model Years 2013,2014,2015",
    driveWheelConfiguration: DriveWheelConfiguration.Rear,
    emissionsCO2:121,
    fuelCapacity:57,
    fuelConsumption:4.6,
    fuelType: FuelType.Diesel,
    height:136.2,
    image:"www.ultimatespecs.com/cargallery/11/6817/w400_BMW-F32-4-Series-Coupe-2.jpg", // TODO: doesnt work, need local
    outerLink:"https://www.ultimatespecs.com/car-specs/BMW/66857/BMW-F32-4-Series-Coupe-420d-Aut.html",
    manufacturer:"BMW",
    meetsEmissionStandard:"Euro VI",
    name:"BMW F32 4 Series Coupe 420d Aut",
    numberOfDoors:2,
    numberOfForwardGears:8,
    productionDate:2013,
    speed:232,
    vehicleConfiguration:"420d Aut",
    engineDisplacement:1995,
    enginePower:184,
    torque:380,
    seatingCapacity:4,
    transmission: Transmission.Automatic,
    weight:1540,
    wheelbase:281.0,
    width:182.5
  }

  constructor() { }

  ngOnInit(): void {
  }

}
