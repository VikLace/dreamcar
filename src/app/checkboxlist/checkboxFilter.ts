export class CheckBoxFilter {
  name: string = "";
  selected: boolean = true;
  disabled: boolean = false;
  items?: CheckBoxFilter[];

  constructor(name: string, items?: string[]){
    this.name = name;
    if (items && items.length > 0)
      this.items = Array.from(items, r => new CheckBoxFilter(r));
  }
}
