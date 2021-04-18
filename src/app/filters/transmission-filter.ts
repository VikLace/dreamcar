import { EnumFilter } from "app/filters/enum-filter";
import { Transmission, getTransmissionName } from "app/enums/transmission.enum";

export class TransmissionFilter extends EnumFilter<Transmission> {

  constructor(filterField: string)
  {
    super(filterField, Transmission);
  }

  public getName(): string{
    return "Pārnesumkārba";
  }

  public getValueName(value: Transmission): string{
    return getTransmissionName(value);
  }

}
