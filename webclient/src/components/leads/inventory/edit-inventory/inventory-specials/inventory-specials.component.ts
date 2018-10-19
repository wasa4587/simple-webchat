import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { AngularIsEmpty } from 'angularisempty';
import { LeadInventoryProvider } from 'common/lead-inventory/lead-inventory.provider';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'inventory-specials',
	templateUrl: './inventory-specials.component.html',
	styleUrls: [
		'./inventory-specials.component.scss'
	],
	providers: [LeadInventoryProvider]
})
export class InventorySpecialsComponent {

	@Output() handelLoading: EventEmitter<any> = new EventEmitter();
	@Output() onChangeTab: EventEmitter<any> = new EventEmitter();
	@Input() cssClasses: string;
	@Input() location_id: any;
	@Input() parent_id: any;

	public inventoryTypesForm: FormGroup;
	public inventoryDiscountArray: Array<any> = [];
	public inventoryDiscountList: Array<any> = [];
	public showLoading: boolean = false;
	public saveFlag: number = 0;
	public deleteFlag: number = 0;
	public inventoryTypeLableArr: Array<any> = [];
	public inventoryTypeList: Array<any> = [];
	public editinventoryDiscountNameArray: Array<any> = [];
	public inventoryDiscountTypeArray: any = [];
	public allCheckArray: any = [];

	constructor(
		@Inject(DOCUMENT) private document: Document,
		private leadInventoryProvider: LeadInventoryProvider,
		private cp: FormBuilder,
		private router: Router
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
			this.leadInventoryProvider.getInventoryDiscount({ 'locationId': this.location_id }).subscribe((res1) => {
				this.inventoryDiscountList = res1.body.items;
				this.leadInventoryProvider.getInventoryType({ 'locationId': this.location_id }).subscribe((res) => {
					this.showLoading = false;
					this.inventoryTypeLableArr.push('All');
					res.body.items.map((obj) => {
						this.inventoryTypeLableArr.push(obj.type_name);
					});
					this.inventoryTypeList = res.body.items;
					this.inventoryDiscountList.map((obj, i) => {
						this.allCheckArray[i] = { allChecked: false };
						this.inventoryDiscountArray[obj.discount_id] = false;
						if (!AngularIsEmpty.isEmpty(obj.discountType) && obj.discountType.length > 0) {
							if (this.inventoryTypeList.length === obj.discountType.length) {
								this.inventoryDiscountTypeArray[i] = obj.discountType;
							} else {
								this.inventoryDiscountTypeArray[i] = this.createNewArray(obj.discountType, this.inventoryTypeList.length);
							}
						} else {
							this.inventoryDiscountTypeArray[i] = this.createNewArray(this.inventoryTypeList, this.inventoryTypeList.length);
						}
						this.typesProperties.push(this.createInventoryType({ discount_id: obj.discount_id, discount_name: obj.discount_name, allChecked: false, status: 'old' }));
					});
					this.typesProperties.push(this.createInventoryType({ discount_id: '', discount_name: '', allChecked: false, status: 'new' }));
					this.inventoryDiscountTypeArray[this.typesProperties.controls.length - 1] = this.createNewArray(this.inventoryTypeList, this.inventoryTypeList.length);;
					this.allCheckArray[this.typesProperties.controls.length - 1] = { allChecked: false };
					this.inventoryDiscountArray[''] = true;
					this.handelLoading.emit({ status: false });
				}, (error) => {
					this.showLoading = false;
					this.handelLoading.emit({ status: false, 'error': 'Something went wrong, please try again.' });
					if (error) {
						console.log(error);
					}
				});
			}, (error) => {
				this.showLoading = false;
				this.handelLoading.emit({ status: false, 'error': 'Something went wrong, please try again.' });
				if (error) {
					console.log(error);
				}
			});
		}
	}

	createNewArray(arr, totalType) {
		let newArr = [];
		if (arr.length === totalType) {
			arr.map((obj) => {
				newArr.push({
					"inventory_type_id": obj.type_id,
					"has_discount": "0"
				});
			});
		} else {
			newArr = arr.slice(0);
			this.inventoryTypeList.map((obj, i) => {
				if ((arr.length-1) < i) {
					newArr.push({
						"inventory_type_id": obj.type_id,
						"has_discount": "0"
					});
				}
			});

		}
		return newArr;
	}

	/**
	 * create form array for ive extensions
	*/
	createInventoryType(obj): FormGroup {
		return this.cp.group({
			discount_id: obj.discount_id,
			discount_name: [obj.discount_name],
			allChecked: [obj.allChecked],
			status: obj.status
		});
	}

	get typesProperties(): FormArray {
		return this.inventoryTypesForm.get('typesProperties') as FormArray;
	};

	onChangeCheckbox(i, inventory_type_id, status) {
		this.inventoryDiscountTypeArray[i].map((obj) => {
			if (obj.inventory_type_id == inventory_type_id) {
				obj.has_discount = (status === true) ? "1" : "0";
			}
		});
	}

	onCheckAll(i, status) {
		this.inventoryDiscountTypeArray[i].map((obj) => {
			obj.has_discount = (status === true) ? "1" : "0";
		});
		this.allCheckArray[i] = { allChecked: status };
	}

    /**
	 * Remove inventory type
	 */
	removeInventoryType(index: number): void {
		let discount_id = this.inventoryTypesForm.value.typesProperties[index].discount_id;
		if (!AngularIsEmpty.isEmpty(discount_id) && this.deleteFlag === 0) {
			this.deleteFlag = 1;
			this.handelLoading.emit({ status: true });
			this.leadInventoryProvider.deleteInventoryDiscount({ 'locationId': this.location_id, 'discountId': discount_id }).subscribe((res) => {
				this.typesProperties.removeAt(index);
        this.deleteFlag = 0;
        this.allCheckArray.splice(index, 1);
		    this.inventoryDiscountTypeArray.splice(index, 1);
				this.handelLoading.emit({ status: false, 'success': 'Inventory discount deleted successfully.' });
			}, (error) => {
				this.deleteFlag = 0;
				this.handelLoading.emit({ status: false, 'error': 'Something went wrong, please try again.' });
				if (error) {
					console.log(error);
				}
			});
		} else {
      this.allCheckArray.splice(index, 1);
		  this.inventoryDiscountTypeArray.splice(index, 1);
      this.typesProperties.removeAt(index);
		}
	}

    /**
	 * add ivr extensions
	 */
	onAddInventoryTypeProperty() {
		this.typesProperties.push(this.createInventoryType({ discount_id: '', discount_name: '', allChecked: false, status: 'new' }));
		this.inventoryDiscountTypeArray[this.typesProperties.controls.length - 1] = this.createNewArray(this.inventoryTypeList, this.inventoryTypeList.length);
		this.allCheckArray[this.typesProperties.controls.length - 1] = { allChecked: false };

	}

	onEditDiscountName(i) {
		this.editinventoryDiscountNameArray[this.inventoryTypesForm.value.typesProperties[i].discount_id] = this.inventoryTypesForm.value.typesProperties[i];
		this.inventoryDiscountArray[this.inventoryTypesForm.value.typesProperties[i].discount_id] = true;
	}

	cancelDiscount(i: any) {
		this.inventoryTypesForm.value.typesProperties[i].discount_name = this.editinventoryDiscountNameArray[this.inventoryTypesForm.value.typesProperties[i].discount_id].discount_name;
		this.typesProperties.controls[i].get('discount_name').setValue(this.editinventoryDiscountNameArray[this.inventoryTypesForm.value.typesProperties[i].discount_id].discount_name);
		this.inventoryDiscountArray[this.inventoryTypesForm.value.typesProperties[i].discount_id] = false;
	}

	updateDiscount(i: any) {
		this.inventoryDiscountArray[this.inventoryTypesForm.value.typesProperties[i].discount_id] = false;
	}

	back() {
		this.onChangeTab.emit('details');
	}

	/**
     * create record
     * @param ev event
     */
	public save(ev: any) {
		let createArray = [];
		let oldTypeExist = 0;
		let j = 0;
		this.inventoryTypesForm.value.typesProperties.map((obj, i) => {
			if (!AngularIsEmpty.isEmpty(obj.discount_name)) {
				createArray.push({
					"user_id": this.parent_id,
					"discount_id": obj.discount_id,
					"discount_name": obj.discount_name,
					"is_active": 1,
					"discountType": this.inventoryDiscountTypeArray[j++]
				});
			}
		});

		const params: any = {
			'locationId': this.location_id,
			body: createArray
		};
		if (this.saveFlag === 0) {
			this.handelLoading.emit({ status: true });
			this.saveFlag = 1;
			this.leadInventoryProvider.createInventoryDiscount(params).subscribe((res) => {
				this.saveFlag = 0;
				this.handelLoading.emit({ status: false, 'success': 'Inventory discount added successfully.' });
				this.router.navigate(['v2/system-configuration/inventory'])
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
