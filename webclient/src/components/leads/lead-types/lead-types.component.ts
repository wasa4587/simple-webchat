import { Component, Output, EventEmitter } from '@angular/core';
import { TopToastComponent } from '../../../../common/presentational/top-toast';
import { InputValidationComponent } from '../../../../common/presentational/inputs/input-validation';
import { Router } from '@angular/router';
import { LeadTypeProvider } from 'common/leadtype';
import { SessionProvider } from 'common/session';
import { UserProvider } from 'common/user';
import { AngularIsEmpty } from 'angularisempty';
import { UtilsHelper } from '../../../../common/core';

enum VariableType {
	ACTIVE,
	ARCHIVED,
	ALL
};

@Component({
	selector: 'lead-types',
	templateUrl: './lead-types.component.html',
	styleUrls: [
		'./lead-types.component.scss'
	],
	providers: [
		LeadTypeProvider,
		SessionProvider,
		UserProvider
	],
})
export class LeadTypesComponent {
	public variableType = VariableType;
	public type: VariableType = VariableType.ACTIVE;
	public searchValue: string = '';
	public errorList: Array<any>;
	public refresh: number;
	public recordLists: any = [];
	public checked: any = [];
	public checkedAll: boolean = false;
	public filteredDatas: any;
	public showLoading: boolean = false;
	public isCreateModalVisible: boolean = false;
	public newLeadTypeModalTitle: string = 'Lead Types add';
	public user: any;
	public disableMoveIn: boolean;
	public parent_id: number;
	public editRecordId: number;
	public apiTypeArray: any;
	public followupRuleArr: any;
	public locationDefault: string = 'Location Default';

	constructor(
		private leadtypeProvider: LeadTypeProvider,
		private router: Router,
		private sessionProvider: SessionProvider,
		private userProvider: UserProvider
	) { }
	ngOnInit() {
		this.errorList = [];
		this.showLoading = true;
		this.getUserLogged();
		this.apiTypeArray = UtilsHelper.apiTypeArray();
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
	 * Filter the location by search text
	 */
	public filterDatas() {
		this.filteredDatas = this.recordLists.filter((item) =>
			this.matchName(item, this.searchValue, 'lable') || this.matchName(item, this.searchValue, 'api_type') || this.matchName(item, this.searchValue, 'transmission_type') || this.matchName(item, this.searchValue, 'followup_rule_id')
		);
	}

	/**
	 * Filter the location by location name
	 */
	private matchName(item: any, searchValue: string, fieldName): boolean {
		let searchName;
		if (fieldName === 'api_type') {
			searchName = AngularIsEmpty.isEmpty(item[fieldName]) ? '' : ((this.apiTypeArray[item[fieldName]].name).toString()).toUpperCase();
		} else if (fieldName === 'followup_rule_id' && !AngularIsEmpty.isEmpty(this.followupRuleArr)) {
			searchName = (item[fieldName]===this.locationDefault) ? this.locationDefault.toUpperCase() : (AngularIsEmpty.isEmpty(this.followupRuleArr[item[fieldName]]) ? '' : this.followupRuleArr[item[fieldName]]).toString().toUpperCase();
		} else {
			searchName = AngularIsEmpty.isEmpty(item[fieldName]) ? '' : (item[fieldName].toString()).toUpperCase();
		}
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
		if(this.searchValue[0] == ' ') {
		  this.searchValue = this.searchValue.trim();
		}
		this.filterDatas();
	}

	/**
	 * Handler for archive/unarchive button
	 */
	public onArchive() {
		let defaultRuleFlag = 0;
		let data = this.checked.map(index => {
			const obj = this.filteredDatas.filter((record) => {
				return record.lead_type_id === index;
			});
			if (obj[0].is_default === 1) {
				defaultRuleFlag=1;
			}
			obj[0].is_active = this.type === VariableType.ACTIVE ? 0 : 1;
			return obj[0];
		});
		if (defaultRuleFlag === 1) {
			alert('You cannot archive a default rule.');
			return;
		}
		data = this.transmitTypeValueToId(data);
		const params: any = {
			body: data
		};
		this.showLoading = true;
		this.leadtypeProvider.bulkUpdate(params).subscribe((res) => {
			this.searchValue = '';
			this.checked = [];
			this.showLoading = false;
			this.checkedAll = false;
			this.refresh = Date.now();
			if ('body' in res && 'status' in res.body && res.body.status === 'OK') {
				let msg = (this.type === 1) ? "active" : "archived";
				this.errorList = [{
					message: "Record added in " + msg + " status",
					type: TopToastComponent.SUCCESS
				}];
			}
		}, (err) => {
			this.showLoading = false;
			if (err && '_body' in err) {
				const parsedError = JSON.parse(err._body);
				if ('data' in parsedError && 'error' in parsedError.data) {
					this.errorList = parsedError.data.error.map(error => {
						return {
							message: error.message,
							type: TopToastComponent.ERROR
						};
					});
				}
			}
		});
	}

	public filter(type: VariableType): void {
		this.checked = [];
		this.type = type;
		this.showLoading = true;
		this.searchValue = '';
		return;
	}

	/**
	 * Handles when one or all route rows are checked
	 * @param {action: string, index: numeric} the action name, and route index
	 */
	public onCheckedChanges($event) {
		if ($event.action === 'checkOne') {
			const found = this.checked.indexOf($event.id);
			if (found === -1) {
				this.checked.push($event.id);
			} else {
				this.checked.splice(found, 1);
			}
		} else if ($event.action === 'checkAll') {
			this.checkedAll = !this.checkedAll;
			if (this.checkedAll) {
				this.checked = this.filteredDatas.map((item, index) => item.id);
			} else {
				this.checked = [];
			}
		}
	}

	public onEditMode(id: any) {
		this.newLeadTypeModalTitle = 'Lead Types edit';
		this.editRecordId = id;
		this.isCreateModalVisible = true;
		return;
	}
	/**
	 * onNewCallRouteButtonClick
	 * Handles the click event of the New Call Route button
	 *
	 * @param {any} event - DOM MouseEvent.
	 * @memberOf CallRoutesComponent
	 * @returns {void}
	 */
	public onNewButtonClick(event: any): void {
		this.newLeadTypeModalTitle = 'Lead Types add';
		this.editRecordId = 0;
		this.isCreateModalVisible = true;
		return;
	}

	public onCreateModalClose(event: any): void {
		if (event === 'save' || event === 'update') {
			this.refresh = Date.now();
			this.searchValue = '';
			this.checkedAll = false;
			this.errorList = [{
				message: "Record " + event + " successfully.",
				type: TopToastComponent.SUCCESS
			}];
		}
		this.isCreateModalVisible = false;
		return;
	}

	public toastIsHidden(ev) {
		if (ev.length > 0) {
			this.errorList = [];
		}
	}
	/**
	 *
	*/
	onDisableMoveIn(ev: any) {
		const body = {
			disable_movein: (ev === true) ? 1 : 0
		}
		const params: any = {
			body,
			id: this.user.user_id
		};
		if (!AngularIsEmpty.isEmpty(ev)) {
			this.userProvider.update(params).subscribe((res) => {
				this.errorList = [{
					message: 'Disable move in status change',
					type: TopToastComponent.SUCCESS
				}];
			}, (err) => {
				if (err) {
					console.error(err);
				}
				this.errorList = [{
					message: err.json().messages[0],
					type: TopToastComponent.ERROR
				}];
			});
		}
	}

	/**
   * Get the session for the logged user
   */
	private getUserLogged() {
		this.sessionProvider.getOne({}).subscribe((res) => {
			if (!AngularIsEmpty.isEmpty(res) && !AngularIsEmpty.isEmpty(res.body) && !AngularIsEmpty.isEmpty(res.body.user)) {
				this.user = res.body.user;
				this.disableMoveIn = (this.user.disable_movein === 1) ? true : false;
				if (!AngularIsEmpty.isEmpty(this.user.parent_id) && this.user.parent_id != 0) {
					this.parent_id = this.user.parent_id;
				} else {
					this.parent_id = this.user.user_id;
				}
			}
		}, (error) => {
			if (error) {
				console.log(error);
			}
		});
	}

	/**
	 *
	 * @param ev array of work flowrule
	 */
	workFlowruleArray(ev: any) {
		this.followupRuleArr = ev;
	}

	/**
	 * replace transmit type id to value
	 */
	public transmitTypeValueToId(data): any {
		if (!AngularIsEmpty.isEmpty(data) && data.length > 0) {
			let tempObj;
			data.map((obj) => {
				tempObj = UtilsHelper.transmitTypeArray(obj.api_type);
				Object.keys(tempObj).map((k) => {
					if (tempObj[k].name === obj.transmission_type) {
						obj.transmission_type = tempObj[k].value;
					}
				});
				obj.followup_rule_id = (obj.followup_rule_id === this.locationDefault) ? '' : obj.followup_rule_id;
			});
			return data;

		} else {
			return data;
		}
	}

}
