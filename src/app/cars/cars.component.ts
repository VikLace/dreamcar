import { Component, OnInit } from '@angular/core';

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
  cars: Car[] = [];
  performance!: number;
  environment!: number;
  capacity!: number;

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.loadCars();
  }

  private loadCars(): void{
    this.cars = [];
    this.carService.getCars().subscribe(c => this.cars = c);
  }

  //private compareCars(car1: Car, car2: Car, group: string, criteria: string, minmax: bool)

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
        res =
          ((this.cars[i].height||0) > (this.cars[j].height||0) ? PairWiseResult.Win :
          (this.cars[i].height||0) == (this.cars[j].height||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].width||0) > (this.cars[j].width||0) ? PairWiseResult.Win :
          (this.cars[i].width||0) == (this.cars[j].width||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].wheelbase||0) > (this.cars[j].wheelbase||0) ? PairWiseResult.Win :
          (this.cars[i].wheelbase||0) == (this.cars[j].wheelbase||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].weight||0) > (this.cars[j].weight||0) ? PairWiseResult.Win :
          (this.cars[i].weight||0) == (this.cars[j].weight||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].numberOfDoors||0) > (this.cars[j].numberOfDoors||0) ? PairWiseResult.Win :
          (this.cars[i].numberOfDoors||0) == (this.cars[j].numberOfDoors||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].seatingCapacity||0) > (this.cars[j].seatingCapacity||0) ? PairWiseResult.Win :
          (this.cars[i].seatingCapacity||0) == (this.cars[j].seatingCapacity||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].cargoVolume||0) > (this.cars[j].cargoVolume||0) ? PairWiseResult.Win :
          (this.cars[i].cargoVolume||0) == (this.cars[j].cargoVolume||0) ? PairWiseResult.Draw : PairWiseResult.Lose);
        //result for car1
        this.cars[i].capacityScore += res;
        //reverse result for car2
        this.cars[j].capacityScore += 7*PairWiseResult.Win - res;

        //performance
        res =
          ((this.cars[i].numberOfForwardGears||0) > (this.cars[j].numberOfForwardGears||0) ? PairWiseResult.Win :
          (this.cars[i].numberOfForwardGears||0) == (this.cars[j].numberOfForwardGears||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].accelerationTime||999) < (this.cars[j].accelerationTime||999) ? PairWiseResult.Win :
          (this.cars[i].accelerationTime||999) == (this.cars[j].accelerationTime||999) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].speed||0) > (this.cars[j].speed||0) ? PairWiseResult.Win :
          (this.cars[i].speed||0) == (this.cars[j].speed||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].engineDisplacement||0) > (this.cars[j].engineDisplacement||0) ? PairWiseResult.Win :
          (this.cars[i].engineDisplacement||0) == (this.cars[j].engineDisplacement||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].enginePower||0) > (this.cars[j].enginePower||0) ? PairWiseResult.Win :
          (this.cars[i].enginePower||0) == (this.cars[j].enginePower||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].torque||0) > (this.cars[j].torque||0) ? PairWiseResult.Win :
          (this.cars[i].torque||0) == (this.cars[j].torque||0) ? PairWiseResult.Draw : PairWiseResult.Lose);
        //result for car1
        this.cars[i].performanceScore += res;
        //reverse result for car2
        this.cars[j].performanceScore += 6*PairWiseResult.Win - res;

        //environment
        res =
          ((this.cars[i].fuelCapacity||0) > (this.cars[j].fuelCapacity||0) ? PairWiseResult.Win :
          (this.cars[i].fuelCapacity||0) == (this.cars[j].fuelCapacity||0) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].fuelConsumption||999) < (this.cars[j].fuelConsumption||999) ? PairWiseResult.Win :
          (this.cars[i].fuelConsumption||999) == (this.cars[j].fuelConsumption||999) ? PairWiseResult.Draw : PairWiseResult.Lose)
          +
          ((this.cars[i].emissionsCO2||999) < (this.cars[j].emissionsCO2||999) ? PairWiseResult.Win :
          (this.cars[i].emissionsCO2||999) == (this.cars[j].emissionsCO2||999) ? PairWiseResult.Draw : PairWiseResult.Lose)
          /*+
          ((this.cars[i].meetsEmissionStandard||0) > (this.cars[j].meetsEmissionStandard||0) ? PairWiseResult.Win :
          (this.cars[i].meetsEmissionStandard||0) == (this.cars[j].meetsEmissionStandard||0) ? PairWiseResult.Draw : PairWiseResult.Lose)*/;
        //result for car1
        this.cars[i].environmentScore += res;
        //reverse result for car2
        this.cars[j].environmentScore += 3*PairWiseResult.Win - res;

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

    console.log(this.cars);
  }

}
