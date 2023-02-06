CREATE TYPE "public"."parsing_status_enum" AS ENUM('pending', 'running', 'completed', 'error');
CREATE TABLE "parsing" ("id" SERIAL NOT NULL, "status" "public"."parsing_status_enum" NOT NULL DEFAULT 'pending', "progress" integer NOT NULL DEFAULT '0', "error" text, CONSTRAINT "PK_7b7e02722204d0be0afcbf47c4e" PRIMARY KEY ("id"));
CREATE TABLE "spec" ("id" SERIAL NOT NULL, "category" character varying, "value" character varying NOT NULL, "name" character varying NOT NULL, "productId" integer NOT NULL, CONSTRAINT "PK_750ab65a0e1b51a805499dbfc13" PRIMARY KEY ("id"));
CREATE TABLE "product" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "title" character varying, "name" character varying, "price" character varying, "currency" character varying, "manufacturerId" integer NOT NULL, "parsingId" integer, CONSTRAINT "REL_e21cd021312d7efd1e0b498765" UNIQUE ("parsingId"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "IDX_22f4af809d019d27c2c672c169" ON "product" ("url");
CREATE TABLE "manufacturer" ("id" SERIAL NOT NULL, "brand" character varying NOT NULL, "url" character varying NOT NULL, "parsingId" integer, CONSTRAINT "REL_987e597ac59d154b195fa7c4e5" UNIQUE ("parsingId"), CONSTRAINT "PK_81fc5abca8ed2f6edc79b375eeb" PRIMARY KEY ("id"));
ALTER TABLE "spec" ADD CONSTRAINT "FK_e1ab37b9466f10060a21e7ecea7" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "product" ADD CONSTRAINT "FK_da883f8d02581a40e6059bd7b38" FOREIGN KEY ("manufacturerId") REFERENCES "manufacturer"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "product" ADD CONSTRAINT "FK_e21cd021312d7efd1e0b4987657" FOREIGN KEY ("parsingId") REFERENCES "parsing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "manufacturer" ADD CONSTRAINT "FK_987e597ac59d154b195fa7c4e51" FOREIGN KEY ("parsingId") REFERENCES "parsing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

INSERT INTO "manufacturer" ("id", "brand", "url") VALUES (1, 'LG', 'https://www.lg.com/uk/'), (2, 'Samsung', 'https://www.samsung.com/uk/'), (3, 'Bosch', 'https://www.bosch-home.co.uk/');
