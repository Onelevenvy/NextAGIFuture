/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UploadOut = {
    properties: {
        name: {
            type: 'string',
            isRequired: true,
        },
        description: {
            type: 'string',
            isRequired: true,
        },
        id: {
            type: 'number',
            isRequired: true,
        },
        last_modified: {
            type: 'string',
            isRequired: true,
            format: 'date-time',
        },
        status: {
            type: 'UploadStatus',
            isRequired: true,
        },
    },
} as const;
