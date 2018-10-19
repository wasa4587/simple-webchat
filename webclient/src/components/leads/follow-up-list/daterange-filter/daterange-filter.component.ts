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
  selector: 'daterange-filter',
  templateUrl: './daterange-filter.component.html',
  styleUrls: [
    './daterange-filter.component.scss'
  ],
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
  encapsulation: ViewEncapsulation.None

})

export class DaterangeFilterComponent {

  @Input() dateRange: string;
  @Output() onSelectionChange = new EventEmitter();
  @Output() onSelectionDateRange = new EventEmitter();

  public showDropdown: boolean= false;
  public dropdownDateRange: Array<any> = [];
  public errorList: Array<any> = [];
  private todayDate: string;
  private fromDate: string = '';
  private toDate: string = '';
  private dateRangeSelected: string;
  private selecreedRadioButton: boolean;
  private displayNAmeArray = ["Today", "The past 7 days", "The past 30 days", "All Time"];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.todayDate = moment().format('YYYY-MM-DD');
    this.showDropdown = false;
    this.dateRangeSelected = 'Date Range'.bold() + "\n" + this.dateRange;
    this.dropdownDateRange = [
      {
        id:"Today",
        name:"Today"
      },
      {
        id:"Thepast7days",
        name:"The past 7 days"
      },
      {
        id:"Thepast30days",
        name:"The past 30 days"
      },
      {
        id:"AllTime",
        name:"All Time"
      }
    ];
    if (this.displayNAmeArray.indexOf(this.dateRange) !== -1) {
      this.selecreedRadioButton = false;
    } else {
      this.selecreedRadioButton = true;
    }
  }

  /**
	 * Listen to changes on properties
	 * @param {any} changes - An object with changes
	 */
	ngOnChanges(changes: any) {
		if (changes.hasOwnProperty('dateRange')) {
      this.dateRangeSelected = 'Date Range'.bold() + "\n" + this.dateRange;
      if (this.displayNAmeArray.indexOf(this.dateRange) !== -1) {
        this.selecreedRadioButton = false;
      } else {
        this.selecreedRadioButton = true;
      }
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
  }

 /**
  * Select date function
  * @param ev - The angular event
  * @param from - (string) Define date frome or to
  */
  public selectionDateRange(ev:any, from) {
    if (from === 'from') {
      this.fromDate = ev.target.value;
    } else {
      this.toDate = ev.target.value
    }
    if (this.fromDate !== "" && this.toDate !== "") {
      if (this.fromDate > this.toDate) {
        this.errorList = [{
          message: 'From date greater than the to date',
          type: TopToastComponent.ERROR
        }];
        this.toDate = "";
        return;
      }
    }
    this.onSelectionDateRange.emit({ fromDate: this.fromDate, toDate: this.toDate });
  }

  public toastIsHidden(ev) {
		if (ev.length > 0) {
			this.errorList = [];
		}
	}
}
