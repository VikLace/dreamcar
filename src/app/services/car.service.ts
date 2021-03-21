import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Car } from 'app/interfaces/car.intf';

@Injectable({
  providedIn: 'root'
})
export class CarService {

  private carsUrl = 'api/cars';

  constructor(private http: HttpClient) { }

  getCars(performance?:number, environment?:number, capacity?:number): Observable<Car[]> {
    let cars = this.http.get<Car[]>(this.carsUrl);
    //pairwise comparison goes here
    return cars;
  }

  getCar(id: number): Observable<Car> {
    const url = `${this.carsUrl}/${id}`;
    return this.http.get<Car>(url);
  }
}
