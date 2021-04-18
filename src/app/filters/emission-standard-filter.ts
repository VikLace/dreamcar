import { EnumFilter } from "app/filters/enum-filter";
import { EmissionStandard, getEmissionStandardName } from "app/enums/emission-standard.enum";

export class EmissionStandardFilter extends EnumFilter<EmissionStandard> {

  constructor(filterField: string)
  {
    super(filterField, EmissionStandard);
  }

  public getName(): string{
    return "Emisijas standarts";
  }

  public getValueName(value: EmissionStandard): string{
    return getEmissionStandardName(value);
  }

}
