/**
 * Filter dropdown component
 */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { TopToastComponent } from 'common/presentational/top-toast';

@Component({
  selector: 'lead-status-filter',
  templateUrl: './lead-status-filter.component.html',
  styleUrls: [
    './lead-status-filter.component.scss'
  ],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  encapsulation: ViewEncapsulation.None

})

export class LeadStatusFilterComponent {

  @Input() refresh: any;
  @Output() onSelectionChange = new EventEmitter();
  @Output() onSelectionDateRange = new EventEmitter();

  public showDropdown: boolean= false;
  public dropdownOptions: Array<any> = [];
  public errorList: Array<any> = [];
  private selectedOptionName: string;
  private displayName: string;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.showDropdown = false;
    this.displayName = "Active";
    this.selectedOptionName = 'Lead Status'.bold() + "\n" + this.displayName;
    this.dropdownOptions = [
      {
        id:"all",
        name:"All"
      },
      {
        id:"active",
        name:"Active"
      },
      {
        id:"cancelled",
        name:"Cancelled"
      }
    ];
  }

  /**
	 * Listen to changes on properties
	 * @param {any} changes - An object with changes
	 */
	ngOnChanges(changes: any) {
		if (changes.hasOwnProperty('refresh')) {
      this.displayName = "Active";
      this.selectedOptionName = 'Lead Status'.bold() + "\n" + this.displayName;
		}
	}

  /**
   * Show dropdown when the select box is clicked
   */
  public show() {
    this.showDropdown = !this.showDropdown;
  }

  /**
   * Close modal when user click outside the dropdown
   * @param {any} event - The angular event that contains the elementRef of the
   * clicked element.
   */
  public onClickOutside(event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  /**
   * Haldle select filter event
   * @param value - value of the date rage filter
   * @param key - key of the date rage filter
   */
  public selectionChange(value: any, key: any) {
    this.onSelectionChange.emit({key, value});
    this.displayName = value;
    this.selectedOptionName = 'Lead Status'.bold() + "\n" + this.displayName;
  }

  public toastIsHidden(ev) {
		if (ev.length > 0) {
			this.errorList = [];
		}
	}
}
