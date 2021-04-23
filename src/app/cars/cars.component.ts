import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

import { Car } from "app/interfaces/car.intf";
import { CarService } from 'app/services/car.service';
import { CarDetesOverlay } from 'app/car-detes/car-detes-overlay';
import { CarDetesOverlayRef } from 'app/car-detes/car-detes-overlay-ref';

import { PairWiseComparison } from 'app/cars/pairwise';

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

    this.isLoading = true;
    //this.loadingMode = "determinate";

    var t0 = performance.now();
    var _this = this;
    PairWiseComparison(this.carsDataSource.filteredData).subscribe({
      next(num)
      {
        //_this.progressValue = num;
        //console.log(_this.progressValue);
      },
      error(e)
      {
        _this.isLoading = false;
        throw e;
      },
      complete()
      {
        //calculate overall score
        _this.carsDataSource.data.forEach(r => {
          r.overallScore =
            r.capacityScore * _this.capacity/100 +
            r.performanceScore * _this.performance/100 +
            r.environmentScore * _this.environment/100;
        });

        var t1 = performance.now();
        console.log("pairwise comparison took " + (t1 - t0) + " ms.");

        _this.isLoading = false;

        //changes sorting to overall score desc
        _this.sort.active = "overallScore";
        _this.sort.direction = "desc";
        _this.sort.sortChange.emit();
      }
    });
  }

}
