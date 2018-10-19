import { Component, ViewEncapsulation, Input, Inject, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { AngularIsEmpty } from 'angularisempty';
import { TopToastComponent } from '../../../../../common/presentational/top-toast';
import { LeadInventoryProvider } from 'common/lead-inventory/lead-inventory.provider';

@Component({
	selector: 'inventory-grid',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './inventory-grid.component.html',
	styleUrls: [
		'./inventory-grid.component.scss',
	],
	providers: [
		LeadInventoryProvider
	]
})

export class InventoryGridComponent {
	public listData: any;
	public nameOrder: string;
	public checkedAll: boolean;
	public filterType: number = 0;
	public sorterArray = {
		location_name: "",
		date_issued: "",
		ip_address: "",
		token: ""
	};
	public currentId: any;
	public isDeleteModalVisible: boolean = false;
	public errorList: Array<any> = [];

	@Input() filteredDatas: any;
	@Input() type: string;
	@Input() refresh: number;
	@Output() data: any = new EventEmitter();
	@Output() editMode: any = new EventEmitter();
	@Output() afterAllData: any = new EventEmitter();

	constructor(private leadInventoryProvider: LeadInventoryProvider) {
	}

	/**
   * Called when the component is initialized
   */
	ngOnInit() {
		this.nameOrder = 'asc';
		this.checkedAll = false;
		this.listData = [];
	}
	/**
	 * Listen to changes on properties
	 * @param {any} changes - An object with changes
	 */
	ngOnChanges(changes: any) {
		if (!changes.hasOwnProperty('refresh') && changes.hasOwnProperty('type')) {
			this.listData = [];
			this.filterType = Number(this.type);
			this.getData()
		}
		if (changes.hasOwnProperty('filteredDatas')) {
			this.listData = this.filteredDatas;
		}
		if (changes.hasOwnProperty('type')) {
			this.checkedAll = false;
		}
		if (changes.hasOwnProperty('refresh')) {
			this.listData = [];
			this.checkedAll = false;
			this.getData()
		}
	}

	/**
	 * Order the table by value names
	 */
	private orderByNameOrder(name) {
		this.sorterArray[name] = this.sorterArray[name] === 'asc' ? 'desc' : 'asc';
		if (this.listData) {
			this.listData.sort((a, b) => {
				a[name] = AngularIsEmpty.isEmpty(a[name]) ? '' : a[name].toString();
				const order = a[name].localeCompare(b[name]);
				return this.sorterArray[name] === 'asc' ? order : order * -1;
			});
		}
	}

	private onEditMode(index: number) {
		this.editMode.emit(index);
	}

	/**
	 * Query backend for all records
	 */
	private getData() {
		let filter = {};
		filter['page'] = 1;
		this.leadInventoryProvider.getAll(filter).subscribe((res) => {
			if (res && res.body) {
				this.listData = res.body.items;
				this.data.emit(this.listData);
				if (res.body.items) {
					if (res.body.paging.firstPage !== res.body.paging.lastPage && res.body.items.length > 0) {
						this.getDataAll(res.body.paging);
					} else {
						// this.orderByNameOrder('username');
						this.afterAllData.emit({ status: false });
					}
				}
			}
		}, (error) => {
			this.listData = [];
			this.afterAllData.emit({ status: false, error: 'error' });
			if (error) {
				console.error(error);
			}
		});
	}
	/**
	 * Query backend for all records
	 */
	private getDataAll(paging) {
		let filter = {};
		filter['page'] = paging.nextPage;
		this.leadInventoryProvider.getAll(filter).subscribe((res) => {
			if (res && res.body) {
				this.listData = this.listData.concat(res.body.items);
				this.data.emit(this.listData);
				if (res.body.paging.totalPages <= res.body.paging.currentPage) {
					// this.orderByNameOrder('username');
					this.afterAllData.emit({ status: false });
				} else {
					this.getDataAll(res.body.paging);
				}
			}
		}, (error) => {
			this.afterAllData.emit({ status: false, error: 'error' });
			if (error) {
				console.error(error);
			}
		});
	}

	public toastIsHidden(ev) {
        if (ev.length > 0) {
            this.errorList = [];
        }
    }

}
