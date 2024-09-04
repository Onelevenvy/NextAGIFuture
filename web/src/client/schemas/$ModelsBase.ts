/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ModelsBase = {
    properties: {
        ai_model_name: {
            type: 'string',
            isRequired: true,
            pattern: '^[a-zA-Z0-9/_:.-]{1,64}$',
        },
        provider_id: {
            type: 'number',
            isRequired: true,
        },
    },
} as const;
