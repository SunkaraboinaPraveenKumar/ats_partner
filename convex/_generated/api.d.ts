/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as action from "../action.js";
import type * as auth from "../auth.js";
import type * as files from "../files.js";
import type * as jobs from "../jobs.js";
import type * as langchain_db from "../langchain/db.js";
import type * as matching from "../matching.js";
import type * as messages from "../messages.js";
import type * as profiles from "../profiles.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  action: typeof action;
  auth: typeof auth;
  files: typeof files;
  jobs: typeof jobs;
  "langchain/db": typeof langchain_db;
  matching: typeof matching;
  messages: typeof messages;
  profiles: typeof profiles;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
