import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EnumFilter } from 'app/filters/enum-filter';

@Component({
  selector: 'app-checkboxlist',
  templateUrl: './checkboxlist.component.html',
  styleUrls: ['./checkboxlist.component.scss']
})

export class CheckboxlistComponent {

  allChecked: boolean = false;

  @Input() enumFilter!: EnumFilter<any>;
  @Input() isLoading: boolean = false;
  @Output() filterChanged = new EventEmitter<void>();

  isFewSelected(): boolean {
    return (this.enumFilter.items == null) || (this.enumFilter.items.filter(t => t.checked).length > 0 && !this.allChecked);
  }

  setAll(selected: boolean) {
    this.allChecked = selected;
    if (this.enumFilter.items)
      this.enumFilter.items.forEach(t => t.checked = selected);
    this.filterChanged.emit();
  }

  private updateAllComplete() {
    this.allChecked = this.enumFilter.items != null && this.enumFilter.items.every(t => t.checked);
  }

  onChange(value: boolean){
    this.filterChanged.emit();
    this.updateAllComplete();
  }

  // TODO: disable all when data loading
}
