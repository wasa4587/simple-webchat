import { Component, ViewEncapsulation, Input, Inject, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { WorkflowProvider } from 'common/workflow';
import { ActivatedRoute } from '@angular/router';
import { AngularIsEmpty } from 'angularisempty';

enum VariableType {
	ACTIVE,
	ARCHIVED,
	ALL
};

@Component({
	selector: 'campaigns-grid',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './campaigns-grid.component.html',
	styleUrls: [
		'./campaigns-grid.component.scss',
	],
	providers: [
		WorkflowProvider
	]
})

export class CampaignGridComponent {
	public listData: any;
	public variableType = VariableType;
	public nameOrder: string;
	public lastUpdateOrder: string;
	public checkedAll: boolean;
	public filterIsActive: any;
	public filterType: number = 0;
	public sorterArray = {
		name: "",
		version: "",
		workflow_type: ""
	};
	private urlPath: string = '';

	@Input() filteredDatas: any;
	@Input() type: string;
	@Input() refresh: number;
	@Output() data: any = new EventEmitter();
	@Output() checkedChanges: any = new EventEmitter();
	@Output() editMode: any = new EventEmitter();
	@Output() afterAllData: any = new EventEmitter();

	constructor(private workflowProvider: WorkflowProvider, private activatedRoute: ActivatedRoute) {
		if (this.activatedRoute.snapshot.url && this.activatedRoute.snapshot.url.length > 0) {
			this.urlPath = this.activatedRoute.snapshot.url[0].path;
		}
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
		this.workflowProvider.getAll(filter).subscribe((res) => {
			if (res && res.body) {
				this.listData = res.body.items;
				this.data.emit(this.listData);
				if (res.body.items) {
					if (res.body.paging.firstPage !== res.body.paging.lastPage && res.body.items.length > 0) {
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
		this.workflowProvider.getAll(filter).subscribe((res) => {
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
		filter['type'] = (this.urlPath === 'workflowrule') ? 'followup' : 'collection';
		if (this.filterType === 0) {
			filter['filterActive'] = true;
		}
		if (this.filterType === 1) {
			filter['filterActive'] = false;
		}
		if (this.filterType === 2) {
			filter = {};
		}
		return filter;
	}

}
