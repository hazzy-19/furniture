"""Application settings loaded from environment variables and the .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Aurelle Home API"
    database_url: str

    # claudinary configuration
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None

    # Auth & Security configuration
    secret_key: str = "insecure-dev-secret-key-change-in-env"
    access_token_expire_minutes: int = 480
    cookie_secure: bool = False
    frontend_origins: str = "http://localhost:5173"
    environment: str = "development"

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated front-end origins into a list."""
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
