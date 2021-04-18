import { EnumFilter } from "app/filters/enum-filter";
import { BodyType, getBodyTypeName } from "app/enums/body-type.enum";

export class BodyTypeFilter extends EnumFilter<BodyType> {

  constructor(filterField: string)
  {
    super(filterField, BodyType);
  }

  public getName(): string{
    return "Virsbūves tips";
  }

  public getValueName(value: number): string{
    return getBodyTypeName(value);
  }

}
