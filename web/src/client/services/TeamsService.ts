/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TeamChat } from '../models/TeamChat';
import type { TeamCreate } from '../models/TeamCreate';
import type { TeamOut } from '../models/TeamOut';
import type { TeamsOut } from '../models/TeamsOut';
import type { TeamUpdate } from '../models/TeamUpdate';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TeamsService {

    /**
     * Read Teams
     * Retrieve teams
     * @returns TeamsOut Successful Response
     * @throws ApiError
     */
    public static readTeams({
        skip,
        limit = 100,
    }: {
        skip?: number,
        limit?: number,
    }): CancelablePromise<TeamsOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teams/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Team
     * Create new team and it's team leader
     * @returns TeamOut Successful Response
     * @throws ApiError
     */
    public static createTeam({
        requestBody,
    }: {
        requestBody: TeamCreate,
    }): CancelablePromise<TeamOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/teams/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Team
     * Get team by ID.
     * @returns TeamOut Successful Response
     * @throws ApiError
     */
    public static readTeam({
        id,
    }: {
        id: number,
    }): CancelablePromise<TeamOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/teams/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Team
     * Update a team.
     * @returns TeamOut Successful Response
     * @throws ApiError
     */
    public static updateTeam({
        id,
        requestBody,
    }: {
        id: number,
        requestBody: TeamUpdate,
    }): CancelablePromise<TeamOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/teams/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Team
     * Delete a team.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteTeam({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/teams/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Stream
     * Stream a response to a user's input.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static stream({
        id,
        threadId,
        requestBody,
    }: {
        id: number,
        threadId: string,
        requestBody: TeamChat,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/teams/{id}/stream/{thread_id}',
            path: {
                'id': id,
                'thread_id': threadId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
