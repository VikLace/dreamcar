import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CarsComponent } from 'app/cars/cars.component';
import { CarDetesComponent } from 'app/car-detes/car-detes.component';

const routes: Routes = [{ path: '', component: CarsComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
