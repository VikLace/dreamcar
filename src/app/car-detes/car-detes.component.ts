import { Component, OnInit, Inject } from '@angular/core';

import { CarService } from 'app/services/car.service';
import { Car } from 'app/interfaces/car.intf';
import { CarDetesOverlayRef } from './car-detes-overlay-ref';
import { CAR_DETES_DIALOG_DATA } from './car-detes-overlay.tokens';

import { getBodyTypeName } from 'app/enums/body-type.enum';
import { getDriveWheelConfigurationName } from 'app/enums/drive-wheel-configuration.enum';
import { getEmissionStandardName } from 'app/enums/emission-standard.enum';
import { getFuelTypeName } from 'app/enums/fuel-type.enum';
import { getTransmissionName } from 'app/enums/transmission.enum';

@Component({
  selector: 'app-car-detes',
  templateUrl: './car-detes.component.html',
  styleUrls: ['./car-detes.component.scss']
})
export class CarDetesComponent implements OnInit {

  car: Car | undefined;
  getBodyTypeName = getBodyTypeName;
  getDriveWheelConfigurationName = getDriveWheelConfigurationName;
  getEmissionStandardName = getEmissionStandardName;
  getFuelTypeName = getFuelTypeName;
  getTransmissionName = getTransmissionName;

  constructor(
    private carService: CarService,
    public dialogRef: CarDetesOverlayRef,
    @Inject(CAR_DETES_DIALOG_DATA) public id: number
  ) { }

  ngOnInit(): void {
    this.carService.getCar(this.id).subscribe(c => this.car = c);
  }

}
