import { Component, OnInit, Input } from '@angular/core';
import { CheckBoxFilter } from 'app/checkboxlist/checkboxFilter';

@Component({
  selector: 'app-checkboxlist',
  templateUrl: './checkboxlist.component.html',
  styleUrls: ['./checkboxlist.component.scss']
})

export class CheckboxlistComponent implements OnInit {

  allChecked: boolean = true;
  cblist!: CheckBoxFilter;

  @Input() name: string = "";
  @Input() values: string[] = [];

  ngOnInit(): void {
    this.cblist = new CheckBoxFilter(this.name, this.values);
  }

  isFewSelected(): boolean {
    return (this.cblist.items == null) || (this.cblist.items.filter(t => t.selected).length > 0 && !this.allChecked);
  }

  setAll(selected: boolean) {
    this.allChecked = selected;
    if (this.cblist.items)
      this.cblist.items.forEach(t => t.selected = selected);
  }

  updateAllComplete() {
    this.allChecked = this.cblist.items != null && this.cblist.items.every(t => t.selected);
  }
}
