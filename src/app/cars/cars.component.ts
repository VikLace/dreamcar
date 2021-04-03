import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';

import { Car } from "app/interfaces/car.intf";

import { CarService } from 'app/services/car.service';

import { BodyType } from "app/enums/body-type.enum";
import { DriveWheelConfiguration } from "app/enums/drive-wheel-configuration.enum";
import { FuelType } from "app/enums/fuel-type.enum";
import { Transmission } from "app/enums/transmission.enum";
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

  private uqBodyType: string[] = [];
  private uqDriveWheelConfiguration: string[] = [];
  private uqTransmission: string[] = [];
  private uqFuelType: string[] = [];
  private minProductionYear: number = 0;
  private maxProductionYear: number = 0;

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.loadCars();
  }

  private loadCars(): void{
    this.cars = [];
    this.carService.getCars().subscribe(c => {
      this.cars = c;
      this.sortData('name','asc');
      this.uqBodyType = [...new Set(c.map(r => r.bodyType))].filter(r => !!r);
      this.uqDriveWheelConfiguration = [...new Set(c.map(r => r.driveWheelConfiguration))].filter(r => !!r);
      this.uqTransmission = [...new Set(c.map(r => r.transmission))].filter(r => !!r);
      this.uqFuelType = [...new Set(c.map(r => r.fuelType))].filter(r => !!r);
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

    //fill pairwise comparison //76,449,000 comparisons ((3000^2/2 - 3000) * 17)
    var t0 = performance.now();
    let res = 0;
    for (let i = 0; i < this.cars.length; i++)
    {
      this.cars[i].performanceScore = this.cars[i].performanceScore || 0;
      this.cars[i].environmentScore = this.cars[i].environmentScore || 0;
      this.cars[i].capacityScore = this.cars[i].capacityScore || 0;
      this.cars[i].overallScore = this.cars[i].overallScore || 0;

      for (let j = i + 1; j < this.cars.length; j++)
      {
        this.cars[j].performanceScore = this.cars[j].performanceScore || 0;
        this.cars[j].environmentScore = this.cars[j].environmentScore || 0;
        this.cars[j].capacityScore = this.cars[j].capacityScore || 0;
        this.cars[j].overallScore = this.cars[j].overallScore || 0;

        //capacity
        res = compareRank(this.cars[i].height, this.cars[j].height) +
          compareRank(this.cars[i].width, this.cars[j].width) +
          compareRank(this.cars[i].wheelbase, this.cars[j].wheelbase) +
          compareRank(this.cars[i].weight, this.cars[j].weight) +
          compareRank(this.cars[i].numberOfDoors, this.cars[j].numberOfDoors) +
          compareRank(this.cars[i].seatingCapacity, this.cars[j].seatingCapacity) +
          compareRank(this.cars[i].cargoVolume, this.cars[j].cargoVolume,);
        //result for car1
        this.cars[i].capacityScore += res;
        //reverse result for car2
        this.cars[j].capacityScore += 7 * PairWiseResult.Win - res;

        //performance
        res = compareRank(this.cars[i].numberOfForwardGears, this.cars[j].numberOfForwardGears) +
          compareRank(this.cars[i].accelerationTime, this.cars[j].accelerationTime, true) +
          compareRank(this.cars[i].speed, this.cars[j].speed) +
          compareRank(this.cars[i].engineDisplacement, this.cars[j].engineDisplacement) +
          compareRank(this.cars[i].enginePower, this.cars[j].enginePower) +
          compareRank(this.cars[i].torque, this.cars[j].torque);
        //result for car1
        this.cars[i].performanceScore += res;
        //reverse result for car2
        this.cars[j].performanceScore += 6 * PairWiseResult.Win - res;

        //environment
        res = compareRank(this.cars[i].fuelCapacity, this.cars[j].fuelCapacity) +
          compareRank(this.cars[i].fuelConsumption, this.cars[j].fuelConsumption, true) +
          compareRank(this.cars[i].emissionsCO2, this.cars[j].emissionsCO2, true) /*+
          compareRank(this.cars[i].meetsEmissionStandard, this.cars[j].meetsEmissionStandard, false)*/;
        //result for car1
        this.cars[i].environmentScore += res;
        //reverse result for car2
        this.cars[j].environmentScore += 3 * PairWiseResult.Win - res;

        //overall
        this.cars[i].overallScore = Math.round(
          this.cars[i].capacityScore * this.capacity/100 +
          this.cars[i].performanceScore * this.performance/100 +
          this.cars[i].environmentScore * this.environment/100);
        this.cars[j].overallScore = Math.round(
          this.cars[j].capacityScore * this.capacity/100 +
          this.cars[j].performanceScore * this.performance/100 +
          this.cars[j].environmentScore * this.environment/100);
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
  if ((isMinBetter && a < b) || (a > b))
    return PairWiseResult.Win;
  else if (a == b)
    return PairWiseResult.Draw;
  else
    return PairWiseResult.Lose;
}
