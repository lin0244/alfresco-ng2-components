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

import { Injectable } from '@angular/core';
import { AlfrescoApiService, LogService } from 'ng2-alfresco-core';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class RatingService {

    constructor(private apiService: AlfrescoApiService, private logService: LogService) {

    }

    public getRating(nodeId: string, ratingType: any): any {
        return Observable.fromPromise(this.apiService.getInstance().core.ratingsApi.getRating(nodeId, ratingType))
            .map((res) => res)
            .catch(this.handleError);
    }

    public postRating(nodeId: string, ratingType: string, vote: any): any {
        let ratingBody = {
            id: ratingType,
            myRating: vote
        };
        return Observable.fromPromise(this.apiService.getInstance().core.ratingsApi.rate(nodeId, ratingBody))
            .map((res) => res)
            .catch(this.handleError);
    }

    public deleteRating(nodeId: string, ratingId: string): any {
        return Observable.fromPromise(this.apiService.getInstance().core.ratingsApi.removeRating(nodeId, ratingId))
            .map((res) => res)
            .catch(this.handleError);
    }

    private handleError(error: Response): ErrorObservable<string | Response> {
        this.logService.error(error);
        return Observable.throw(error || 'Server error');
    }
}
