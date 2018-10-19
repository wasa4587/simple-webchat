import { Component, Output, EventEmitter } from '@angular/core';
import { TopToastComponent } from '../../../../common/presentational/top-toast';
import { InputValidationComponent } from '../../../../common/presentational/inputs/input-validation';
import { AngularIsEmpty } from 'angularisempty';
import { LeadCampaignTemplateProvider } from 'common/campaigns-templates/campaigns-templates.provider';

enum VariableType {
	ACTIVE,
	ARCHIVED,
	ALL
};

@Component({
	selector: 'campaign-templates',
	templateUrl: './campaign-templates.component.html',
	styleUrls: [
		'./campaign-templates.component.scss'
	],
	providers: [
		LeadCampaignTemplateProvider
	],
})
export class CampaignTemplatesComponent {
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
	public editRecordId: any;
	public newLeadTypeModalTitle: string = 'Configure Campaign Template';
	public isWarningModalVisible: boolean = false;

	constructor(
		private leadCampaignTemplateProvider: LeadCampaignTemplateProvider
	) { }
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
	 * Filter the location by search text
	 */
	public filterDatas() {
		this.filteredDatas = this.recordLists.filter((item) =>
			this.matchName(item, this.searchValue, 'name') || this.matchName(item, this.searchValue, 'type')
		);
	}

	/**
	 * Filter the location by location name
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

	/**
	 * Handler for archive/unarchive button
	 */
	public onArchive() {
		const data = this.checked.map(index => {
			const obj = this.filteredDatas.filter((record) => {
				return record.template_id === index;
			});
			obj[0].is_active = this.type === VariableType.ACTIVE ? 0 : 1;
			return obj[0];
		});
		const params: any = {
			body: data
		};
		this.showLoading = true;
		this.leadCampaignTemplateProvider.updateBulk(params).subscribe((res) => {
			this.checked = [];
			this.showLoading = false;
			this.checkedAll = false;
			this.searchValue = '';
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
				this.checked = this.filteredDatas.map((item, index) => item.template_id);
			} else {
				this.checked = [];
			}
		}
	}

	public onEditMode(id: any) {
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
		this.editRecordId = 0;
		this.isCreateModalVisible = true;
		return;
	}

	public onCreateModalClose(event: any): void {
		if (event === 'save' || event === 'update') {
			this.refresh = Date.now();
			this.searchValue = '';
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
   * Show Warning/Error modal
   */
	public displayModal(ev: any): void {
		if (ev) {
			ev.preventDefault();
		}
		this.isWarningModalVisible = true;
	}

	/**
	 * User confirms he want to delete a record
	 */
	public onConfirm($event): void {
		this.hideModal($event);
		this.onArchive();
	}

	/**
	 * Hide Warning/Error modal
	 */
	public hideModal(ev: any): void {
		if (ev) {
			ev.preventDefault();
		}
		this.isWarningModalVisible = false;
	}

	/**
	* Cancel for modal
	*/
	public onCancel($event, type: string): void {
		this.hideModal($event);
	}
}
