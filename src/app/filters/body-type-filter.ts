import { EnumFilter } from "app/filters/enum-filter";
import { BodyType } from "app/enums/body-type.enum";

export class BodyTypeFilter extends EnumFilter<BodyType> {

  constructor(filterField: string)
  {
    super(filterField, BodyType);
  }

  public getName(): string{
    return "Virsbūves tips";
  }

  public getValueName(value: number): string{
    let result =
      value == BodyType.Cabriolet ? "Kabriolets" :
      value == BodyType.Coupe ? "Kupeja" :
      value == BodyType.Crossover ? "Krosoveris" :
      value == BodyType.Hatchback ? "Hečbeks" :
      value == BodyType.Minivan ? "Minivens" :
      value == BodyType.Pickup ? "Pikaps" :
      value == BodyType.Sedan ? "Sedans" :
      value == BodyType.Van ? "Vens" :
      value == BodyType.Wagon ? "Universāls" :
      "<nezinama vērtība>";
    return result;
  }

}
