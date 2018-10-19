import { Component, Output, EventEmitter } from '@angular/core';
import { TopToastComponent } from '../../../../common/presentational/top-toast';
import { AngularIsEmpty } from 'angularisempty';
import { Router } from '@angular/router';

@Component({
	selector: 'inventory',
	templateUrl: './inventory.component.html',
	styleUrls: [
		'./inventory.component.scss'
	],
	providers: [],
})
export class InventoryComponent {
	public searchValue: string = '';
	public errorList: Array<any>;
	public refresh: number;
	public recordLists: any = [];
	public filteredDatas: any;
	public showLoading: boolean = false;

	constructor(private router: Router) { }
	ngOnInit() {
		this.errorList = [];
		this.showLoading = true;
	}

	/**
	 * Catch new data from the grid
	 */
	public catchData(recordLists: any): void {
		this.recordLists = recordLists;
		this.filterDatas();
	}

	/**
	 * get trigger after load all data
	 */
	public afterAllData(ev: any): void {
		this.showLoading = ev.status;
		this.filterDatas();
		if (ev.error === 'error') {
			this.errorList = [{
				message: 'Something went wrong!',
				type: TopToastComponent.ERROR
			}];
		}
	}


	/**
	 * Filter the record by search text
	 */
	public filterDatas() {
		this.filteredDatas = this.recordLists.filter((item) =>
			this.matchName(item, this.searchValue, 'username') || this.matchName(item, this.searchValue, 'date_issued') || this.matchName(item, this.searchValue, 'ip_address') || this.matchName(item, this.searchValue, 'token')
		);
	}

	/**
	 * Filter the record by field name
	 */
	private matchName(item: any, searchValue: string, fieldName): boolean {
		let searchName = AngularIsEmpty.isEmpty(item[fieldName]) ? '' : (item[fieldName].toString()).toUpperCase();
		return searchName.search(searchValue.toUpperCase()) > -1;
	}


	/**
	 * Updates searchValue whenever something is typed in the search input.
	 *
	 * @param {any} ev - DOM KeyboardEvent.
	 * @return {void}
	 */
	public onSearchKeyup(event: any): void {
		this.searchValue = event.target.value;
		this.searchValue = this.searchValue.trim();
		this.filterDatas();
	}

	public onEditMode(id:any) {
		this.router.navigate(['v2/system-configuration/inventory/edit/' + id]);
	}

	public toastIsHidden(ev) {
		if (ev.length > 0) {
			this.errorList = [];
		}
	}

}
