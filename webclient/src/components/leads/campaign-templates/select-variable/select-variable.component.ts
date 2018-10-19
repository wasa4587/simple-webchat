import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'select-variable',
	templateUrl: './select-variable.component.html',
	styleUrls: [
		'./select-variable.component.scss'
	]
})
export class SelectVariableComponent {
	@Output() onChange: EventEmitter<any> = new EventEmitter<any>();
	@Input() title: string;
	@Input() data: Array<any>;
	@Input() nameProperty: string;
	@Input() idProperty: string;

	private group1: Array<any> = [];
	private selectedOptions: Array<string> = [];
	private searchText: string = "";

	constructor() {
	}
	ngOnChanges(changes: any) {
		if (changes.hasOwnProperty('data')) {
			this.group1 = changes.data.currentValue;
		}
	}
	ngOnInit() {
		this.group1 = this.data;
	}
	
	/**
	* @method onOptionSelected - Select a single option on group 1
	* @param {any} option - An option comming form the option onClick
	*/
	private onOptionSelected(option, ev:any) {
		let ctrlPressed  = ev.ctrlKey;
		if (ev.ctrlKey) {
			const index = this.selectedOptions.indexOf(option[this.idProperty]);
			if (index !== -1) {
				this.selectedOptions.splice(index, 1);
			} else {
				this.selectedOptions.push(option[this.idProperty]);
			}
		} else {
			this.selectedOptions = [];
			const index = this.selectedOptions.indexOf(option[this.idProperty]);
			if (index !== -1) {
				this.selectedOptions.splice(index, 1);
			} else {
				this.selectedOptions.push(option[this.idProperty]);
			}
		}
	}
	
	/**
	* @method onSearch - Handle the input text keyup event on group 1
	* @param {any} $event - Keyup event
	*/
	private onSearch($event) {
		this.searchText = $event.target.value.trim();
		this.filterData();
	}
	
	/**
	* @method filterData - Filter data options by search text
	*/
	private filterData() {
		this.group1 = this.data.filter(option => {
			return option[this.nameProperty]
				.toLowerCase()
				.indexOf(this.searchText.toLowerCase()) !== -1;
		});
	}

	 /**
  * @method transferToGroup1 - Transfer an option from group2 to group1
  */
 private transferData() {
	let indexes = [];
    this.onChange.emit(this.selectedOptions);
  }
}
