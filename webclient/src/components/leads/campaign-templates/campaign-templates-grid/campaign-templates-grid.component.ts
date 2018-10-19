import { Component, ViewEncapsulation, Input, Inject, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { AngularIsEmpty } from 'angularisempty';
import { LeadCampaignTemplateProvider } from 'common/campaigns-templates/campaigns-templates.provider';

enum VariableType {
	ACTIVE,
	ARCHIVED,
	ALL
};

@Component({
	selector: 'campaign-templates-grid',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './campaign-templates-grid.component.html',
	styleUrls: [
		'./campaign-templates-grid.component.scss',
	],
	providers: [
		LeadCampaignTemplateProvider
	]
})

export class CampaignTemplatesGridComponent {
	public listData: any;
	public variableType = VariableType;
	public nameOrder: string;
	public lastUpdateOrder: string;
	public checkedAll: boolean;
	public filterIsActive: any;
	public filterType: number = 0;
	public sorterArray = {
		name: "",
		type: ""
	};

	@Input() filteredDatas: any;
	@Input() type: string;
	@Input() refresh: number;
	@Output() data: any = new EventEmitter();
	@Output() checkedChanges: any = new EventEmitter();
	@Output() editMode: any = new EventEmitter();
	@Output() afterAllData: any = new EventEmitter();

	constructor(private leadCampaignTemplateProvider: LeadCampaignTemplateProvider) {
	}

	/**
   * Called when the component is initialized
   */
	ngOnInit() {
		this.nameOrder = 'asc';
		this.lastUpdateOrder = '';
		this.checkedAll = false;
		this.filterIsActive = true;
		this.listData = [];
		// this.getData();
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
				a[name] = AngularIsEmpty.isEmpty(a[name]) ? '' : a[name];
				const order = a[name].localeCompare(b[name]);
				return this.sorterArray[name] === 'asc' ? order : order * -1;
			});
		}
	}

	private onEditMode(index: number) {
		this.editMode.emit(index);
		//@TODO CP-4803
	}

	private onCreateMode() {
		//@TODO CP-4803
	}
	/**
	 * Check a route
	 * @param {any} $event - The input event.
	 */
	private checkRecord($event, id) {
		this.checkedChanges.emit({ action: 'checkOne', id: id });
	}
	/**
	 * Check all routes
	 * @param {any} $event - The input event.
	 */
	private checkAllRecords($event) {
		this.checkedAll = $event.target.checked;
		this.checkedChanges.emit({ action: 'checkAll', id: -1 });
	}

	/**
	 * Query backend for all variables
	 */
	private getData() {
		let filter = this.customeFilter();
		filter['page'] = 1;
		this.leadCampaignTemplateProvider.getAll(filter).subscribe((res) => {
			if (res && res.body) {
				this.listData = res.body.items;
				this.data.emit(this.listData);
				if (res.body.items) {
					if (res.body.paging.firstPage !== res.body.paging.lastPage) {
						this.getDataAll(res.body.paging);
					} else {
						this.orderByNameOrder('name');
						this.afterAllData.emit({ status: false });
					}
				}
			}
		}, (error) => {
			this.listData = [];
			this.afterAllData.emit({ status: false, error:'error' });
			if (error) {
				console.error(error);
			}
		});
	}
	/**
	 * Query backend for all variables
	 */
	private getDataAll(paging) {
		let filter = this.customeFilter();
		filter['page'] = paging.nextPage;
		this.leadCampaignTemplateProvider.getAll(filter).subscribe((res) => {
			if (res && res.body) {
				this.listData = this.listData.concat(res.body.items);
				this.data.emit(this.listData);
				if (res.body.paging.totalPages <= res.body.paging.currentPage) {
					this.orderByNameOrder('name');
					this.afterAllData.emit({ status: false });
				} else {
					this.getDataAll(res.body.paging);
				}
			}
		}, (error) => {
			this.afterAllData.emit({ status: false, error:'error' });
			if (error) {
				console.error(error);
			}
		});
	}

	/**
	 * filter
	 */
	customeFilter() {
		let filter = {};
		if (this.filterType === 0) {
			filter['filterIsActive'] = true;
		}
		if (this.filterType === 1) {
			filter['filterIsActive'] = false;
		}
		if (this.filterType === 2) {
			filter = {};
		}
		return filter;
	}

	/**
	 * Format the template type to remove underscore and to show the sms uppercase
	 * @param item The current campaign template item
	 */
  public formatTypeNames(item) {
		if (item.type === 'sms') {
			return 'SMS'
		} else {
			return item.type.replace('_', ' ');
		}
	}
}
