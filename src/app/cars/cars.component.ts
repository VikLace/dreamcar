import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Car } from "app/interfaces/car.intf";
import { CarService } from 'app/services/car.service';

import { FuelType } from "app/enums/fuel-type.enum";
import { PairWiseResult } from "app/enums/pairwise-result.enum";

import { EnumFilter } from "app/filters/enum-filter";
import { BodyTypeFilter } from "app/filters/body-type-filter";
import { TransmissionFilter } from "app/filters/transmission-filter";
import { DriveWheelConfigurationFilter } from "app/filters/drive-wheel-configuration-filter";
import { FuelTypeFilter } from "app/filters/fuel-type-filter";
import { EmissionStandardFilter } from "app/filters/emission-standard-filter";

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss']
})
export class CarsComponent implements AfterViewInit {

  carsDataSource: MatTableDataSource<Car>;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ["name", "performanceScore", "environmentScore", "capacityScore", "overallScore"];

  performance!: number;
  environment!: number;
  capacity!: number;

  enumFilters: EnumFilter<any>[] = [];

  /*minProductionYear: number = 0;
  maxProductionYear: number = 0;*/

  constructor(private carService: CarService)
  {
      this.enumFilters.push(new BodyTypeFilter("bodyType"));
      this.enumFilters.push(new TransmissionFilter("transmission"));
      this.enumFilters.push(new DriveWheelConfigurationFilter("driveWheelConfiguration"));
      this.enumFilters.push(new FuelTypeFilter("fuelType"));
      this.enumFilters.push(new EmissionStandardFilter("meetsEmissionStandard"));

      this.carsDataSource = new MatTableDataSource<Car>();
      this.carsDataSource.filterPredicate = (car: Car, filter: string) =>
        {
          let filters = filter.split(";");
          for (let i = 0; i < filters.length; i++) {
            const f = filters[i];
            let tmp = f.split("=");
            let fieldName = tmp[0] as keyof typeof car;
            if (!car.hasOwnProperty(fieldName))
              return false;
            let values = tmp[1].split(",").map(x => +x);
            if (!values.includes(car[fieldName] as number))
              return false;
          }
          return true;
        };
  }

  ngAfterViewInit()
  {
    this.loadCars();
  }

  private loadCars(): void
  {
    this.carService.getCars().subscribe(c => {
      this.carsDataSource.data = c;
      this.carsDataSource.sort = this.sort;

      /*this.minProductionYear = Math.min.apply(Math, c.map(function(o) { return o.productionDate || 99999; }))
      this.maxProductionYear = Math.max.apply(Math, c.map(function(o) { return o.productionDate || 0; }))*/
    });
  }

  filterChanged(): void{
    this.carsDataSource.filter = this.enumFilters.map(f => f.getFilter()).filter(Boolean).join(';');
    this.clearScoring();
  }

  private clearScoring()
  {
    this.carsDataSource.data.forEach(r => {
      r.capacityScore = 0;
      r.performanceScore = 0;
      r.environmentScore = 0;
      r.overallScore = 0;
    });
  }

  generateClick(): void{
    this.performance = this.performance || 0;
    this.environment = this.environment || 0;
    this.capacity = this.capacity || 0;

    let sum = this.performance + this.environment + this.capacity;
    if (sum == 0)
      return;

    //todo: need a normal proportion calc, so sum is always 100
    this.performance = Math.round(this.performance / sum * 100);
    this.environment = Math.round(this.environment / sum * 100);
    this.capacity = Math.round(this.capacity / sum * 100);
    sum = this.performance + this.environment + this.capacity - 100;
    if (sum != 0)
    {
      this.capacity -= sum;
    }

    this.clearScoring();

    //fill pairwise comparison
    var t0 = performance.now();
    let res = 0.00;
    let cars = this.carsDataSource.filteredData;
    for (let i = 0; i < cars.length; i++)
    {
      for (let j = i + 1; j < cars.length; j++)
      {
        //capacity
        res = compareRank(cars[i].height, cars[j].height) * 0.1 +
          compareRank(cars[i].width, cars[j].width) * 0.03 +
          compareRank(cars[i].wheelbase, cars[j].wheelbase) * 0.01 +
          compareRank(cars[i].weight, cars[j].weight) * 0.01 +
          compareRank(cars[i].numberOfDoors, cars[j].numberOfDoors) * 0.05 +
          compareRank(cars[i].seatingCapacity, cars[j].seatingCapacity) * 0.3 +
          compareRank(cars[i].cargoVolume, cars[j].cargoVolume) * 0.5;
        //result for car1
        cars[i].capacityScore += res;
        //reverse result for car2
        cars[j].capacityScore += PairWiseResult.Win - res;

        //performance
        //if any of cars is electric, then compare only by acc.time and speed
        if (cars[i].fuelType == FuelType.Electric || cars[j].fuelType == FuelType.Electric)
          res = compareRank(cars[i].accelerationTime, cars[j].accelerationTime, true) * 0.9 +
            compareRank(cars[i].speed, cars[j].speed) * 0.1;
        else
          res = compareRank(cars[i].numberOfForwardGears, cars[j].numberOfForwardGears) * 0.01 +
            compareRank(cars[i].accelerationTime, cars[j].accelerationTime, true) * 0.5 +
            compareRank(cars[i].speed, cars[j].speed) * 0.04 +
            compareRank(cars[i].engineDisplacement, cars[j].engineDisplacement) * 0.1 +
            compareRank(cars[i].enginePower, cars[j].enginePower) * 0.25 +
            compareRank(cars[i].torque, cars[j].torque) * 0.1;
        //result for car1
        cars[i].performanceScore += res;
        //reverse result for car2
        cars[j].performanceScore += PairWiseResult.Win - res;

        //environment
        //if any of cars is electric, then compare onyle fuel type and prod.year
        if (cars[i].fuelType == FuelType.Electric || cars[j].fuelType == FuelType.Electric)
          res = compareFuel(cars[i].fuelType, cars[j].fuelType) * 0.8 +
            compareRank(cars[i].productionDate, cars[j].productionDate) * 0.2;
        else
          res = compareFuel(cars[i].fuelType, cars[j].fuelType) * 0.3 +
            compareRank(cars[i].fuelCapacity, cars[j].fuelCapacity) * 0.05 +
            compareRank(cars[i].fuelConsumption, cars[j].fuelConsumption, true) * 0.15 +
            compareRank(cars[i].emissionsCO2, cars[j].emissionsCO2, true) * 0.3 +
            compareRank(cars[i].meetsEmissionStandard, cars[j].meetsEmissionStandard, false) * 0.1 +
            compareRank(cars[i].productionDate, cars[j].productionDate) * 0.1;
        //result for car1
        cars[i].environmentScore += res;
        //reverse result for car2
        cars[j].environmentScore += PairWiseResult.Win - res;

        //overall
        cars[i].overallScore =
          cars[i].capacityScore * this.capacity/100 +
          cars[i].performanceScore * this.performance/100 +
          cars[i].environmentScore * this.environment/100;
        cars[j].overallScore =
          cars[j].capacityScore * this.capacity/100 +
          cars[j].performanceScore * this.performance/100 +
          cars[j].environmentScore * this.environment/100;
      }
    }
    var t1 = performance.now();
    console.log("pairwise comparison took " + (t1 - t0) + " ms.");

    this.sort.active = "overallScore";
    this.sort.direction = "desc";
    this.sort.sortChange.emit();
  }
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
