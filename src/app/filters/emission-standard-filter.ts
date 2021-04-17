import { EnumFilter } from "app/filters/enum-filter";
import { EmissionStandard } from "app/enums/emission-standard.enum";

export class EmissionStandardFilter extends EnumFilter<EmissionStandard> {

  constructor(filterField: string)
  {
    super(filterField, EmissionStandard);
  }

  public getName(): string{
    return "Emisijas standarts";
  }

  public getValueName(value: number): string{
    let result =
      value == EmissionStandard.Euro5 ? "EURO 5" :
      value == EmissionStandard.Euro6 ? "EURO 6" :
      "<nezinama vērtība>";
    return result;
  }

}
