import { Component, ViewEncapsulation, Input, Inject, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { LeadTypeProvider } from 'common/leadtype';
import { UtilsHelper } from '../../../../../common/core';
import { AngularIsEmpty } from 'angularisempty';
import { WorkflowProvider } from 'common/workflow';

enum VariableType {
	ACTIVE,
	ARCHIVED,
	ALL
};

@Component({
	selector: 'lead-types-grid',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './lead-types-grid.component.html',
	styleUrls: [
		'./lead-types-grid.component.scss',
	],
	providers: [
		LeadTypeProvider,
		WorkflowProvider
	]
})

export class LeadTypesGridComponent {
	public listData: any;
	public variableType = VariableType;
	public nameOrder: string;
	public checkedAll: boolean;
	public filterType: number = 0;
	public sorterArray = {
		lable: "",
		api_type: "",
		transmission_type: "",
		followup_rule_id: ""
	};
	public apiTypeArr: any;
	public AngularIsEmpty: any;
	public followupRuleArr: any = {};
	public locationDefault = 'Location Default';

	@Input() filteredDatas: any;
	@Input() type: string;
	@Input() refresh: number;
	@Output() data: any = new EventEmitter();
	@Output() checkedChanges: any = new EventEmitter();
	@Output() editMode: any = new EventEmitter();
	@Output() afterAllData: any = new EventEmitter();
	@Output() workFlowruleArray: any = new EventEmitter();

	constructor(private leadTypeProvider: LeadTypeProvider, private workflowProvider: WorkflowProvider) {
	}

	/**
   * Called when the component is initialized
   */
	ngOnInit() {
		this.nameOrder = 'asc';
		this.checkedAll = false;
		this.listData = [];
		this.apiTypeArr = UtilsHelper.apiTypeArray();
		this.getWorkFlowRule();
		this.AngularIsEmpty = AngularIsEmpty;
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
		this.leadTypeProvider.getAll(filter).subscribe((res) => {
			if (res && res.body) {
				res.body.items = this.transmitTypeIdToValue(res.body.items)
				this.listData = res.body.items;
				this.data.emit(this.listData);
				if (res.body.items) {
					if (res.body.paging.firstPage !== res.body.paging.lastPage && res.body.items.length > 0) {
						this.getDataAll(res.body.paging);
					} else {
						this.orderByNameOrder('lable');
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
		this.leadTypeProvider.getAll(filter).subscribe((res) => {
			if (res && res.body) {
				res.body.items = this.transmitTypeIdToValue(res.body.items)
				this.listData = this.listData.concat(res.body.items);
				this.data.emit(this.listData);
				if (res.body.paging.totalPages <= res.body.paging.currentPage) {
					this.orderByNameOrder('lable');
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
     * get work flow rule list
     */
	public getWorkFlowRule() {
		this.workflowProvider.getAll({ type: 'followup', page: false, filter: 1 }).subscribe((res) => {
			if (!!res && !!res.body && !!res.body.items) {
				res.body.items.map((obj) => {
					this.followupRuleArr[obj.id] = obj.name;
				});
				this.workFlowruleArray.emit(this.followupRuleArr);
			}
		}, (error) => {
			if (error) {
				console.log(error);
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
	 * replace transmit type id to value
	 */
	public transmitTypeIdToValue(data): any {
		if (!AngularIsEmpty.isEmpty(data) && data.length > 0) {
			let tempObj;
			data.map((obj) => {
				tempObj = UtilsHelper.transmitTypeArray(obj.api_type);
				obj.transmission_type = tempObj[obj.transmission_type].name;
				obj.followup_rule_id = AngularIsEmpty.isEmpty(obj.followup_rule_id) ? this.locationDefault : obj.followup_rule_id;
			});
			return data;

		} else {
			return data;
		}
	}

}
