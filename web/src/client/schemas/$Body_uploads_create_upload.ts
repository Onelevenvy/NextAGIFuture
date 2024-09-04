/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Body_uploads_create_upload = {
    properties: {
        name: {
            type: 'string',
            isRequired: true,
        },
        description: {
            type: 'string',
            isRequired: true,
        },
        file: {
            type: 'binary',
            isRequired: true,
            format: 'binary',
        },
        chunk_size: {
            type: 'number',
            isRequired: true,
        },
        chunk_overlap: {
            type: 'number',
            isRequired: true,
        },
    },
} as const;
