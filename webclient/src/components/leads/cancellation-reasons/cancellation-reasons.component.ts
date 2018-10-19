import { Component, Output, EventEmitter } from '@angular/core';
import { TopToastComponent } from '../../../../common/presentational/top-toast';
import { InputValidationComponent } from '../../../../common/presentational/inputs/input-validation';
import { AngularIsEmpty } from 'angularisempty';
import { CancellationReasonProvider } from 'common/cancellation-reasons';

enum VariableType {
	ACTIVE,
	ARCHIVED,
	ALL
};

@Component({
	selector: 'cancellation-reasons',
	templateUrl: './cancellation-reasons.component.html',
	styleUrls: [
		'./cancellation-reasons.component.scss'
	],
	providers: [
		CancellationReasonProvider
	],
})
export class CancellationReasonsComponent {
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
	public newRecordModalTitle: string = 'New Reason';
	public editRecordId: number = 0;
	public apiTypeArr = {
		0: 'Other',
		1: 'Sitelink',
		3: 'Centershift'
	};
	public isWarningModalVisible: boolean = false;

	constructor(
		private cancellationReasonProvider: CancellationReasonProvider
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
			this.matchName(item, this.searchValue, 'api_type') || this.matchName(item, this.searchValue, 'custom_id') || this.matchName(item, this.searchValue, 'description')
		);
	}

	/**
	 * Filter the location by location name
	 */
	private matchName(item: any, searchValue: string, fieldName): boolean {
		let searchName;
		if (fieldName === 'api_type') {
			searchName = AngularIsEmpty.isEmpty(item[fieldName]) ? '' : ((this.apiTypeArr[item[fieldName]]).toString()).toUpperCase();
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
		this.searchValue = this.searchValue.trim();
		this.filterDatas();
	}

	/**
	 * Handler for delete button
	 */
	public onArchive() {
		const data = this.checked.map(index => {
			const obj = this.filteredDatas.filter((record) => {
				return record.id === index;
			});
			return obj[0].id;
		});
		if (!AngularIsEmpty.isEmpty(data) && data.length > 0) {
			this.showLoading = true;
			this.deleteRecord(data, 0);
		}
	}

	/**
	 * filter 
	 * @param type filter type
	 */
	public filter(type: VariableType): void {
		this.checked = [];
		this.type = type;
		this.showLoading = true;
		this.searchValue = '';
		return;
	}

	/**
	 * Delete records
	 * @param data selected record's id array
	 * @param index number 
	 */
	public deleteRecord(data, index) {
		if (data.length > index) {
			const params: any = {
				id: data[index]
			};
			this.cancellationReasonProvider.delete(params).subscribe((res) => {
				index++;
				this.deleteRecord(data, index);
			}, (err) => {
				index++;
				this.deleteRecord(data, index);
				if (err && '_body' in err) {
					const parsedError = JSON.parse(err._body);
					if ('data' in parsedError && 'error' in parsedError.data) {
						this.errorList = parsedError.data.error.map(error => {
							return {
								message: error.message,
								type: TopToastComponent.ERROR
							};
						});
					} else if ('status' in parsedError && parsedError.status === 'ERROR') {
						this.errorList = parsedError.messages.map(error => {
							return {
								message: error,
								type: TopToastComponent.ERROR
							};
						});
					}
				}
			});
		} else {
			this.checked = [];
			this.showLoading = false;
			this.checkedAll = false;
			this.refresh = Date.now();
			this.searchValue = '';
			this.errorList = [{
				message: "Records deleted successfully.",
				type: TopToastComponent.SUCCESS
			}];
		}
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
		this.editRecordId = id;
		this.isCreateModalVisible = true;
		return;
	}

	public onNewButtonClick() {
		this.editRecordId = 0;
		this.isCreateModalVisible = true;
		return;
	}

	public onCreateModalClose(event: any): void {
		if (event === 'save' || event === 'update') {
			this.refresh = Date.now();
			this.checked = [];
			this.checkedAll = false;
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
