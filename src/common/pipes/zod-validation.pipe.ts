// --- IMPORTS: the tools this pipe needs ----------------------------------------
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
// BadRequestException -> built-in error -> NestJS turns it into a 400 response (bad request)
// Injectable          -> decorator: marks this class so NestJS can inject/use it
// PipeTransform       -> interface: forces us to implement a transform() method (NestJS calls it)

import { ZodError, ZodType } from 'zod';
// ZodError -> the error Zod throws when validation fails (has .issues, a list of problems)
// ZodType  -> the type of ANY zod schema (so the pipe can accept any schema)

// --- CLASS DECLARATION -----------------------------------------------------------
@Injectable()
// tells NestJS "this class is a provider that can be injected" 
export class ZodValidationPipe implements PipeTransform {
  // "implements PipeTransform" = promise to implement transform(). NestJS REQUIRES this method.

  constructor(private readonly schema: ZodType) {}
  // constructor gets ONE argument: the zod schema to validate against.
  // shorthand "private readonly schema" = store it as this.schema and make it injectable.

  // --- transform(): NestJS calls this on incoming data BEFORE the controller ----------
  transform(value: unknown) {
    // "value" = the raw incoming data (e.g. the request body). Typed "unknown" because
    // we don't know what it is yet — validation will decide what it must be.
    try {
      // try = attempt the thing that might fail (validation)
      return this.schema.parse(value);
      // this.schema.parse(value) = validate "value" against our schema.
      // - If valid   -> returns the CLEAN, typed data (we hand this to the controller)
      // - If invalid -> parse() THROWS a ZodError -> we jump to catch below
    } catch (error) {
      // catch = run only if something in try threw
      if (error instanceof ZodError) {
        // check: is the thrown error a ZodError (validation problem)?
        // (instanceof = "is this object an instance of the ZodError class?")
        throw new BadRequestException(
          // throw a NestJS error -> the API responds with HTTP 400 Bad Request
          error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
          // error.issues = array of every problem Zod found (one per failed field)
          // .map() = transform each issue into a readable string, e.g. "price: Expected number"
          //   issue.path  = which field failed (e.g. ["price"] -> "price")
          //   .join('.')  = if nested, join as "a.b.c" -> e.g. "settings.theme"
          //   issue.message = the human-readable reason (e.g. "Expected number")
        );
      }
      throw error;
      // if the error is NOT a ZodError (something else broke), re-throw it as-is
      // so it's handled by NestJS's normal error layer (we don't swallow unexpected errors)
    }
  }
}