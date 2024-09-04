/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SkillCreate = {
    properties: {
        name: {
            type: 'string',
            isRequired: true,
        },
        description: {
            type: 'string',
            isRequired: true,
        },
        icon: {
            type: 'any-of',
            contains: [{
                type: 'string',
            }, {
                type: 'null',
            }],
        },
        managed: {
            type: 'boolean',
        },
        tool_definition: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
            isRequired: true,
        },
    },
} as const;
