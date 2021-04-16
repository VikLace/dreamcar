import { EnumFilter } from "app/filters/enum-filter";
import { FuelType } from "app/enums/fuel-type.enum";

export class FuelTypeFilter extends EnumFilter<FuelType> {

  constructor()
  {
    super(FuelType);
  }

  public getName(): string{
    return "Degvielas tips";
  }

  public getValueName(value: number): string{
    let result =
      value == FuelType.Electric ? "Elektriskā" :
      value == FuelType.Diesel ? "Dīzelis" :
      value == FuelType.DieselHybrid ? "Dīzelis / Hibrīds" :
      value == FuelType.Petrol ? "Benzīns" :
      value == FuelType.PetrolHybrid ? "Benzīns / Hibrīds" :
      value == FuelType.PetrolCNG ? "Benzīns / Saspiesta dabasgāze" :
      value == FuelType.PetrolE85 ? "Benzīns / Etanols(E-85)" :
      value == FuelType.PetrolLPG ? "Benzīns / Sašķidrināta naftas gāze" :
      "<nezinama vērtība>";
    return result;
  }

}
