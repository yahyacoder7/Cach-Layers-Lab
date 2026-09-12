// src/common/http-errors.ts
// The single "big father" import for every HTTP exception the app uses.
// 
// WHY: instead of importing error classes from '@nestjs/common' in every file,
// files do ONE import: `import * as HttpErrors from '../common/http-errors';`
// then use `new HttpErrors.NotFoundException('...')`, etc.
//
// To add a new status code later: add it here ONCE, no other file changes.
export {
  InternalServerErrorException, //500 - Server side errors
  BadRequestException,   // 400 - the request itself is invalid
  UnauthorizedException, // 401 - not authenticated
  ForbiddenException,    // 403 - authenticated but not allowed
  NotFoundException,     // 404 - resource does not exist
  ConflictException,     // 409 - conflicts with existing data (e.g. duplicate sku)
  HttpException,         // base class - NestJS's generic exception
} from '@nestjs/common';