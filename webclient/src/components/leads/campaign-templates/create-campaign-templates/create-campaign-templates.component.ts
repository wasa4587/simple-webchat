import { Component, Inject, Input, Output, EventEmitter, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { TopToastComponent } from '../../../../../common/presentational/top-toast';
import closeIcon from '../../../../../assets/icon/close-button.svg';
import { LeadCampaignTemplateProvider } from 'common/campaigns-templates/campaigns-templates.provider';
import { AngularIsEmpty } from 'angularisempty';
import { SessionProvider } from 'common/session';
import { UserProvider } from 'common/user';
import { SystemVariablesProvider } from 'common/system-variables';
import * as _ from "lodash";
declare const CKEDITOR: any;
@Component({
    selector: 'create-campaign-templates-modal',
    templateUrl: './create-campaign-templates.component.html',
    styleUrls: [
        './create-campaign-templates.component.scss'
    ],
    providers: [LeadCampaignTemplateProvider, SessionProvider, UserProvider, SystemVariablesProvider]
})
export class CreateCampaignTemplatesModalComponent implements AfterViewInit {

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    @Input() cssClasses: string;
    @Input() title: string;
    @Input() editRecordId: any;

    public isVisible: boolean;
    public closeIcon: string;
    public templateVariableArr: any = [];
    public emailTemplateVariable: any = [];
    public smsTemplateVariable: any = [];
    public customVariable: any = [];
    public errorList: any = [];
    public showLoading: boolean = false;
    public parent_id: number;
    public user: any;
    public name: string = '';
    public nameError: boolean = false;
    public templateTextError: boolean = false;
    public templateTypeArr: any;
    public type: any;
    public is_default: boolean = false;
    public subject: string;
    public template_text: string = '';
    public editRecord: any;
    public config: any = {};
    public smsTextLength: number;
    public smsTextLengthError: boolean = false;
    public template_textarea: string;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private leadCampaignTemplateProvider: LeadCampaignTemplateProvider,
        private sessionProvider: SessionProvider,
        private userProvider: UserProvider,
        private systemVariablesProvider: SystemVariablesProvider,
        private zone: NgZone
    ) { }

    ngOnInit() {
        this.closeIcon = closeIcon;
        this.isVisible = true;
        this.cssClasses = this.cssClasses ? this.cssClasses + ' new-modal' : 'new-modal';
        this.toggleBodyScroll(this.isVisible);
        this.templateTypeArr = [{ key: 'Email', value: 'email' }, { key: 'SMS', value: 'sms' }, { key: 'Other - Email', value: 'other_email' }, { key: 'Other - SMS', value: 'other' }, { key: 'Kiosk Receipt', value: 'kiosk_receipt' }, { key: 'Move in email', value: 'movein_email' }, { key: 'Move out email', value: 'moveout_email' }]
        this.type = 'email';
        this.getVariables();
        if (!AngularIsEmpty.isEmpty(this.editRecordId) && this.editRecordId != 0) {
            this.getRecord(this.editRecordId);
        }
        this.config.height = 330;

        this.config.toolbarGroups = [
            { name: 'clipboard', groups: ['clipboard', 'undo'] },
            { name: 'editing', groups: ['spellchecker'] },  //'find', 'selection',
            { name: 'links' },
            { name: 'insert' },
            { name: 'tools' },
            { name: 'document', groups: ['mode'] },
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
            { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'] },
            { name: 'styles' },
            { name: 'about' }
        ];
        this.config.removeButtons = 'Save,NewPage,Preview,Print,Templates,Smiley,Flash,PageBreak,Iframe,ShowBlocks,Underline,Subscript,Superscript,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Font,FontSize,Language';
    }

    ngAfterViewInit() {
        //         CKEDITOR.instances.editor1.destroy();
        //         let configWithNewToolbar = [['Bold','Italic','Underline',
        // '-','JustifyLeft','JustifyCenter','JustifyRight','-','Undo','Redo']];
        // CKEDITOR.replace('editor1', configWithNewToolbar);
    }

    public onCloseHandler(ev: any): void {
        this.isVisible = false;
        this.toggleBodyScroll(this.isVisible);
        this.onClose.emit(ev);
    }

    /* Helper functions */
    private toggleBodyScroll(isModalVisible: boolean): void {
        let body: any = this.document.querySelectorAll('body');
        let html_: any = this.document.querySelectorAll('html');
        if (body.length > 0) {
            body = body[0];
        } else {
            return;
        }

        if (isModalVisible) {
            body.style.overflow = 'hidden';
            html_[0].style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
            html_[0].style.overflow = '';
        }
    }

    /**
     * haldel template name 
     * @param ev template name
     */
    changeTemplateName(ev: any) {
        let newNameRegex = /^[a-zA-Z0-9\s._-]{2,}$/;
        if (ev.match(newNameRegex) === null) {
            this.nameError = true;
        } else {
            this.nameError = false;
        }
    }

    onChange(ev: any) {
        let text = this.htmlTotext(this.template_text);
        this.smsTextLength = (text.length - 1) > -1 ? text.length - 1 : 0;
        if (AngularIsEmpty.isEmpty(this.template_text)) {
            this.templateTextError = true;
        } else {
            this.templateTextError = false;
        }
        if ((this.type === 'sms' || this.type === 'other') && this.smsTextLength > 400) {
            this.smsTextLengthError = true;
        } else {
            this.smsTextLengthError = false;
        }
    }

    htmlTotext(str) {
        let text = str.replace(/(<([^>]+)>)/g, "");
        text = text.replace(/&nbsp/g, "");
        return text;
    }

    /**
     * save record
     * @param ev event any
     */
    public save(ev: any) {
        this.changeTemplateName(this.name);
        this.onChange(this.template_text);
        if ((this.type === 'sms' || this.type === 'other') && this.smsTextLengthError === true) {
            return;
        }
        if (this.nameError === false && this.templateTextError === false) {
            const params: any = {
                body: {
                    "parent_id": this.parent_id,
                    "name": this.name,
                    "type": this.type,
                    "subject": (this.type != 'sms' || this.type != 'other') ? this.subject : '',
                    "template_text": (this.type === 'sms' || this.type === 'other') ? this.htmlTotext(this.template_text) : this.template_text,
                    "is_active": 1,
                    "is_default": (this.is_default === true) ? 1 : 0
                }
            };
            this.showLoading = true;
            this.leadCampaignTemplateProvider.create(params).subscribe((res) => {
                this.showLoading = false;
                // this.errorList = [{
                //     message: "Record created successfully.",
                //     type: TopToastComponent.SUCCESS
                // }];
                this.onCloseHandler('save');
            }, (err) => {
                this.showLoading = false;
                if (err && '_body' in err) {
                    const parsedError = JSON.parse(err._body);
                    if ('messages' in parsedError) {
                        if (!AngularIsEmpty.isEmpty(parsedError.messages) && parsedError.messages.length > 0 && (typeof parsedError.messages[0] === 'string')) {
                            this.errorList = [{
                                message: parsedError.messages[0],
                                type: TopToastComponent.ERROR
                            }];
                        } else {
                            let msg = '';
                            parsedError.messages[0].map((error, i) => {
                                (i != 0) ? msg = msg + ', ' : '';
                                msg = msg + error;
                            });
                            this.errorList = [{
                                message: msg,
                                type: TopToastComponent.ERROR
                            }];
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
    }

    /**
     * save record
     * @param ev event any
     */
    public update(ev: any) {
        this.changeTemplateName(this.name);
        this.onChange(this.template_text);
        if ((this.type === 'sms' || this.type === 'other') && this.smsTextLengthError === true) {
            return;
        }
        if (this.nameError === false && this.templateTextError === false) {
            this.editRecord.name = this.name;
            this.editRecord.type = this.type;
            this.editRecord.subject = (this.type != 'sms' || this.type != 'other') ? this.subject : '';
            this.editRecord.template_text = (this.type === 'sms' || this.type === 'other') ? this.htmlTotext(this.template_text) : this.template_text;
            this.editRecord.is_default = (this.is_default === true) ? 1 : 0;
            const params: any = {
                body: this.editRecord,
                templateId: this.editRecordId
            };
            this.showLoading = true;
            this.leadCampaignTemplateProvider.update(params).subscribe((res) => {
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
    }

    /**
   * Get system and customer variable
   */
    private getVariables() {
        this.showLoading = true;
        this.systemVariablesProvider.getAll({}).subscribe((res) => {
            if (!AngularIsEmpty.isEmpty(res) && !AngularIsEmpty.isEmpty(res.body)) {
                if (!AngularIsEmpty.isEmpty(res.body.email_template_variables)) {
                    this.emailTemplateVariable = _.values(res.body.email_template_variables).map((k) => { return { 'name': k } });
                }
                if (!AngularIsEmpty.isEmpty(res.body.sms_template_variables)) {
                    this.smsTemplateVariable = _.values(res.body.sms_template_variables).map((k) => { return { 'name': k } });
                }
            }
            this.sessionProvider.getOne({}).subscribe((res1) => {
                if (!AngularIsEmpty.isEmpty(res1) && !AngularIsEmpty.isEmpty(res1.body) && !AngularIsEmpty.isEmpty(res1.body.user)) {
                    this.user = res1.body.user;
                    if (!AngularIsEmpty.isEmpty(this.user.parent_id) && this.user.parent_id != 0) {
                        this.parent_id = this.user.parent_id;
                    } else {
                        this.parent_id = this.user.user_id;
                    }
                    this.userProvider.getOne({ id: this.parent_id }).subscribe((res2) => {
                        this.showLoading = false;
                        this.changeTemplateType('update');
                        if (!AngularIsEmpty.isEmpty(res2) && !AngularIsEmpty.isEmpty(res2.body)) {
                            this.customVariable = JSON.parse(res2.body.custom_variables).custom_variables
                            this.templateVariableArr = this.customVariable.concat(this.emailTemplateVariable);
                        }
                    }, (error) => {
                        this.showLoading = false;
                        if (error) {
                            console.log(error);
                        }
                    });
                }
            }, (error) => {
                this.showLoading = false;
                if (error) {
                    console.log(error);
                }
            });
        }, (error) => {
            this.showLoading = false;
            if (error) {
                console.log(error);
            }
        });
    }


    public toastIsHidden(ev) {
        if (ev.length > 0) {
            this.errorList = [];
        }
    }

    public getRecord(id) {
        // this.showLoading = true;
        this.leadCampaignTemplateProvider.getOne({ templateId: id }).subscribe((res) => {
            // this.showLoading = false;
            if (!AngularIsEmpty.isEmpty(res) && !AngularIsEmpty.isEmpty(res.body)) {
                this.editRecord = res.body;
                this.name = res.body.name;
                this.type = res.body.type;
                this.subject = res.body.subject;
                this.template_text = res.body.template_text;
                this.is_default = (res.body.is_default === 1) ? true : false;
            }
        }, (error) => {
            // this.showLoading = false;
            if (error) {
                console.log(error);
            }
        });
    }

    /**
     * haldle change template type 
     * @param ev selected value of template type
     */
    changeTemplateType(ev: any) {
        if (!AngularIsEmpty.isEmpty(this.type) && (this.type === 'sms' || this.type === 'other')) {
            this.templateVariableArr = this.customVariable.concat(this.smsTemplateVariable);
            if (!AngularIsEmpty.isEmpty(CKEDITOR.instances.editor1)) {
                CKEDITOR.instances.editor1.destroy();
            }
            window['CKEDITOR']['replace']('editor1', { toolbarGroups: [], height: this.config.height })['on']('change', (evt) => {
                this.zone.run(() => {
                    this.template_text = evt.editor.getData();
                    this.onChange(evt);
                });
            });
            CKEDITOR.instances.editor1.setData(this.template_text);
        } else {
            this.templateVariableArr = this.customVariable.concat(this.emailTemplateVariable);
            if (!AngularIsEmpty.isEmpty(CKEDITOR.instances.editor1)) {
                CKEDITOR.instances.editor1.destroy();
            }
            window['CKEDITOR']['replace']('editor1', { height: this.config.height, toolbarGroups: this.config.toolbarGroups, removeButtons: this.config.removeButtons })['on']('change', (evt) => {
                this.zone.run(() => {
                    this.template_text = evt.editor.getData();
                    this.onChange(evt);
                });
            });
            CKEDITOR.instances.editor1.setData(this.template_text);
        }
        if (!AngularIsEmpty.isEmpty(this.type) && (this.type != 'email')) {
            this.onChange(ev);
        }
    }

    /**
     * handel merge message and varibale button 
     * @param selectedOptions array of selected variable
     */
    selectVariable(selectedOptions) {
        selectedOptions = _.map(selectedOptions).join('');
        CKEDITOR.instances.editor1.insertHtml(selectedOptions);
    }
}
