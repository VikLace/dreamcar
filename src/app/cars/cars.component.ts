import { Component, OnInit } from '@angular/core';

import { Car } from "app/interfaces/car.intf";

import { CarService } from 'app/services/car.service';

import { BodyType } from "app/enums/body-type.enum";
import { DriveWheelConfiguration } from "app/enums/drive-wheel-configuration.enum";
import { FuelType } from "app/enums/fuel-type.enum";
import { Transmission } from "app/enums/transmission.enum";

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss']
})
export class CarsComponent implements OnInit {

  cars: Car[] = [];
  performance!: number;
  environment!: number;
  capacity!: number;

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.carService.getCars().subscribe(c => this.cars = c);
  }

  generateClick(): void{
    this.performance = this.performance || 0;
    this.environment = this.environment || 0;
    this.capacity = this.capacity || 0;
    //todo: need a normal proportion calc, so sum is always 100
    let sum = this.performance + this.environment + this.capacity;
    if (sum > 0)
    {
        this.performance = Math.round(this.performance / sum * 100);
        this.environment = Math.round(this.environment / sum * 100);
        this.capacity = Math.round(this.capacity / sum * 100);
        sum = this.performance + this.environment + this.capacity - 100;
        if (sum != 0)
        {
          this.capacity -= sum;
        }
    }
  }

}
