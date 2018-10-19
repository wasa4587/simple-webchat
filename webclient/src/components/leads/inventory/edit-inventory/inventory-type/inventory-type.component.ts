import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { AngularIsEmpty } from 'angularisempty';
import { LeadInventoryProvider } from 'common/lead-inventory/lead-inventory.provider';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
	selector: 'inventory-type',
	templateUrl: './inventory-type.component.html',
	styleUrls: [
		'./inventory-type.component.scss'
	],
	providers: [LeadInventoryProvider]
})
export class InventoryTypeComponent {

	@Output() handelLoading: EventEmitter<any> = new EventEmitter();
	@Output() onChangeTab: EventEmitter<any> = new EventEmitter();
	@Input() cssClasses: string;
	@Input() location_id: any;
	@Input() parent_id: any;

	public inventoryTypesForm: FormGroup;
	public inventoryTypeArray: Array<any> = [];
	public editInventoryTypeArray: Array<any> = [];
	public showLoading: boolean = false;
	public saveFlag: number = 0;
	public updateFlag: number = 0;
	public deleteFlag: number = 0;

	constructor(
		@Inject(DOCUMENT) private document: Document,
		private leadInventoryProvider: LeadInventoryProvider,
		private cp: FormBuilder
	) {
	}

	ngOnInit() {
		this.getInventoryType();
		/**
		* add default one ivr extensions
		*/
		this.inventoryTypesForm = this.cp.group({
			typesProperties: this.cp.array([])
		});
	}

	/**
     * Get active user list
     */
	public getInventoryType() {
		if (!AngularIsEmpty.isEmpty(this.location_id)) {
			this.showLoading = true;
			this.leadInventoryProvider.getInventoryType({ 'locationId': this.location_id }).subscribe((res) => {
				this.showLoading = false;
				res.body.items.map((obj) => {
					this.inventoryTypeArray[obj.type_id] = false;
					this.typesProperties.push(this.createInventoryType({ type_id: obj.type_id, type_name: obj.type_name, status: 'old' }));
				});
				this.typesProperties.push(this.createInventoryType({ type_id: '', type_name: '', status: 'new' }));
				this.inventoryTypeArray[''] = true;
				this.handelLoading.emit({ status: false });
			}, (error) => {
				this.showLoading = false;
				this.handelLoading.emit({ status: false, 'error': 'Something went wrong, please try again.' });
				if (error) {
					console.log(error);
				}
			});
		}
	}

	/** 
	 * create form array for ive extensions
	*/
	createInventoryType(obj): FormGroup {
		return this.cp.group({
			type_id: [obj.type_id],
			type_name: [obj.type_name, Validators.required],
			status: obj.status
		});
	}

	get typesProperties(): FormArray {
		return this.inventoryTypesForm.get('typesProperties') as FormArray;
	};

    /**
	 * Remove inventory type
	 */
	removeInventoryType(index: number): void {
		let type_id = this.inventoryTypesForm.value.typesProperties[index].type_id;
		if (!AngularIsEmpty.isEmpty(type_id) && this.deleteFlag === 0) {
			this.deleteFlag = 1;
			this.handelLoading.emit({ status: true });
			this.leadInventoryProvider.deleteInventoryType({ 'locationId': this.location_id, 'typeId': type_id }).subscribe((res) => {
				this.typesProperties.removeAt(index);
				this.deleteFlag = 0;
				this.handelLoading.emit({ status: false, 'success': 'Inventory type delete successfully.' });
			}, (error) => {
				this.deleteFlag = 0;
				this.handelLoading.emit({ status: false, 'error': 'Something went wrong, please try again.' });
				if (error) {
					console.log(error);
				}
			});
		} else {
			this.typesProperties.removeAt(index);
		}
	}

    /**
	 * add ivr extensions
	 */
	onAddInventoryTypeProperty() {
		this.typesProperties.push(this.createInventoryType({ type_id: '', type_name: '', status: 'new' }));
	}

	onEditTypes(i) {
		this.editInventoryTypeArray[this.inventoryTypesForm.value.typesProperties[i].type_id] = this.inventoryTypesForm.value.typesProperties[i];
		this.inventoryTypeArray[this.inventoryTypesForm.value.typesProperties[i].type_id] = true;
	}

	updateType(i: any) {
		let type_id = this.inventoryTypesForm.value.typesProperties[i].type_id;
		if (!AngularIsEmpty.isEmpty(type_id) && this.updateFlag === 0) {
			this.updateFlag = 1;
			const params = {
				body: { 'type_name': this.inventoryTypesForm.value.typesProperties[i].type_name },
				'locationId': this.location_id,
				'typeId': type_id
			}
			this.handelLoading.emit({ status: true });
			this.leadInventoryProvider.updateInventoryType(params).subscribe((res) => {
				this.updateFlag = 0;
				this.inventoryTypeArray[this.inventoryTypesForm.value.typesProperties[i].type_id] = false;
				this.handelLoading.emit({ status: false });
			}, (err) => {
				this.updateFlag = 0;
				if (err && '_body' in err) {
					const parsedError = JSON.parse(err._body);
					if ('message' in parsedError) {
						if (!AngularIsEmpty.isEmpty(parsedError.message) && parsedError.message.length > 0) {
							let errorMsg = '';
							parsedError.messages.map(error => {
								errorMsg = errorMsg + error;
							});
							this.handelLoading.emit({ status: false, 'error': errorMsg });
						}
					} else if ('status' in parsedError && parsedError.status === 'ERROR') {
						if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
							let errorMsg = '';
							parsedError.messages.map(error => {
								errorMsg = errorMsg + error;
							});
							this.handelLoading.emit({ status: false, 'error': errorMsg });
						}
					} else {
						this.handelLoading.emit({ status: false, 'error': 'Something went wrong, please try again.' });
					}
					if (err) {
						console.log(err);
					}
				}
			});
		}
	}

	cancelType(i: any) {
		this.inventoryTypesForm.value.typesProperties[i].type_name = this.editInventoryTypeArray[this.inventoryTypesForm.value.typesProperties[i].type_id].type_name;
		this.typesProperties.controls[i].get('type_name').setValue(this.editInventoryTypeArray[this.inventoryTypesForm.value.typesProperties[i].type_id].type_name);
		this.inventoryTypeArray[this.inventoryTypesForm.value.typesProperties[i].type_id] = false;
	}

	/**
     * create record
     * @param ev event
     */
	public save(ev: any) {
		let createArray = [];
		let oldTypeExist = 0;
		this.inventoryTypesForm.value.typesProperties.map((obj) => {
			if (!AngularIsEmpty.isEmpty(obj.type_name) && obj.status === 'new') {
				createArray.push({ "type_name": obj.type_name, "user_id": this.parent_id, "is_active": 1 });
			} else {
				if (!AngularIsEmpty.isEmpty(obj.type_name) && obj.status === 'old') {
					oldTypeExist = 1;
				}
			}
		});
		if (oldTypeExist === 0 && (AngularIsEmpty.isEmpty(createArray) || createArray.length === 0)) {
			this.handelLoading.emit({ status: false, 'error': 'Please create an inventory type first.' });
			return;
		}
		if (createArray.length === 0) {
			this.onChangeTab.emit('details');
			return;
		}
		const params: any = {
			'locationId': this.location_id,
			body: createArray
		};
		if (this.saveFlag === 0) {
			this.handelLoading.emit({ status: true });
			this.saveFlag = 1;
			this.leadInventoryProvider.createInventoryType(params).subscribe((res) => {
				this.saveFlag = 0;
				this.handelLoading.emit({ status: false, 'success': 'Inventory type added successfully.' });
				this.onChangeTab.emit('details');
			}, (err) => {
				this.saveFlag = 0;
				if (err && '_body' in err) {
					const parsedError = JSON.parse(err._body);
					if ('message' in parsedError) {
						if (!AngularIsEmpty.isEmpty(parsedError.message) && parsedError.message.length > 0) {
							let errorMsg = '';
							parsedError.messages.map(error => {
								errorMsg = errorMsg + error;
							});
							this.handelLoading.emit({ status: false, 'error': errorMsg });
						}
					} else if ('status' in parsedError && parsedError.status === 'ERROR') {
						if (!AngularIsEmpty.isEmpty(parsedError.data) && !AngularIsEmpty.isEmpty(parsedError.data.error) && parsedError.data.error.length > 0) {
							let errorMsg = '';
							parsedError.data.error.map(error => {
								errorMsg = errorMsg + error.message;
							});
							this.handelLoading.emit({ status: false, 'error': errorMsg });
						}
					}
				}
			});
		}
	}


}
