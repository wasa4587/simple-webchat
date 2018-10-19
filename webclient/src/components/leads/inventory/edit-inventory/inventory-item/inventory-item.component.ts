import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { AngularIsEmpty } from 'angularisempty';
import { LeadInventoryProvider } from 'common/lead-inventory/lead-inventory.provider';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
	selector: 'inventory-item',
	templateUrl: './inventory-item.component.html',
	styleUrls: [
		'./inventory-item.component.scss'
	],
	providers: [LeadInventoryProvider]
})
export class InventoryItemComponent {

	@Output() handelLoading: EventEmitter<any> = new EventEmitter();
	@Output() onChangeTab: EventEmitter<any> = new EventEmitter();
	@Input() cssClasses: string;
	@Input() location_id: any;
	@Input() parent_id: any;

	public itemsForm: FormGroup;
	public inventoryItemArray: Array<any> = [];
	public showLoading: boolean = false;
	public saveFlag: number = 0;
	public deleteFlag: number = 0;
	public inventoryType: any;
	public listData: Array<any> = [];

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
		this.itemsForm = this.cp.group({
			itemsProperties: this.cp.array([])
		});
		this.inventoryType = '';
	}

	/**
     * Get active user list
     */
	public getInventoryType() {
		if (!AngularIsEmpty.isEmpty(this.location_id)) {
			this.showLoading = true;
			this.leadInventoryProvider.getInventoryType({ 'locationId': this.location_id }).subscribe((res) => {
				this.showLoading = false;
				this.inventoryItemArray = res.body.items;
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
	createFormControll(obj): FormGroup {
		return this.cp.group({
			item_id: obj.item_id,
			item_name: [obj.item_name, Validators.required],
			qty_total: [obj.qty_total, Validators.required],
			qty_avail: [obj.qty_avail, Validators.required],
			price: [obj.price, Validators.required],
			imageType: obj.imageType
		});
	}

	/**
	 * Handel on change inventory
	 * @param ev event any
	 */
	inventoryTypeChange(ev: any) {
		this.itemsForm = this.cp.group({
			itemsProperties: this.cp.array([])
		});
		if (!AngularIsEmpty.isEmpty(this.inventoryType)) {
			this.showLoading = true;
			this.handelLoading.emit({ status: true });
			this.leadInventoryProvider.getInventoryItem({ 'typeId': this.inventoryType }).subscribe((res) => {
        this.showLoading = false;
        if (res.body.items) {
          res.body.items.sort((a, b) => {
            return a.item_indx - b.item_indx;
          });
        }
				res.body.items.map((obj) => {
					this.itemsProperties.push(this.createFormControll({ item_id: obj.item_id, item_name: obj.item_name, qty_total: obj.qty_total, qty_avail: obj.qty_avail, price: obj.price, imageType: 'delete' }));
				});
				this.itemsProperties.push(this.createFormControll({ item_id: '', item_name: '', qty_total: '', qty_avail: '', price: '', imageType: 'new' }));
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

	get itemsProperties(): FormArray {
		return this.itemsForm.get('itemsProperties') as FormArray;
	};

    /**
	 * Remove ivr extension when ivr edit
	 */
	removeProperty(index: number): void {
		let item_id = this.itemsForm.value.itemsProperties[index].item_id;
		let type_id = this.itemsForm.value.itemsProperties[index].type_id;
		if (!AngularIsEmpty.isEmpty(type_id) && !AngularIsEmpty.isEmpty(item_id) && this.deleteFlag === 0) {
			this.deleteFlag = 1;
			this.leadInventoryProvider.deleteInventoryItem({ 'typeId': type_id, 'itemId': item_id }).subscribe((res) => {
				this.itemsProperties.removeAt(index);
				this.deleteFlag = 0;
			}, (error) => {
				this.deleteFlag = 0;
				this.handelLoading.emit({ status: false, 'error': 'Something went wrong, please try again.' });
				if (error) {
					console.log(error);
				}
			});
		} else {
			this.itemsProperties.removeAt(index);
		}
	}

    /**
	 * add ivr extensions
	 */
	onAddProperty(index) {
		let imageType = 'delete';
		if (this.itemsProperties.controls.length - 1 === index) {
			imageType = 'new';
			this.itemsProperties.controls[this.itemsProperties.controls.length - 1].get('imageType').setValue('delete');
		}
		this.itemsProperties.push(this.createFormControll({ item_id: '', item_name: '', qty_total: '', qty_avail: '', price: '', imageType: imageType }));
	}

	onlyNumber(event: any) {
		var key = window.event ? event.keyCode : event.which;
		if (event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 110) {
			return true;
		} else if (key >= 48 && key <= 57) {
			return true;
		} else {
			return false;
		}
	}

	onUpdatePriority(index, action) {
		if (action === 'up') {
			this.arrayMove(this.itemsProperties.controls, index, index - 1);
			this.arrayMove(this.itemsForm.value.itemsProperties, index, index - 1);
		} else {
			this.arrayMove(this.itemsProperties.controls, index, index + 1);
			this.arrayMove(this.itemsForm.value.itemsProperties, index, index + 1);
		}
	}

	arrayMove(arr, fromIndex, toIndex) {
		var element = arr[fromIndex];
		arr.splice(fromIndex, 1);
		arr.splice(toIndex, 0, element);
	}

	back() {
		this.onChangeTab.emit('type');
	}

	/**
     * create record
     * @param ev event
     */
	public save(ev: any) {
		let len = this.itemsForm.value.itemsProperties.length;
		let validatorFlag = 0;
		this.itemsForm.value.itemsProperties.map((obj, i) => {
			if (((len - 1) != i || i===0  ) && (AngularIsEmpty.isEmpty(obj.item_name) || AngularIsEmpty.isEmpty(obj.qty_total) || AngularIsEmpty.isEmpty(obj.qty_avail) || AngularIsEmpty.isEmpty(obj.price))) {
				validatorFlag = 1;
			}
		});
		if (validatorFlag === 1) {
			let msg = (this.itemsProperties.controls.length === 1) ? 'Please fill up the row' : 'Blank row cannot have high priority than existing row ';
			this.handelLoading.emit({ status: false, 'error': msg });
			return;
		}
		let createArray = [];
		this.itemsForm.value.itemsProperties.map((obj, i) => {
			if (!AngularIsEmpty.isEmpty(obj.item_name)) {
				createArray.push({
					"item_id": obj.item_id,
					"type_id": obj.type_id,
					"item_indx": i,
					"user_id": this.parent_id,
					"item_name": obj.item_name,
					"qty_total": obj.qty_total,
					"qty_avail": obj.qty_avail,
					"price": obj.price
				});
			}
		});
		const params: any = {
			body: createArray,
			"typeId": this.inventoryType
		};
		if (this.saveFlag === 0) {
			this.handelLoading.emit({ status: true });
			this.saveFlag = 1;
			this.leadInventoryProvider.createInventoryItem(params).subscribe((res) => {
				this.saveFlag = 0;
				this.handelLoading.emit({ status: false, 'success': 'Inventory item added successfully.' });
				this.onChangeTab.emit('specials');
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
