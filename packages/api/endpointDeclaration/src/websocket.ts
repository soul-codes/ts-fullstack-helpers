import { Schema } from "@ts-fullstack-helpers/schema";
import { BasePathBuilder } from "./common";

export type WebSocketBaseResponse = { status: number; data?: any };

export class WebSocketEndpoint<
  BuildPath extends BasePathBuilder = BasePathBuilder,
  RequestPathParamSchema extends Schema = Schema,
  RequestBodySchema extends Schema = Schema,
  RequestResponseType = never,
  PublishResponseType = never
  > {
  constructor(
    readonly route: string,
    readonly constructRoute: BuildPath,
    readonly requestPathParamSchema: () => RequestPathParamSchema,
    readonly requestBodySchema: () => RequestBodySchema
  ) { }

  get "@requestPathParam"(): RequestPathParamSchema["@nativeType"] {
    return null as any;
  }
  get "@requestBody"(): RequestBodySchema["@nativeType"] {
    return null as any;
  }
  get "@publishResponse"(): PublishResponseType {
    return null as any;
  }
}

export interface ProtoWebSocketEndpoint<
  BuildPath extends BasePathBuilder,
  RequestPathParamSchema extends Schema,
  RequestBodySchema extends Schema
  > {
  <RequestResponseType, PublishResponseType>(): WebSocketEndpoint<
    BuildPath,
    RequestPathParamSchema,
    RequestBodySchema,
    RequestResponseType,
    PublishResponseType
    >;
}

export function defineWebSocketEndpoint<
  BuildPath extends BasePathBuilder,
  RequestPathParamSchema extends Schema,
  RequestBodySchema extends Schema
  >(definition: {
    path: string;
    buildPath: BuildPath;
    pathParamSchema: RequestPathParamSchema;
    requestBodySchema: RequestBodySchema;
  }): ProtoWebSocketEndpoint<
  BuildPath,
  RequestPathParamSchema,
  RequestBodySchema
  > {
  return () =>
    new WebSocketEndpoint(
      definition.path,
      definition.buildPath,
      () => definition.pathParamSchema,
      () => definition.requestBodySchema
    );
}
