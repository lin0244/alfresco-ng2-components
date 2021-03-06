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

import { DebugElement, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { UploadButtonComponent } from './upload-button.component';
import { CoreModule, AlfrescoTranslationService, AlfrescoContentService} from 'ng2-alfresco-core';
import { TranslationMock } from '../assets/translation.service.mock';
import { UploadService } from '../services/upload.service';
import { Observable } from 'rxjs/Rx';

describe('UploadButtonComponent', () => {

    let file = {name: 'fake-name-1', size: 10, webkitRelativePath: 'fake-folder1/fake-name-1.json'};
    let fakeEvent = {
        currentTarget: {
            files: [file]
        },
        target: {value: 'fake-name-1'}
    };

    let fakeFolderNodeWithoutPermission = {
        allowableOperations: [
            'update'
        ],
        isFolder: true,
        name: 'Folder Fake Name',
        nodeType: 'cm:folder'
    };

    let fakeFolderNodeWithPermission = {
        allowableOperations: [
            'create',
            'update'
        ],
        isFolder: true,
        name: 'Folder Fake Name',
        nodeType: 'cm:folder'
    };

    let component: UploadButtonComponent;
    let fixture: ComponentFixture<UploadButtonComponent>;
    let debug: DebugElement;
    let element: HTMLElement;
    let uploadService: UploadService;
    let contentService: AlfrescoContentService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CoreModule.forRoot()
            ],
            declarations: [
                UploadButtonComponent
            ],
            providers: [
                UploadService,
                {provide: AlfrescoTranslationService, useClass: TranslationMock}
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        window['componentHandler'] = null;

        fixture = TestBed.createComponent(UploadButtonComponent);
        uploadService = TestBed.get(UploadService);
        contentService = TestBed.get(AlfrescoContentService);

        debug = fixture.debugElement;
        element = fixture.nativeElement;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    it('should render upload-single-file button as default', () => {
        component.multipleFiles = false;
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file')).toBeDefined();
    });

    it('should render upload-multiple-file button if multipleFiles is true', () => {
        component.multipleFiles = true;
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-multiple-files')).toBeDefined();
    });

    it('should render an uploadFolder button if uploadFolder is true', () => {
        component.uploadFolders = true;
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#uploadFolder')).toBeDefined();
    });

    it('should emit the permissionEvent, without permission and disableWithNoPermission false', (done) => {
        component.rootFolderId = '-my-';
        component.disableWithNoPermission = false;

        spyOn(component, 'getFolderNode').and.returnValue(Observable.of(fakeFolderNodeWithoutPermission));

        fixture.detectChanges();

        component.permissionEvent.subscribe( permission => {
            expect(permission).toBeDefined();
            expect(permission.type).toEqual('content');
            expect(permission.action).toEqual('upload');
            expect(permission.permission).toEqual('create');
            done();
        });

        component.onFilesAdded(fakeEvent);
    });

    it('should show the disabled button, without permission and disableWithNoPermission true', () => {
        component.rootFolderId = '-my-';
        component.disableWithNoPermission = true;

        spyOn(component, 'getFolderNode').and.returnValue(Observable.of(fakeFolderNodeWithoutPermission));

        component.onFilesAdded(fakeEvent);
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file')).toBeDefined();
        expect(compiled.querySelector('#upload-single-file').disabled).toBe(true);
    });

    it('should show the enabled button with permission and disableWithNoPermission true', () => {
        component.rootFolderId = '-my-';
        component.disableWithNoPermission = true;

        spyOn(component, 'getFolderNode').and.returnValue(Observable.of(fakeFolderNodeWithPermission));

        component.ngOnChanges({ rootFolderId: new SimpleChange(null, component.rootFolderId, true) });
        component.onFilesAdded(fakeEvent);
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file')).toBeDefined();
        expect(compiled.querySelector('#upload-single-file').disabled).toBe(false);
    });

    it('should show the enabled button with permission and disableWithNoPermission false', () => {
        component.rootFolderId = '-my-';
        component.disableWithNoPermission = false;

        spyOn(component, 'getFolderNode').and.returnValue(Observable.of(fakeFolderNodeWithPermission));

        component.ngOnChanges({ rootFolderId: new SimpleChange(null, component.rootFolderId, true) });
        component.onFilesAdded(fakeEvent);
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file')).toBeDefined();
        expect(compiled.querySelector('#upload-single-file').disabled).toBe(false);
    });

    it('should call uploadFile with the default root folder', () => {
        component.rootFolderId = '-root-';
        component.currentFolderPath = '/root-fake-/sites-fake/folder-fake';
        component.onSuccess = null;

        spyOn(component, 'getFolderNode').and.returnValue(Observable.of(fakeFolderNodeWithPermission));

        component.ngOnChanges({ rootFolderId: new SimpleChange(null, component.rootFolderId, true) });
        uploadService.uploadFilesInTheQueue = jasmine.createSpy('uploadFilesInTheQueue');

        fixture.detectChanges();

        component.onFilesAdded(fakeEvent);
        expect(uploadService.uploadFilesInTheQueue).toHaveBeenCalledWith(null);
    });

    it('should call uploadFile with a custom root folder', () => {
        component.currentFolderPath = '/root-fake-/sites-fake/folder-fake';
        component.rootFolderId = '-my-';
        component.onSuccess = null;

        spyOn(component, 'getFolderNode').and.returnValue(Observable.of(fakeFolderNodeWithPermission));
        component.ngOnChanges({ rootFolderId: new SimpleChange(null, component.rootFolderId, true) });

        uploadService.uploadFilesInTheQueue = jasmine.createSpy('uploadFilesInTheQueue');

        fixture.detectChanges();

        component.onFilesAdded(fakeEvent);
        expect(uploadService.uploadFilesInTheQueue).toHaveBeenCalledWith(null);
    });

    it('should create a folder and emit an File uploaded event', (done) => {
        component.rootFolderId = '-my-';
        component.currentFolderPath = '/fake-root-path';

        spyOn(contentService, 'createFolder').and.returnValue(Observable.of(true));
        spyOn(component, 'getFolderNode').and.returnValue(Observable.of(fakeFolderNodeWithPermission));

        component.ngOnChanges({ rootFolderId: new SimpleChange(null, component.rootFolderId, true) });
        fixture.detectChanges();

        component.onSuccess.subscribe(e => {
            expect(e.value).toEqual('File uploaded');
            done();
        });

        spyOn(component, 'uploadFiles').and.callFake(() => {
            component.onSuccess.emit({
                value: 'File uploaded'
            });
        });
        component.onDirectoryAdded(fakeEvent);
    });

    it('should by default the title of the button get from the JSON file', () => {
        let compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();
        component.uploadFolders = false;
        component.multipleFiles = false;

        expect(compiled.querySelector('#upload-single-file-label').textContent).toEqual('FILE_UPLOAD.BUTTON.UPLOAD_FILE');

        component.multipleFiles = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-multiple-file-label').textContent).toEqual('FILE_UPLOAD.BUTTON.UPLOAD_FILE');

        component.uploadFolders = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#uploadFolder-label').textContent).toEqual('FILE_UPLOAD.BUTTON.UPLOAD_FOLDER');
    });

    it('should staticTitle properties change the title of the upload buttons', () => {
        let compiled = fixture.debugElement.nativeElement;
        component.staticTitle = 'test-text';
        component.uploadFolders = false;
        component.multipleFiles = false;

        fixture.detectChanges();
        expect(compiled.querySelector('#upload-single-file-label-static').textContent).toEqual('test-text');

        component.multipleFiles = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#upload-multiple-file-label-static').textContent).toEqual('test-text');

        component.uploadFolders = true;
        fixture.detectChanges();
        expect(compiled.querySelector('#uploadFolder-label-static').textContent).toEqual('test-text');
    });
});
