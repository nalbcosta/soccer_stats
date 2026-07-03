declare module "fastify-plugin" {
  import type { FastifyPluginAsync, FastifyPluginCallback } from "fastify";

  export default function fp<T = Record<string, never>>(
    plugin: FastifyPluginCallback<T> | FastifyPluginAsync<T>
  ): FastifyPluginAsync<T>;
}
