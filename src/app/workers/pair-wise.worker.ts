import { DoWork, runWorker } from 'observable-webworker';
import { Observable } from 'rxjs';
import { bufferCount, first } from 'rxjs/operators';

import { Car } from "app/interfaces/car.intf";
import { FuelType } from "app/enums/fuel-type.enum";
import { PairWiseResult } from "app/enums/pairwise-result.enum";

export class PairWiseWorker implements DoWork<Car[], Car[]>
{
  public work(input: Observable<Car[]>): Observable<Car[]>
  {
    return input.pipe(first(),compare(),bufferCount(50)); //emit every 50 cars
  }
}

const compare = () => (source: Observable<Car[]>) =>
  new Observable<Car>(observer =>
  {
    return source.subscribe({
      next(cars)
      {
        //E(n-1) comparisons
        for (let i = 0; i < cars.length; i++)
        {
          for (let j = i + 1; j < cars.length; j++)
          {
            compareCapacity(cars[i], cars[j]);
            comparePerformance(cars[i], cars[j]);
            compareEnvironment(cars[i], cars[j]);
          }
          //result normalization
          cars[i].capacityScore = cars[i].capacityScore / ((cars.length - 1) * PairWiseResult.Win);
          cars[i].performanceScore = cars[i].performanceScore / ((cars.length - 1) * PairWiseResult.Win);
          cars[i].environmentScore = cars[i].environmentScore / ((cars.length - 1) * PairWiseResult.Win);
          observer.next(cars[i]); //emit every fully calculated car
        }
      },
      error(err)
      {
        observer.error(err);
      },
      complete()
      {
        observer.complete();
      }
    });
  });

function compareCapacity(thisCar: Car, otherCar: Car)
{
  let res = compareRank(thisCar.height, otherCar.height) * 0.1 +
    compareRank(thisCar.width, otherCar.width) * 0.03 +
    compareRank(thisCar.wheelbase, otherCar.wheelbase) * 0.01 +
    compareRank(thisCar.weight, otherCar.weight) * 0.01 +
    compareRank(thisCar.numberOfDoors, otherCar.numberOfDoors) * 0.05 +
    compareRank(thisCar.seatingCapacity, otherCar.seatingCapacity) * 0.3 +
    compareRank(thisCar.cargoVolume, otherCar.cargoVolume) * 0.5;
  thisCar.capacityScore += res;
  otherCar.capacityScore += PairWiseResult.Win - res;
}

function comparePerformance(thisCar: Car, otherCar: Car)
{
  //if any of cars is electric, then compare only by acc.time and speed
  if (thisCar.fuelType == FuelType.Electric || otherCar.fuelType == FuelType.Electric)
    var res = compareRank(thisCar.accelerationTime, otherCar.accelerationTime, true) * 0.7 +
      compareRank(thisCar.speed, otherCar.speed) * 0.3;
  else
    var res = compareRank(thisCar.numberOfForwardGears, otherCar.numberOfForwardGears) * 0.01 +
      compareRank(thisCar.accelerationTime, otherCar.accelerationTime, true) * 0.5 +
      compareRank(thisCar.speed, otherCar.speed) * 0.04 +
      compareRank(thisCar.engineDisplacement, otherCar.engineDisplacement) * 0.1 +
      compareRank(thisCar.enginePower, otherCar.enginePower) * 0.25 +
      compareRank(thisCar.torque, otherCar.torque) * 0.1;
  thisCar.performanceScore += res;
  otherCar.performanceScore += PairWiseResult.Win - res;
}

function compareEnvironment(thisCar: Car, otherCar: Car)
{
  //if any of cars is electric, then compare onyle fuel type and prod.year
  if (thisCar.fuelType == FuelType.Electric || otherCar.fuelType == FuelType.Electric)
    var res = compareFuel(thisCar.fuelType, otherCar.fuelType) * 0.8 +
      compareRank(thisCar.productionDate, otherCar.productionDate) * 0.2;
  else
    var res = compareFuel(thisCar.fuelType, otherCar.fuelType) * 0.3 +
      compareRank(thisCar.fuelCapacity, otherCar.fuelCapacity) * 0.05 +
      compareRank(thisCar.fuelConsumption, otherCar.fuelConsumption, true) * 0.15 +
      compareRank(thisCar.emissionsCO2, otherCar.emissionsCO2, true) * 0.3 +
      compareRank(thisCar.meetsEmissionStandard, otherCar.meetsEmissionStandard, false) * 0.1 +
      compareRank(thisCar.productionDate, otherCar.productionDate) * 0.1;
  thisCar.environmentScore += res;
  otherCar.environmentScore += PairWiseResult.Win - res;
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

runWorker(PairWiseWorker);
