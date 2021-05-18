import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Options as ngxOptions } from "@angular-slider/ngx-slider";

import { fromWorker } from 'observable-webworker';
import { of } from 'rxjs';

import { Car } from "app/interfaces/car.intf";
import { CarService } from 'app/services/car.service';
import { CarDetesOverlay } from 'app/car-detes/car-detes-overlay';
import { CarDetesOverlayRef } from 'app/car-detes/car-detes-overlay-ref';

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
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ["name", "performanceScore", "environmentScore", "capacityScore", "overallScore"];

  performance: number = 50;
  environment: number = 50;
  capacity: number = 50;

  enumFilters: EnumFilter<any>[] = [];

  filterYear = false;
  minProductionYear: number = 0;
  maxProductionYear: number = 0;
  ngxOptions!: ngxOptions;

  constructor(
    private carService: CarService,
    private carDetesOverlay: CarDetesOverlay,
    private snackBar: MatSnackBar
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
            let carval = car[fieldName] as number;
            if (fieldName == "productionDate")
            {
              if (carval < values[0] || carval > values[1])
                return false;
            }
            else if (!values.includes(carval))
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
        this.carsDataSource.paginator = this.paginator;
        this.isLoading = false;
        this.minProductionYear = Math.min.apply(Math, data.map(function(o) { return o.productionDate || 99999; }));
        this.maxProductionYear = Math.max.apply(Math, data.map(function(o) { return o.productionDate || 0; }));
        this.ngxOptions = {floor: this.minProductionYear, ceil: this.maxProductionYear, disabled: true};
      },
      error => this.isLoading = false
    );
  }

  showCarDetes(id: number)
  {
    let dialogRef: CarDetesOverlayRef = this.carDetesOverlay.open(id);
  }

  filterChanged(): void{
    let fltr = this.enumFilters.map(f => f.getFilter()).filter(Boolean).join(';');
    this.ngxOptions = Object.assign({}, this.ngxOptions, {disabled: !this.filterYear});
    if (this.filterYear)
    {
      fltr += (fltr?";":"") + `productionDate=${this.minProductionYear},${this.maxProductionYear}`;
    }
    this.carsDataSource.filter = fltr;
    this.resetPaging();
    if ((this.carsDataSource.filteredData.length > 0) && (this.carsDataSource.data[0].overallScore != undefined))
    {
      this.snackBar.open('Datu kopa ir mainījusies. Aprēķinātās summas vairs nav aktuālas.', 'Pārrēķināt')
        .onAction().subscribe(() => { this.generateClick() });
    }
  }

  resetPaging(): void {
    this.paginator.pageIndex = 0;
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
    let perf = this.performance || 0;
    let env = this.environment || 0;
    let cap = this.capacity || 0;

    let sum = perf + env + cap;
    if (sum == 0)
      return;

    // TODO: need a normal proportion calc, so sum is always 100
    perf = Math.round(perf / sum * 100);
    env = Math.round(env / sum * 100);
    cap = Math.round(cap / sum * 100);
    sum = perf + env + cap - 100;
    if (sum != 0)
    {
      cap -= sum;
    }

    this.clearScoring();
    this.resetPaging();

    this.isLoading = true;
    this.loadingMode = "determinate";
    var _this = this;
    var t0 = performance.now();
    var receivedCount = 0;
    var totalCount = this.carsDataSource.filteredData.length;
    var totalCompareCount = totalCount * (totalCount - 1) / 2; //E(n-1)
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
              car.capacityScore * cap/100 +
              car.performanceScore * perf/100 +
              car.environmentScore * env/100;
          });

          receivedCount += cars.length;

          //even out progress (first car takes n-1 comparisons, last car - 0)
          //kth sum from the end = n*k - k(k+1)/2
          let doneCompareCount = totalCount * receivedCount - receivedCount * (receivedCount + 1) / 2;

          _this.progressValue = Math.ceil(doneCompareCount/totalCompareCount*100);
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

          setTimeout(() => {
            _this.isLoading = false;
            _this.progressValue = 0;
          }, 500); //wait half a second for progress spinner to catch up

          //changes sorting to overall score desc
          _this.sort.active = "overallScore";
          _this.sort.direction = "desc";
          _this.sort.sortChange.emit();
        }
    });
  }

}
