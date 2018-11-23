import { Schema, any, AnySchema } from "@ts-fullstack-helpers/schema";
import { BasePathBuilder } from "./common";

export type HttpMethod = "post" | "get" | "put" | "delete";
export type HttpBaseResponse = { status: number; data?: any };

export class HttpEndpoint<
  Method extends HttpMethod = HttpMethod,
  BuildPath extends BasePathBuilder = BasePathBuilder,
  RequestPathParamSchema extends Schema = Schema,
  RequestPathQuerySchema extends Schema = Schema,
  RequestBodySchema extends Schema = Schema,
  SuccessResponseType extends HttpBaseResponse = HttpBaseResponse,
  ErrorResponseType extends HttpBaseResponse = HttpBaseResponse
  > {
  constructor(
    readonly method: Method,
    readonly route: string,
    readonly constructRoute: BuildPath,
    readonly paramSchema: () => RequestPathParamSchema,
    readonly querySchema: () => RequestPathQuerySchema,
    readonly requestSchema: () => RequestBodySchema
  ) { }

  get "@requestPathParam"(): RequestPathParamSchema["@nativeType"] {
    return null as any;
  }
  get "@requestPathQuery"(): RequestPathQuerySchema["@nativeType"] {
    return null as any;
  }
  get "@requestBody"(): RequestBodySchema["@nativeType"] {
    return null as any;
  }
  get "@successResponse"(): SuccessResponseType {
    return null as any;
  }
  get "@errorResponse"(): ErrorResponseType {
    return null as any;
  }
  get "@response"():
    | SuccessResponseType
    | (ErrorResponseType extends void ? never : ErrorResponseType) {
    return null as any;
  }
}

export interface ProtoHttpEndpoint<
  Method extends HttpMethod,
  BuildPath extends BasePathBuilder,
  RequestPathParamSchema extends Schema,
  RequestPathQuerySchema extends Schema,
  RequestBodySchema extends Schema
  > {
  <
    SuccessResponseType extends HttpBaseResponse,
    ErrorResponseType extends HttpBaseResponse = never
    >(): HttpEndpoint<
    Method,
    BuildPath,
    RequestPathParamSchema,
    RequestPathQuerySchema,
    RequestBodySchema,
    SuccessResponseType,
    ErrorResponseType
    >;
}

export function defineHttpEndpoint<
  Method extends HttpMethod,
  ConstructRoute extends BasePathBuilder,
  PathParamSchema extends Schema = AnySchema,
  RequestBodySchema extends Schema = AnySchema,
  PathQuerySchema extends Schema = AnySchema
  >(definition: {
    method: Method;
    path: string;
    buildPath: ConstructRoute;
    pathParamSchema?: PathParamSchema;
    pathQuerySchema?: PathQuerySchema;
    requestBodySchema?: RequestBodySchema;
  }): ProtoHttpEndpoint<
  Method,
  ConstructRoute,
  PathParamSchema,
  PathQuerySchema,
  RequestBodySchema
  > {
  return () =>
    new HttpEndpoint(
      definition.method,
      definition.path,
      definition.buildPath,
      () => definition.pathParamSchema || (any() as any),
      () => definition.pathQuerySchema || (any() as any),
      () => definition.requestBodySchema || (any() as any)
    );
}
