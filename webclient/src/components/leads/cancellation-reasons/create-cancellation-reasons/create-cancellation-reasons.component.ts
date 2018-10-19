import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import closeIcon from '../../../../../assets/icon/close-button.svg';
import { CancellationReasonProvider } from 'common/cancellation-reasons';
import { AngularIsEmpty } from 'angularisempty';
import { TopToastComponent } from '../../../../../common/presentational/top-toast';
import { InputValidationComponent } from '../../../../common/presentational/inputs/input-validation';

@Component({
    selector: 'create-cancellation-reasons-modal',
    templateUrl: './create-cancellation-reasons.component.html',
    styleUrls: [
        './create-cancellation-reasons.component.scss'
    ],
    providers: [CancellationReasonProvider]
})
export class CreateCancellationReasonModalComponent {

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @Input() cssClasses: string;
    @Input() title: string;
    @Input() editRecordId: any;

    public isVisible: boolean;
    public closeIcon: string;
    public description: string = '';
    public user: any;
    public parent_id: any;
    public errorList: Array<any>;
    public showLoading: boolean = false;
    public api_type: any;
    public custom_id: any;
    public apiTypeArray: Array<any>;
    public tooltipTextName: String;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private cancellationReasonProvider: CancellationReasonProvider
    ) { }

    ngOnInit() {
        this.apiTypeArray = [{ key: 'Centershift', value: 3 }, { key: 'Sitelink', value: 1 }, { key: 'Other', value: 0 }];
        this.api_type = "";
        this.errorList = [];
        this.closeIcon = closeIcon;
        this.isVisible = true;
        this.cssClasses = this.cssClasses ? this.cssClasses + ' new-modal' : 'new-modal';
        this.toggleBodyScroll(this.isVisible);
        if (!AngularIsEmpty.isEmpty(this.editRecordId) && this.editRecordId != 0) {
            this.getRecord(this.editRecordId);
        }
        this.custom_id = 0;
    }

    public onCloseHandler(ev: any): void {
        this.isVisible = false;
        this.toggleBodyScroll(this.isVisible);
        this.onClose.emit(ev);
    }

    /* Helper functions */
    private toggleBodyScroll(isModalVisible: boolean): void {
        let body: any = this.document.querySelectorAll('body');

        if (body.length > 0) {
            body = body[0];
        } else {
            return;
        }

        if (isModalVisible) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }

    /**
     * save record
     * @param ev event any
     */
    public save(ev: any) {
        this.checkValidation((validFlag) => {
            if (validFlag === true) {
                const params: any = {
                    body: {
                        "api_type": this.api_type,
                        "custom_id": this.custom_id,
                        "description": this.description
                    }
                };
                this.showLoading = true;
                this.cancellationReasonProvider.create(params).subscribe((res) => {
                    this.showLoading = false;
                    this.errorList = [{
                        message: "Record created successfully.",
                        type: TopToastComponent.SUCCESS
                    }];
                    this.onCloseHandler('save');
                }, (err) => {
                    this.showLoading = false;
                    if (err && '_body' in err) {
                        const parsedError = JSON.parse(err._body);
                        if ('messages' in parsedError) {
                            if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
                                this.errorList = parsedError.messages.map(error => {
                                    return {
                                        message: error,
                                        type: TopToastComponent.ERROR
                                    };
                                });
                            }
                        } else if ('status' in parsedError && parsedError.status === 'ERROR') {
                            if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
                                this.errorList = parsedError.messages.map(error => {
                                    return {
                                        message: error,
                                        type: TopToastComponent.ERROR
                                    };
                                });
                            }
                        }
                    }
                });
            }
        });

    }

    /**
     * save record
     * @param ev event any
     */
    public update(ev: any) {
        this.checkValidation((validFlag) => {
            if (validFlag === true) {
                const params: any = {
                    body: {
                        "api_type": this.api_type,
                        "custom_id": this.custom_id,
                        "description": this.description
                    },
                    id: this.editRecordId
                };
                this.showLoading = true;
                this.cancellationReasonProvider.update(params).subscribe((res) => {
                    this.showLoading = false;
                    this.errorList = [{
                        message: "Record update successfully.",
                        type: TopToastComponent.SUCCESS
                    }];
                    this.onCloseHandler('update');
                }, (err) => {
                    this.showLoading = false;
                    if (err && '_body' in err) {
                        const parsedError = JSON.parse(err._body);
                        if ('messages' in parsedError) {
                            if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
                                this.errorList = parsedError.messages.map(error => {
                                    return {
                                        message: error,
                                        type: TopToastComponent.ERROR
                                    };
                                });
                            }
                        } else if ('status' in parsedError && parsedError.status === 'ERROR') {
                            if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0) {
                                this.errorList = parsedError.messages.map(error => {
                                    return {
                                        message: error,
                                        type: TopToastComponent.ERROR
                                    };
                                });
                            }
                        }
                    }
                });
            }
        });
    }


    public toastIsHidden(ev) {
        if (ev.length > 0) {
            this.errorList = [];
        }
    }

    public getRecord(id) {
        this.showLoading = true;
        this.cancellationReasonProvider.getOne({ id: id }).subscribe((res) => {
            this.showLoading = false;
            if (!AngularIsEmpty.isEmpty(res) && !AngularIsEmpty.isEmpty(res.body)) {
                this.description = res.body.description;
                this.api_type = res.body.api_type;
                this.custom_id = res.body.custom_id;
            }
        }, (error) => {
            this.showLoading = false;
            if (error) {
                console.log(error);
            }
        });
    }

    /**
     * haldel change api type
     */
    public apiTypeSelect(ev: any, field) {
        if (this.api_type === 3) {
            this.custom_id = '';
        }
        if (this.api_type === 0 || this.api_type === "") {
            this.custom_id = 0;
        }
    }


	/**
	 * Validates the new call route cascade time.
	 *
	 * @param {string} value - Value of the DOM input.
	 * @returns {boolean}
	 *
	 * @memberOf CallRoutesComponent
	 */
    public isNewCustomeIdValid(value: string): boolean {
        let newCallCustomeIdRegex = /^\d{1,2}$/gi;
        let newCallCustomeId;

        if (value.match(newCallCustomeIdRegex) === null) {
            return false;
        }
        newCallCustomeId = parseInt(value, 10);
        if (newCallCustomeId <= 0) {
            return false;
        }

        return true;
    }

	/**
	 * Handles the change event of the new call route cascade time.
	 *
	 * @param {*} event
	 * @returns {void}
	 *
	 * @memberOf CallRoutesComponent
	 */
    public onCustomeIdChange(event: any): void {
        if (event.isValid) {
            this.custom_id = parseInt(event.value, 10);
        }
        return;
    }


	/**
	 * Validates the new call route cascade time.
	 *
	 * @param {string} value - Value of the DOM input.
	 * @returns {boolean}
	 *
	 * @memberOf CallRoutesComponent
	 */
    public isDescriptionValid(value: string): boolean {
        if (AngularIsEmpty.isEmpty(value)) {
            return false;
        }
        return true;
    }

	/**
	 * Handles the change event of the new call route cascade time.
	 *
	 * @param {*} event
	 * @returns {void}
	 *
	 * @memberOf CallRoutesComponent
	 */
    public onDescriptionChange(event: any): void {
        if (event.isValid) {
            this.description = event.value;
        }
        return;
    }


    /**
     * check char is number only
     * @param event 
     */
    public onlyNumberKey(event) {
        return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
    }

    checkValidation(callback) {
        if (AngularIsEmpty.isEmpty(this.api_type)) {
            this.errorList = [{
                message: "Please select api type",
                type: TopToastComponent.ERROR
            }];
            callback(false);
        } else if (AngularIsEmpty.isEmpty(this.custom_id)) {
            this.errorList = [{
                message: "Please enter api id",
                type: TopToastComponent.ERROR
            }];
            callback(false);
        } else if (AngularIsEmpty.isEmpty(this.description)) {
            this.errorList = [{
                message: "Description is required",
                type: TopToastComponent.ERROR
            }];
            callback(false);
        } else {
            callback(true);
        }
    }

}
