import { EnumFilter } from "app/filters/enum-filter";
import { FuelType, getFuelTypeName } from "app/enums/fuel-type.enum";

export class FuelTypeFilter extends EnumFilter<FuelType> {

  constructor(filterField: string)
  {
    super(filterField, FuelType);
  }

  public getName(): string{
    return "Degviela";
  }

  public getValueName(value: FuelType): string{
    return getFuelTypeName(value);
  }

}
