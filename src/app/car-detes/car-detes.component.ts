import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { CarService } from 'app/services/car.service';
import { Car } from 'app/interfaces/car.intf';

@Component({
  selector: 'app-car-detes',
  templateUrl: './car-detes.component.html',
  styleUrls: ['./car-detes.component.scss']
})
export class CarDetesComponent implements OnInit {

  car: Car | undefined;

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private location: Location
  ) { }

  ngOnInit(): void {
    let id = +this.route.snapshot.paramMap.get('id')!;
    this.carService.getCar(id).subscribe(c => this.car = c);
  }

  goBack(): void {
    this.location.back();
  }

}
