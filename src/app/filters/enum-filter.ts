class CheckBoxFilter
{
  name: string = "";
  value: number = 0;
  checked: boolean = false;
  //disabled: boolean = false;
}

type EnumTypeString<TEnum extends string> =
    { [key in string]: TEnum | string; }

type EnumTypeNumber<TEnum extends number> =
    { [key in string]: TEnum | number; }
    | { [key in number]: string; }

type EnumType<TEnum extends string | number> =
    (TEnum extends string ? EnumTypeString<TEnum> : never)
    | (TEnum extends number ? EnumTypeNumber<TEnum> : never);

type EnumOf<TEnumType> = TEnumType extends EnumType<infer U>
    ? U
    : never

export abstract class EnumFilter<T extends string | number>
{
  items: CheckBoxFilter[] = [];
  private filterField: string;

  constructor(filterField: string, enumType: EnumType<T>)
  {
    this.filterField = filterField;
    for (let i in enumType)
    {
      let val: number = Number(i);
      if (!isNaN(val))
      {
      	this.items.push(Object.assign(new CheckBoxFilter(), {
          name: this.getValueName(val),
          value: val
        }))
      }
    }
  }

  public abstract getName(): string;
  public abstract getValueName(value: number): string;

  public getFilter(): string
  {
    let res = this.items.filter(x => x.checked).map(x => x.value).join(',');
    return res ? this.filterField + "=" + res : "";
  }
}
