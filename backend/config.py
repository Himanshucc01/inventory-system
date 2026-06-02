from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/inventory_db"
    SECRET_KEY: str = "changeme-in-production"
    DEBUG: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
