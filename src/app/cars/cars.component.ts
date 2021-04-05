import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';

import { Car } from "app/interfaces/car.intf";

import { CarService } from 'app/services/car.service';

import { BodyType } from "app/enums/body-type.enum";
import { DriveWheelConfiguration } from "app/enums/drive-wheel-configuration.enum";
import { FuelType } from "app/enums/fuel-type.enum";
import { Transmission } from "app/enums/transmission.enum";
import { EmissionStandard } from "app/enums/emission-standard.enum";
import { PairWiseResult } from "app/enums/pairwise-result.enum";

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss']
})
export class CarsComponent implements OnInit {

  displayedColumns: string[] = ["name", "performanceScore", "environmentScore", "capacityScore", "overallScore"];
  private cars: Car[] = [];
  sortedData: Car[] = [];
  performance!: number;
  environment!: number;
  capacity!: number;

  uqBodyType!: string[];
  uqDriveWheelConfiguration!: string[];
  uqTransmission!: string[];
  uqFuelType!: string[];
  uqEmissionStandard!: string[];
  minProductionYear: number = 0;
  maxProductionYear: number = 0;

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.loadCars();
  }

  private loadCars(): void{
    this.cars = [];
    this.carService.getCars().subscribe(c => {
      this.cars = c;
      this.sortData('name','asc');

      this.uqBodyType = [...new Set(c.map(r => BodyType[r.bodyType]))].filter(r => !!r);
      this.uqDriveWheelConfiguration = [...new Set(c.map(r => DriveWheelConfiguration[r.driveWheelConfiguration]))].filter(r => !!r);
      this.uqTransmission = [...new Set(c.map(r => Transmission[r.transmission]))].filter(r => !!r);
      this.uqFuelType = [...new Set(c.map(r => FuelType[r.fuelType]))].filter(r => !!r);
      this.uqEmissionStandard = [...new Set(c.map(r => EmissionStandard[r.meetsEmissionStandard]))].filter(r => !!r);

      this.minProductionYear = Math.min.apply(Math, c.map(function(o) { return o.productionDate || 99999; }))
      this.maxProductionYear = Math.max.apply(Math, c.map(function(o) { return o.productionDate || 0; }))
    });
  }

  //private compareCars(car1: Car, car2: Car, group: string, criteria: string, minmax: bool)

  generateClick(): void{
    this.performance = this.performance || 0;
    this.environment = this.environment || 0;
    this.capacity = this.capacity || 0;

    let sum = this.performance + this.environment + this.capacity;
    if (sum == 0)
      return;

    this.sortedData = [];

    //todo: need a normal proportion calc, so sum is always 100
    this.performance = Math.round(this.performance / sum * 100);
    this.environment = Math.round(this.environment / sum * 100);
    this.capacity = Math.round(this.capacity / sum * 100);
    sum = this.performance + this.environment + this.capacity - 100;
    if (sum != 0)
    {
      this.capacity -= sum;
    }

    //console.log(`perf ${this.performance}`);
    //console.log(`env ${this.environment}`);
    //console.log(`cap ${this.capacity}`);
    this.cars.forEach(r => {
      r.capacityScore = 0;
      r.performanceScore = 0;
      r.environmentScore = 0;
      r.overallScore = 0;
    })

    //fill pairwise comparison //76,449,000 comparisons ((3000^2/2 - 3000) * 17)
    var t0 = performance.now();
    let res = 0.00;
    for (let i = 0; i < this.cars.length; i++)
    {
      for (let j = i + 1; j < this.cars.length; j++)
      {
        //capacity
        res = compareRank(this.cars[i].height, this.cars[j].height) * 0.1 +
          compareRank(this.cars[i].width, this.cars[j].width) * 0.03 +
          compareRank(this.cars[i].wheelbase, this.cars[j].wheelbase) * 0.01 +
          compareRank(this.cars[i].weight, this.cars[j].weight) * 0.01 +
          compareRank(this.cars[i].numberOfDoors, this.cars[j].numberOfDoors) * 0.05 +
          compareRank(this.cars[i].seatingCapacity, this.cars[j].seatingCapacity) * 0.3 +
          compareRank(this.cars[i].cargoVolume, this.cars[j].cargoVolume) * 0.5;
        //result for car1
        this.cars[i].capacityScore += res;
        //reverse result for car2
        this.cars[j].capacityScore += PairWiseResult.Win - res;

        //performance
        //if any of cars is electric, then compare only by acc.time and speed
        if (this.cars[i].fuelType == FuelType.Electric || this.cars[j].fuelType == FuelType.Electric)
          res = compareRank(this.cars[i].accelerationTime, this.cars[j].accelerationTime, true) * 0.9 +
            compareRank(this.cars[i].speed, this.cars[j].speed) * 0.1;
        else
          res = compareRank(this.cars[i].numberOfForwardGears, this.cars[j].numberOfForwardGears) * 0.01 +
            compareRank(this.cars[i].accelerationTime, this.cars[j].accelerationTime, true) * 0.5 +
            compareRank(this.cars[i].speed, this.cars[j].speed) * 0.04 +
            compareRank(this.cars[i].engineDisplacement, this.cars[j].engineDisplacement) * 0.1 +
            compareRank(this.cars[i].enginePower, this.cars[j].enginePower) * 0.25 +
            compareRank(this.cars[i].torque, this.cars[j].torque) * 0.1;
        //result for car1
        this.cars[i].performanceScore += res;
        //reverse result for car2
        this.cars[j].performanceScore += PairWiseResult.Win - res;

        //environment
        //if any of cars is electric, then compare onyle fuel type and prod.year
        if (this.cars[i].fuelType == FuelType.Electric || this.cars[j].fuelType == FuelType.Electric)
          res = compareFuel(this.cars[i].fuelType, this.cars[j].fuelType) * 0.8 +
            compareRank(this.cars[i].productionDate, this.cars[j].productionDate) * 0.2;
        else
          res = compareFuel(this.cars[i].fuelType, this.cars[j].fuelType) * 0.3 +
            compareRank(this.cars[i].fuelCapacity, this.cars[j].fuelCapacity) * 0.05 +
            compareRank(this.cars[i].fuelConsumption, this.cars[j].fuelConsumption, true) * 0.15 +
            compareRank(this.cars[i].emissionsCO2, this.cars[j].emissionsCO2, true) * 0.3 +
            compareRank(this.cars[i].meetsEmissionStandard, this.cars[j].meetsEmissionStandard, false) * 0.1 +
            compareRank(this.cars[i].productionDate, this.cars[j].productionDate) * 0.1;
        //result for car1
        this.cars[i].environmentScore += res;
        //reverse result for car2
        this.cars[j].environmentScore += PairWiseResult.Win - res;

        //overall
        this.cars[i].overallScore =
          this.cars[i].capacityScore * this.capacity/100 +
          this.cars[i].performanceScore * this.performance/100 +
          this.cars[i].environmentScore * this.environment/100;
        this.cars[j].overallScore =
          this.cars[j].capacityScore * this.capacity/100 +
          this.cars[j].performanceScore * this.performance/100 +
          this.cars[j].environmentScore * this.environment/100;
      }
    }
    var t1 = performance.now();
    console.log("pairwise comparison took " + (t1 - t0) + " ms.");

    this.sortData('overallScore','desc');
  }

  sortData(field:string, direction:string) {
    const data = this.cars.slice();
    if (!field || direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = direction === 'asc';
      switch (field) {
        case 'name': return compareSort(a.name, b.name, isAsc);
        case 'capacityScore': return compareSort(a.capacityScore, b.capacityScore, isAsc);
        case 'performanceScore': return compareSort(a.performanceScore, b.performanceScore, isAsc);
        case 'environmentScore': return compareSort(a.environmentScore, b.environmentScore, isAsc);
        case 'overallScore': return compareSort(a.overallScore, b.overallScore, isAsc);
        default: return 0;
      }
    });
  }

}

function compareSort(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function compareRank(a: number, b:number, isMinBetter: boolean = false)
{
  const ifnull = isMinBetter ? 99999 : 0;
  a = a||ifnull;
  b = b||ifnull;
  if (isMinBetter && (a < b))
    return PairWiseResult.Win;
  else if (!isMinBetter && (a > b))
    return PairWiseResult.Win;
  else if (a == b)
    return PairWiseResult.Draw;
  else
    return PairWiseResult.Lose;
}

function compareFuel(a: FuelType, b: FuelType)
{
  const FuelPriority = (f:FuelType) =>
    f == FuelType.PetrolE85 ? 4 :
    f == FuelType.Electric ? 3 :
    f == FuelType.PetrolLPG ? 3 :
    f == FuelType.PetrolCNG ? 3 :
    f == FuelType.PetrolHybrid ? 2 :
    f == FuelType.DieselHybrid ? 2 :
    f == FuelType.Petrol ? 1 :
    f == FuelType.Diesel ? 1 : 0;
  return compareRank(FuelPriority(a), FuelPriority(b));
}
