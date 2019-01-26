import { validate } from "@ts-fullstack-helpers/schema";
import {
  Application,
  RequestHandler,
  Request,
  Response,
  NextFunction
} from "express";
import { HttpEndpoint } from "@ts-fullstack-helpers/define-endpoint";

export class ExpressEndpointApplication<Endpoint extends HttpEndpoint> {
  constructor(
    readonly app: Application,
    readonly endpoint: Endpoint,
    readonly pathPrefix: string = ""
  ) {}

  use(...handlers: RequestHandler[]) {
    console.log(
      `Registering ${this.endpoint.method.toUpperCase()} ${this.pathPrefix +
        this.endpoint.route}`
    );
    this.app[this.endpoint.method](
      this.pathPrefix + this.endpoint.route,
      ...handlers
    );
  }

  wrap(
    handler: (
      $: {
        params: Endpoint["@requestPathParam"];
        body: Endpoint["@requestBody"];
        query: Endpoint["@requestPathQuery"];
        reply: (
          response:
            | Endpoint["@successResponse"]
            | (Endpoint["@errorResponse"] extends void
                ? never
                : Endpoint["@errorResponse"])
        ) => void;
      },
      req: Request,
      res: Response,
      next: NextFunction
    ) => void | Promise<void>
  ): RequestHandler {
    return async (req, res, next) => {
      try {
        const params: Endpoint["@requestPathParam"] = req.params;
        const paramValidation = validate(params, this.endpoint.paramSchema());
        if (!paramValidation.ok) {
          res.status(400);
          res.send({
            errorCode: "bad-request",
            badEntity: "path-param",
            details: paramValidation.error
          });
          return;
        }

        const query: Endpoint["@requestPathQuery"] = req.query;
        const queryValidation = validate(query, this.endpoint.querySchema());
        if (!queryValidation.ok) {
          res.status(400);
          res.send({
            errorCode: "bad-request",
            badEntity: "path-query",
            details: queryValidation.error
          });
          return;
        }

        const body: Endpoint["@requestBody"] = req.body;
        const bodyValidation = validate(body, this.endpoint.requestSchema());
        if (!bodyValidation.ok) {
          res.status(400);
          res.send({
            errorCode: "bad-request",
            badEntity: "body",
            details: bodyValidation.error
          });
          return;
        }

        await handler(
          {
            params,
            body,
            query,
            reply(
              result: Endpoint["@successResponse"] | Endpoint["@errorResponse"]
            ) {
              res.status(result.status);
              res.send(result.data);
            }
          },
          req,
          res,
          next
        );
      } catch (error) {
        next(error);
      }
    };
  }
}
