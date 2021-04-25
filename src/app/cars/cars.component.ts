import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

import { fromWorker } from 'observable-webworker';
import { Observable, of } from 'rxjs';

import { Car } from "app/interfaces/car.intf";
import { CarService } from 'app/services/car.service';
import { CarDetesOverlay } from 'app/car-detes/car-detes-overlay';
import { CarDetesOverlayRef } from 'app/car-detes/car-detes-overlay-ref';

import { ComparisonResult } from "app/interfaces/comparison-result.intf";

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

  isLoading = true;
  loadingMode: ProgressSpinnerMode = "indeterminate";
  progressValue: number = 0;

  carsDataSource: MatTableDataSource<Car>;

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ["name", "performanceScore", "environmentScore", "capacityScore", "overallScore"];

  performance!: number;
  environment!: number;
  capacity!: number;

  enumFilters: EnumFilter<any>[] = [];

  /*minProductionYear: number = 0;
  maxProductionYear: number = 0;*/

  constructor(
    private carService: CarService,
    private carDetesOverlay: CarDetesOverlay
  )
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
    this.carService.getCars().subscribe(
      data => {
        this.carsDataSource.data = data;
        this.carsDataSource.sort = this.sort;
        this.isLoading = false;
        /*this.minProductionYear = Math.min.apply(Math, c.map(function(o) { return o.productionDate || 99999; }))
        this.maxProductionYear = Math.max.apply(Math, c.map(function(o) { return o.productionDate || 0; }))*/
      },
      error => this.isLoading = false
    );
  }

  showCarDetes(id: number)
  {
    let dialogRef: CarDetesOverlayRef = this.carDetesOverlay.open(id);
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

  generateClick()
  {
    this.performance = this.performance || 0;
    this.environment = this.environment || 0;
    this.capacity = this.capacity || 0;

    let sum = this.performance + this.environment + this.capacity;
    if (sum == 0)
      return;

    // TODO: need a normal proportion calc, so sum is always 100
    this.performance = Math.round(this.performance / sum * 100);
    this.environment = Math.round(this.environment / sum * 100);
    this.capacity = Math.round(this.capacity / sum * 100);
    sum = this.performance + this.environment + this.capacity - 100;
    if (sum != 0)
    {
      this.capacity -= sum;
    }

    this.clearScoring();

    this.isLoading = true;
    this.loadingMode = "determinate";
    var _this = this;
    var t0 = performance.now();
    var receivedCount = 0;
    var totalCount = this.carsDataSource.filteredData.length;
    fromWorker<Car[], Car[]>(() => new Worker('app/workers/pair-wise.worker', { type: 'module'}), of(this.carsDataSource.filteredData))
      .subscribe({
        next(cars:Car[])
        {
          cars.forEach(car => {
            var idx = _this.carsDataSource.filteredData.findIndex(x => x.id == car.id);
            _this.carsDataSource.filteredData[idx].performanceScore = car.performanceScore;
            _this.carsDataSource.filteredData[idx].capacityScore = car.capacityScore;
            _this.carsDataSource.filteredData[idx].environmentScore = car.environmentScore;
            _this.carsDataSource.filteredData[idx].overallScore =
              car.capacityScore * _this.capacity/100 +
              car.performanceScore * _this.performance/100 +
              car.environmentScore * _this.environment/100;
          });

          // TODO: even out progress (first car takes n-1 comparisons, last car - 0)
          receivedCount += cars.length;
          _this.progressValue = Math.floor(receivedCount/totalCount*100);
        },
        error(e:any)
        {
          _this.isLoading = false;
          console.log(e);
        },
        complete()
        {
          var t1 = performance.now();
          console.log("pairwise comparison took " + (t1 - t0) + " ms.");

          _this.isLoading = false;
          _this.progressValue = 0;

          //changes sorting to overall score desc
          _this.sort.active = "overallScore";
          _this.sort.direction = "desc";
          _this.sort.sortChange.emit();
        }
    });
  }

}
