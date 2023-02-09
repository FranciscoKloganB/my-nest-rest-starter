const REQUEST_ID_TOKEN_HEADER = "x-request-id"
const FORWARDED_FOR_TOKEN_HEADER = "x-forwarded-for"
const VALIDATION_PIPE_OPTIONS = {
  // When `true` and combined with `whiteList: true` stops processing of requests,
  // when they specify unknown props. However DTOs with default values which are not
  // marked as API Properties fail automatically, e.g.: RegisterInput.roles from
  // `auth-register-input.dto.ts;
  forbidNonWhitelisted: false,

  // With the options above, we ensure received objects have the desired shape
  // However, only after transforming are they guaranteed to be of the specified class/type
  transform: true,

  transformOptions: {
    // When `true` avoids using type decorators on DTO class, e.g.: as @Type(() => Number)
    // However, things like "username": 12345, will be casted to "username": "12345"
    // Which is less strict;
    enableImplicitConversion: false,
  },
  // When set to true, strips all unspecified key:value props from request bodies
  whitelist: true,
}

export { FORWARDED_FOR_TOKEN_HEADER, REQUEST_ID_TOKEN_HEADER, VALIDATION_PIPE_OPTIONS }
