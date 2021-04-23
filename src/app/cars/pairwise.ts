import { Observable } from 'rxjs';
import { distinct } from 'rxjs/operators';
import { Car } from "app/interfaces/car.intf";
import { FuelType } from "app/enums/fuel-type.enum";
import { PairWiseResult } from "app/enums/pairwise-result.enum";

//observable number is calculation progress
export function PairWiseComparison(cars: Car[]): Observable<number>
{
  return new Observable<number>((observer) =>
  {
    setTimeout(() => { //workaround for observable to be async?
    try
    {
      let compCount = cars.length * (cars.length-1) / 2; //E(n-1)
      let curComp = 0;
      let progressValue = 0;
      let res = 0.00;

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

          curComp++;
          progressValue = Math.floor(curComp/compCount*100);
          observer.next(progressValue);
        }
      }

      observer.complete();
      return { unsubscribe() {} };
    }
    catch (e)
    {
      observer.error(e);
      return { unsubscribe() {} };
    }
  }, 0)}).pipe(distinct());
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
