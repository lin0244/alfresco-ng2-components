/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivitiContentService } from 'ng2-activiti-form';
import { AlfrescoTranslationService } from 'ng2-alfresco-core';

@Component({
    selector: 'adf-create-task-attachment',
    styleUrls: ['./adf-create-task-attachment.component.css'],
    templateUrl: './adf-create-task-attachment.component.html'
})
export class ActivitiCreateTaskAttachmentComponent implements OnChanges {

    @Input()
    public taskId: string;

    @Output()
    public error: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public success: EventEmitter<any> = new EventEmitter<any>();

    constructor(private translateService: AlfrescoTranslationService,
                private activitiContentService: ActivitiContentService) {

        if (translateService) {
            translateService.addTranslationFolder('ng2-activiti-tasklist', 'node_modules/ng2-activiti-tasklist/src');
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.taskId && changes.taskId.currentValue) {
            this.taskId = changes.taskId.currentValue;
        }
    }

    public onFileUpload(event: any): void {
        let filesList: File[] = event.detail.files;

        for (let fileInfoObj of filesList) {
            let file: File = fileInfoObj.file;
            this.activitiContentService.createTaskRelatedContent(this.taskId, file).subscribe(
                (res) => {
                    this.success.emit(res);
                },
                (err) => {
                    this.error.emit(err);
                }
            );
        }
    }
}
