/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UploadStatus } from './UploadStatus';

export type Upload = {
    name: string;
    description: string;
    id?: (number | null);
    owner_id?: (number | null);
    last_modified?: string;
    status: UploadStatus;
};

