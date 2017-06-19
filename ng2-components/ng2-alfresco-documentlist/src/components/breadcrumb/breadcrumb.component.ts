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
import { MinimalNodeEntryEntity, PathElementEntity } from 'alfresco-js-api';
import { DocumentListComponent } from '../document-list.component';

@Component({
    selector: 'alfresco-document-list-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.css']
})
export class DocumentListBreadcrumbComponent implements OnChanges {

    @Input()
    public folderNode: MinimalNodeEntryEntity;

    @Input()
    public target: DocumentListComponent;

    public route: PathElementEntity[] = [];

    @Output()
    public navigate: EventEmitter<any> = new EventEmitter();

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.folderNode) {

            let node: MinimalNodeEntryEntity = changes.folderNode.currentValue;
            if (node) {
                // see https://github.com/Alfresco/alfresco-js-api/issues/139
                let route = <PathElementEntity[]> (node.path.elements || []);
                route.push(<PathElementEntity> {
                    id: node.id,
                    name: node.name
                });
                this.route = route;
            }
        }
    }

    public onRoutePathClick(route: PathElementEntity, event?: Event): void {
        if (event) {
            event.preventDefault();
        }

        if (route) {
            this.navigate.emit({
                value: route
            });

            if (this.target) {
                this.target.loadFolderByNodeId(route.id);
            }
        }
    }
}
