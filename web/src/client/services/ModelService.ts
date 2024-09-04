/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Models } from '../models/Models';
import type { ModelsBase } from '../models/ModelsBase';
import type { ModelsOut } from '../models/ModelsOut';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ModelService {

    /**
     * Read Models
     * @returns ModelsOut Successful Response
     * @throws ApiError
     */
    public static readModels(): CancelablePromise<ModelsOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/model/',
        });
    }

    /**
     * Create Models
     * @returns ModelsBase Successful Response
     * @throws ApiError
     */
    public static createModels({
        requestBody,
    }: {
        requestBody: ModelsBase,
    }): CancelablePromise<ModelsBase> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/model/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Model
     * @returns ModelsOut Successful Response
     * @throws ApiError
     */
    public static readModel({
        providerId,
    }: {
        providerId: number,
    }): CancelablePromise<ModelsOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/model/{provider_id}',
            path: {
                'provider_id': providerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Model
     * @returns Models Successful Response
     * @throws ApiError
     */
    public static deleteModel({
        modelId,
    }: {
        modelId: number,
    }): CancelablePromise<Models> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/model/{model_id}',
            path: {
                'model_id': modelId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Model
     * @returns Models Successful Response
     * @throws ApiError
     */
    public static updateModel({
        modelId,
        requestBody,
    }: {
        modelId: number,
        requestBody: ModelsBase,
    }): CancelablePromise<Models> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/model/{model_id}',
            path: {
                'model_id': modelId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
