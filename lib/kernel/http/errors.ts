export class BadRequestError extends Error {
  readonly status = 400 as const;
  constructor(message = "İstek geçersiz.") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403 as const;
  constructor(message = "Bu işlem için yetki yok.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  readonly status = 404 as const;
  constructor(message = "Kayıt bulunamadı.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class GoneError extends Error {
  readonly status = 410 as const;
  constructor(message = "Bu yüzey üretimde kapalı.") {
    super(message);
    this.name = "GoneError";
  }
}

export class PayloadTooLargeError extends Error {
  readonly status = 413 as const;
  constructor(message = "Yük tavanı aşıldı.") {
    super(message);
    this.name = "PayloadTooLargeError";
  }
}

export class ConflictError extends Error {
  readonly status = 409 as const;
  constructor(message = "İstek çakışması.") {
    super(message);
    this.name = "ConflictError";
  }
}

export class ServiceUnavailableError extends Error {
  readonly status = 503 as const;
  constructor(message = "Hizmet geçici olarak kapalı.") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}
