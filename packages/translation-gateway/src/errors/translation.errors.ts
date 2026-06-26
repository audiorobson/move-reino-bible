export class TranslationProviderNotConfiguredError extends Error {
  constructor(message = "Provedor de tradução não configurado.") {
    super(message);
    this.name = "TranslationProviderNotConfiguredError";
  }
}

export class TranslationProviderNotImplementedError extends Error {
  constructor(provider: string) {
    super(`Provider ainda não implementado nesta versão: ${provider}`);
    this.name = "TranslationProviderNotImplementedError";
  }
}

export class TranslationApiKeyInvalidError extends Error {
  constructor(message = "Chave API inválida. Verifique a chave cadastrada.") {
    super(message);
    this.name = "TranslationApiKeyInvalidError";
  }
}

export class TranslationRateLimitError extends Error {
  constructor(message = "Limite do provedor atingido. Tente novamente mais tarde.") {
    super(message);
    this.name = "TranslationRateLimitError";
  }
}

export class TranslationUnsupportedLanguageError extends Error {
  constructor(message = "Idioma não suportado por este provedor.") {
    super(message);
    this.name = "TranslationUnsupportedLanguageError";
  }
}

export class TranslationLocalEngineUnavailableError extends Error {
  constructor(message = "O tradutor local suporta apenas Inglês → Português BR nesta versão.") {
    super(message);
    this.name = "TranslationLocalEngineUnavailableError";
  }
}

export class TranslationTextTooLongError extends Error {
  constructor(max = 5000) {
    super(`Texto excede o limite de ${max} caracteres para tradução pontual.`);
    this.name = "TranslationTextTooLongError";
  }
}
