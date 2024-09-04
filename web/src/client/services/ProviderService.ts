/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ModelProvider } from '../models/ModelProvider';
import type { ModelProviderCreate } from '../models/ModelProviderCreate';
import type { ModelProviderUpdate } from '../models/ModelProviderUpdate';
import type { ModelProviderWithModelsListOut } from '../models/ModelProviderWithModelsListOut';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ProviderService {

    /**
     * Create Provider
     * @returns ModelProvider Successful Response
     * @throws ApiError
     */
    public static createProvider({
        requestBody,
    }: {
        requestBody: ModelProviderCreate,
    }): CancelablePromise<ModelProvider> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/provider/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Provider
     * @returns ModelProvider Successful Response
     * @throws ApiError
     */
    public static readProvider({
        modelProviderId,
    }: {
        modelProviderId: number,
    }): CancelablePromise<ModelProvider> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/provider/{model_provider_id}',
            path: {
                'model_provider_id': modelProviderId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Provider
     * @returns ModelProvider Successful Response
     * @throws ApiError
     */
    public static updateProvider({
        modelProviderId,
        requestBody,
    }: {
        modelProviderId: number,
        requestBody: ModelProviderUpdate,
    }): CancelablePromise<ModelProvider> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/provider/{model_provider_id}',
            path: {
                'model_provider_id': modelProviderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Provider
     * @returns ModelProvider Successful Response
     * @throws ApiError
     */
    public static deleteProvider({
        modelProviderId,
    }: {
        modelProviderId: number,
    }): CancelablePromise<ModelProvider> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/provider/{model_provider_id}',
            path: {
                'model_provider_id': modelProviderId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Provider With Model List
     * @returns ModelProviderWithModelsListOut Successful Response
     * @throws ApiError
     */
    public static readProviderWithModelList({
        modelProviderId,
    }: {
        modelProviderId: number,
    }): CancelablePromise<ModelProviderWithModelsListOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/provider/withmodels/{model_provider_id}',
            path: {
                'model_provider_id': modelProviderId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
